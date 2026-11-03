var CREW_SESSION_SECONDS = 1800;
var CREW_PASSWORD_ITERATIONS = 120000;
var CREW_LOGIN_LIMIT = 5;

function doPost(e) {
  try {
    var rawBody = e && e.postData && e.postData.contents
      ? e.postData.contents
      : "";
    if (rawBody.length > 8192) {
      return crewJson_({
        success: false,
        statusCode: 413,
        message: "Request body is too large."
      });
    }

    var payload;
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch (parseError) {
      return crewJson_({
        success: false,
        statusCode: 400,
        message: "Request body is not valid JSON."
      });
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return crewJson_({
        success: false,
        statusCode: 400,
        message: "Request body is not valid."
      });
    }

    var action = String(payload.action || "");

    if (action === "login") {
      return crewLogin_(payload);
    }

    if (action === "validate" || action === "dashboard" || action === "logout") {
      var session = getCrewSession_(payload.token);
      if (!session) {
        return crewJson_({
          success: false,
          statusCode: 401,
          message: "Your session has expired. Please sign in again."
        });
      }

      if (action === "validate") {
        return crewJson_({ success: true });
      }

      if (action === "logout") {
        CacheService.getScriptCache().remove(session.cacheKey);
        return crewJson_({ success: true });
      }

      return crewJson_({
        success: true,
        dashboard: getCrewDashboard_()
      });
    }

    return crewJson_({
      success: false,
      statusCode: 400,
      message: "Unknown crew request."
    });
  } catch (error) {
    console.error("CINERO crew service error:", error);
    return crewJson_({
      success: false,
      statusCode: 500,
      message: "The crew service could not complete the request."
    });
  }
}

function doGet() {
  return crewJson_({
    success: true,
    message: "CINERO crew service is running."
  });
}

function setupCrewCredentials() {
  var properties = PropertiesService.getScriptProperties();
  var username = String(properties.getProperty("CREW_USERNAME") || "").trim();
  var password = properties.getProperty("CREW_INITIAL_PASSWORD") || "";

  if (!username || !password) {
    throw new Error("Set CREW_USERNAME and CREW_INITIAL_PASSWORD in Script Properties before setup.");
  }
  if (password.length < 10 || password.length > 256) {
    throw new Error("The initial crew password must be between 10 and 256 characters.");
  }

  var salt = Utilities.getUuid() + Utilities.getUuid();
  var hash = passwordHash_(password, salt);
  properties.setProperties({
    CREW_USERNAME: username,
    CREW_PASSWORD_SALT: salt,
    CREW_PASSWORD_HASH: hash
  });
  properties.deleteProperty("CREW_INITIAL_PASSWORD");
}

function authorizeCrewSpreadsheetAccess() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) {
    throw new Error("Set SPREADSHEET_ID in Script Properties before authorizing.");
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var hasUniversitySheet = Boolean(spreadsheet.getSheetByName("University Registrations"));
  var hasSchoolSheet = Boolean(spreadsheet.getSheetByName("School Registrations"));
  if (!hasUniversitySheet && !hasSchoolSheet) {
    throw new Error("The spreadsheet does not contain either expected registration sheet.");
  }
  Logger.log("CINERO registration spreadsheet access authorized.");
}

function crewLogin_(payload) {
  var properties = PropertiesService.getScriptProperties();
  var username = String(payload.username || "").trim();
  var password = typeof payload.password === "string" ? payload.password : "";
  var account = {
    username: String(properties.getProperty("CREW_USERNAME") || ""),
    hash: String(properties.getProperty("CREW_PASSWORD_HASH") || ""),
    salt: String(properties.getProperty("CREW_PASSWORD_SALT") || "")
  };

  if (!account.username || !account.hash || !account.salt) {
    return crewJson_({
      success: false,
      statusCode: 503,
      message: "Crew credentials have not been configured."
    });
  }
  if (!username || !password || username.length > 128 || password.length > 256) {
    return crewJson_({
      success: false,
      statusCode: 400,
      message: "Enter a valid username and password."
    });
  }

  var cache = CacheService.getScriptCache();
  var attemptKey = "crew-login-attempts-" + digest_(username.toLowerCase());
  var loginLock = LockService.getScriptLock();
  loginLock.waitLock(5000);
  try {
    var attempts = Number(cache.get(attemptKey) || 0);
    if (attempts >= CREW_LOGIN_LIMIT) {
      return crewJson_({
        success: false,
        statusCode: 429,
        message: "Too many unsuccessful attempts. Try again in 15 minutes."
      });
    }
    cache.put(attemptKey, String(attempts + 1), 900);
  } finally {
    loginLock.releaseLock();
  }

  var usernameMatches = constantTimeEqual_(username.toLowerCase(), account.username.toLowerCase());
  var passwordMatches = usernameMatches &&
    constantTimeEqual_(passwordHash_(password, account.salt), account.hash);
  if (!usernameMatches || !passwordMatches) {
    return crewJson_({
      success: false,
      statusCode: 401,
      message: "The username or password is incorrect."
    });
  }

  cache.remove(attemptKey);
  var token = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
  var cacheKey = sessionCacheKey_(token);
  cache.put(cacheKey, JSON.stringify({
    username: account.username,
    expiresAt: Date.now() + CREW_SESSION_SECONDS * 1000
  }), CREW_SESSION_SECONDS);

  return crewJson_({
    success: true,
    token: token,
    expiresIn: CREW_SESSION_SECONDS
  });
}

function getCrewSession_(token) {
  if (typeof token !== "string" || !token || token.length > 256) {
    return null;
  }

  var cacheKey = sessionCacheKey_(token);
  var cached = CacheService.getScriptCache().get(cacheKey);
  if (!cached) {
    return null;
  }

  var session = JSON.parse(cached);
  var configuredUsername = String(
    PropertiesService.getScriptProperties().getProperty("CREW_USERNAME") || ""
  );
  if (
    !session ||
    session.expiresAt <= Date.now() ||
    session.username !== configuredUsername
  ) {
    CacheService.getScriptCache().remove(cacheKey);
    return null;
  }

  return { username: session.username, cacheKey: cacheKey };
}

function getCrewDashboard_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not configured.");
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var records = [];
  var sheetNames = ["University Registrations", "School Registrations"];
  var foundSheet = false;

  sheetNames.forEach(function (sheetName) {
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      return;
    }
    foundSheet = true;

    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    if (lastRow < 1 || lastColumn < 1) {
      throw new Error("Registration sheet headers are missing.");
    }

    var values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
    var headers = values[0].map(function (header) {
      return String(header || "").trim().toLowerCase();
    });
    var category = sheetName === "School Registrations" ? "Inter-School" : "Inter-University";
    var institutionHeader = category === "Inter-School" ? "school name" : "university / institute";
    var columns = {
      timestamp: headers.indexOf("timestamp"),
      referenceId: headers.indexOf("reference id"),
      category: headers.indexOf("category"),
      teamName: headers.indexOf("team name"),
      teamSize: headers.indexOf("team size"),
      institution: headers.indexOf(institutionHeader)
    };

    if (
      columns.timestamp < 0 ||
      columns.referenceId < 0 ||
      columns.category < 0 ||
      columns.teamName < 0 ||
      columns.teamSize < 0 ||
      columns.institution < 0
    ) {
      throw new Error("A registration sheet does not contain its expected headers.");
    }

    for (var rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
      var row = values[rowIndex];
      var isEmpty = row.every(function (value) {
        return value === "" || value === null;
      });
      if (isEmpty) {
        continue;
      }

      var timestamp = normalizeTimestamp_(row[columns.timestamp]);
      var teamSize = parseTeamSize_(row[columns.teamSize]);
      records.push({
        registrationId: safeCellText_(row[columns.referenceId]),
        category: category,
        categoryLabel: safeCellText_(row[columns.category]) || category + " Category",
        teamName: safeCellText_(row[columns.teamName]) || "Unnamed team",
        teamSize: teamSize,
        institution: safeCellText_(row[columns.institution]),
        registrationDate: timestamp.value,
        registrationDay: timestamp.day
      });
    }
  });

  if (!foundSheet) {
    throw new Error("The expected registration sheets were not found.");
  }

  var universityCount = 0;
  var schoolCount = 0;
  var dailyCounts = {};
  var participantCount = 0;
  var participantCountIsAccurate = true;

  records.forEach(function (record) {
    if (record.category === "Inter-University") {
      universityCount += 1;
    } else {
      schoolCount += 1;
    }

    if (record.teamSize === null) {
      participantCountIsAccurate = false;
    } else {
      participantCount += record.teamSize;
    }

    if (record.registrationDay) {
      dailyCounts[record.registrationDay] = (dailyCounts[record.registrationDay] || 0) + 1;
    }
  });

  var trends = Object.keys(dailyCounts).sort().map(function (day) {
    return { date: day, count: dailyCounts[day] };
  });
  records.sort(function (left, right) {
    var leftTime = new Date(left.registrationDate).getTime();
    var rightTime = new Date(right.registrationDate).getTime();
    if (isNaN(leftTime)) {
      leftTime = -Infinity;
    }
    if (isNaN(rightTime)) {
      rightTime = -Infinity;
    }
    return rightTime - leftTime;
  });

  return {
    stats: {
      totalTeams: records.length,
      interUniversity: universityCount,
      interSchool: schoolCount,
      totalParticipants: participantCountIsAccurate ? participantCount : null
    },
    trends: trends,
    records: records,
    lastUpdated: new Date().toISOString()
  };
}

function parseTeamSize_(value) {
  var text = String(value === null || value === undefined ? "" : value).trim();
  if (!/^\d+$/.test(text)) {
    return null;
  }
  var teamSize = Number(text);
  return teamSize >= 4 && teamSize <= 15 ? teamSize : null;
}

function normalizeTimestamp_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return {
      value: value.toISOString(),
      day: Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd")
    };
  }

  var text = safeCellText_(value);
  if (!text) {
    return { value: "", day: "" };
  }

  var parsed = new Date(text);
  if (isNaN(parsed.getTime())) {
    return { value: text, day: "" };
  }
  return {
    value: parsed.toISOString(),
    day: Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM-dd")
  };
}

function safeCellText_(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function passwordHash_(password, salt) {
  var passwordBytes = Utilities.newBlob(password).getBytes();
  var saltBytes = Utilities.newBlob(salt).getBytes();
  var block = saltBytes.concat([0, 0, 0, 1]);
  var digest = Utilities.computeHmacSha256Signature(block, passwordBytes);
  var result = digest.slice();

  for (var iteration = 1; iteration < CREW_PASSWORD_ITERATIONS; iteration += 1) {
    digest = Utilities.computeHmacSha256Signature(digest, passwordBytes);
    for (var index = 0; index < result.length; index += 1) {
      var byte = (result[index] ^ digest[index]) & 255;
      result[index] = byte > 127 ? byte - 256 : byte;
    }
  }
  return Utilities.base64Encode(result);
}

function digest_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
  );
}

function sessionCacheKey_(token) {
  return "crew-session-" + digest_(token);
}

function constantTimeEqual_(left, right) {
  var difference = left.length ^ right.length;
  var maxLength = Math.max(left.length, right.length);
  for (var index = 0; index < maxLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function crewJson_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
