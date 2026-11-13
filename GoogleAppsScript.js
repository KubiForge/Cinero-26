
var SPREADSHEET_ID = "18sPX0nKl4IKDqBf1zRhDSpfNcGUStvw-DhCddBmwoQw";

function doPost(e) {
  var requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonResponse({
      status: "error",
      message: String(error.message || "Invalid request body.")
    });
  }

  if (String(requestData.action || "").toLowerCase() === "galleryupload") {
    return handleGalleryUpload(requestData);
  }

  var registrationOpenTime = new Date("2026-10-27T00:00:00+05:30").getTime();
  var registrationCloseTime = new Date("2026-12-15T00:00:00+05:30").getTime();
  if (Date.now() < registrationOpenTime) {
    return jsonResponse({
      status: "error",
      message: "Registration has not started yet. Registration opens on 27 October 2026 at 12:00 AM Sri Lanka time."
    });
  }

  if (Date.now() >= registrationCloseTime) {
    return jsonResponse({
      status: "error",
      message: "Registration and film submissions closed on 14 December 2026."
    });
  }

  var lock = LockService.getScriptLock();
  var locked = false;

  try {
    lock.waitLock(30000);
    locked = true;

    var data = requestData;

    if (
      !data.referenceId ||
      !data.teamName ||
      !data.leaderName ||
      !data.leaderEmail
    ) {
      throw new Error("Required registration details are missing.");
    }

    if (data.ambassadorCode != null && typeof data.ambassadorCode !== "string") {
      throw new Error("Ambassador code must be text.");
    }

    var ambassadorCode = String(data.ambassadorCode || "").trim();
    if (ambassadorCode.length > 50) {
      throw new Error("Ambassador code must be 50 characters or fewer.");
    }

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Determine category and target sheet
    var isSchool = String(data.category || "").toLowerCase().indexOf("school") !== -1;
    var targetSheetName = isSchool ? "School Registrations" : "University Registrations";

    var sheet = spreadsheet.getSheetByName(targetSheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(targetSheetName);
    }

    // Create tailored headers automatically if empty
    if (sheet.getLastRow() === 0) {
      var headers = isSchool
        ? [
            "Timestamp",
            "Reference ID",
            "Category",
            "Team Name",
            "Leader Full Name",
            "Leader WhatsApp",
            "Leader Email",
            "Team Size",
            "Other Team Members",
            "School Name",
            "School District",
            "Leader Grade",
            "Teacher in Charge",
            "Parent / Guardian",
            "Parent Consent & Declarations",
            "Fee Paid (Rs.)",
            "Payment Method",
            "Payment Date",
            "Payment Ref",
            "Payment Slip Link",
            "Signature",
            "Questions",
            "Heard From"
          ]
        : [
            "Timestamp",
            "Reference ID",
            "Category",
            "Team Name",
            "Leader Full Name",
            "Leader WhatsApp",
            "Leader Email",
            "Team Size",
            "Other Team Members",
            "University / Institute",
            "Faculty",
            "Year of Study",
            "Student Reg No",
            "Degree Programme",
            "Enrolled Undergraduate Check",
            "Fee Paid (Rs.)",
            "Payment Method",
            "Payment Date",
            "Payment Ref",
            "Student ID Link",
            "Payment Slip Link",
            "Signature",
            "Questions",
            "Heard From",
            "Ambassador Code"
          ];

      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground(isSchool ? "#1e293b" : "#171518")
        .setFontColor(isSchool ? "#38bdf8" : "#f5d77f");

      sheet.setFrozenRows(1);
    }

    var ambassadorCodeColumn = isSchool
      ? 0
      : ensureAmbassadorCodeColumn(sheet);

    var studentIdUrl = isSchool
      ? "N/A (School Category)"
      : saveFile(
          data.studentIdBase64,
          data.studentIdMime,
          data.studentIdFileName,
          data.referenceId,
          "StudentID"
        );

    var paymentSlipUrl = saveFile(
      data.paymentSlipBase64,
      data.paymentSlipMime,
      data.paymentSlipFileName,
      data.referenceId,
      "PaymentSlip"
    );

    var row = isSchool
      ? [
          data.timestamp || new Date().toISOString(),
          data.referenceId,
          "Inter-School Category",
          data.teamName || "N/A",
          data.leaderName || "N/A",
          data.leaderPhone || "N/A",
          data.leaderEmail || "N/A",
          data.teamSize || "N/A",
          data.otherMembers || "None",
          data.institution || "N/A",
          data.districtOrFaculty || "N/A",
          data.gradeOrYear || "N/A",
          data.teacherOrRegNo || "N/A",
          data.guardianOrDegree || "N/A",
          data.consentOrEligibility || "N/A",
          data.amountPaid || "2000",
          data.paymentMethod || "N/A",
          data.paymentDate || "N/A",
          data.paymentRef || "N/A",
          paymentSlipUrl,
          data.signature || "N/A",
          data.questions || "None",
          data.heardFrom || "N/A"
        ]
      : [
          data.timestamp || new Date().toISOString(),
          data.referenceId,
          "Inter-University Category",
          data.teamName || "N/A",
          data.leaderName || "N/A",
          data.leaderPhone || "N/A",
          data.leaderEmail || "N/A",
          data.teamSize || "N/A",
          data.otherMembers || "None",
          data.institution || "N/A",
          data.districtOrFaculty || "N/A",
          data.gradeOrYear || "N/A",
          data.teacherOrRegNo || "N/A",
          data.guardianOrDegree || "N/A",
          data.consentOrEligibility || "N/A",
          data.amountPaid || "N/A",
          data.paymentMethod || "N/A",
          data.paymentDate || "N/A",
          data.paymentRef || "N/A",
          studentIdUrl,
          paymentSlipUrl,
          data.signature || "N/A",
          data.questions || "None",
          data.heardFrom || "N/A"
        ];

    if (!isSchool) {
      while (row.length < ambassadorCodeColumn - 1) {
        row.push("");
      }
      row[ambassadorCodeColumn - 1] = ambassadorCode || "N/A";
    }

    // Save row to category-specific sheet
    sheet.appendRow(row);
    SpreadsheetApp.flush();

    return jsonResponse({
      status: "success",
      message: "Registration saved successfully to " + targetSheetName + ".",
      referenceId: data.referenceId
    });

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: String(error.message || error)
    });

  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}

function ensureAmbassadorCodeColumn(sheet) {
  var lastColumn = sheet.getLastColumn();
  var headers = lastColumn > 0
    ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (header) {
        return String(header || "").trim();
      })
    : [];
  var existingColumn = headers.indexOf("Ambassador Code");
  if (existingColumn !== -1) {
    return existingColumn + 1;
  }

  var newColumn = lastColumn + 1;
  sheet.getRange(1, newColumn)
    .setValue("Ambassador Code")
    .setFontWeight("bold")
    .setBackground("#171518")
    .setFontColor("#f5d77f");
  return newColumn;
}

function saveFile(base64, mimeType, fileName, referenceId, label) {
  if (!base64 || !fileName || fileName === "N/A") {
    return "N/A";
  }

  try {
    var folderName = "CINERO'26 Registration Uploads";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext()
      ? folders.next()
      : DriveApp.createFolder(folderName);

    var bytes = Utilities.base64Decode(base64);
    var safeName = String(fileName).replace(/[\\/:*?"<>|]/g, "_");

    var blob = Utilities.newBlob(
      bytes,
      mimeType || "application/octet-stream",
      referenceId + "_" + label + "_" + safeName
    );

    var file = folder.createFile(blob);

    // SECURITY: Keep file strictly private to organizing committee & spreadsheet editors.
    // Do NOT allow ANYONE_WITH_LINK access so uploaded personal IDs & bank receipts stay secure.
    try {
      file.setSharing(
        DriveApp.Access.PRIVATE,
        DriveApp.Permission.NONE
      );
    } catch (e) {
      // Default creation in private folder is already restricted
    }

    return file.getUrl();
  } catch (driveErr) {
    Logger.log("Drive save error: " + driveErr.message);
    return "Upload failed (Drive permission required): " + String(fileName);
  }
}

// Helper function to force Drive authorization in Apps Script Editor:
// Run this function once manually in the Apps Script editor to grant Drive permissions!
function authorizeDrive() {
  var root = DriveApp.getRootFolder();
  Logger.log("Drive authorized: " + root.getName());
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var action = String(params.action || "").toLowerCase();
  var category = String(params.category || "all").toLowerCase();

  if (action === "gallery" || action === "galleryphoto") {
    var expectedGalleryReadToken = PropertiesService.getScriptProperties().getProperty("GOOGLE_SHEET_READ_TOKEN");
    var suppliedGalleryReadToken = String(params.readToken || "");
    if (!expectedGalleryReadToken || !suppliedGalleryReadToken || suppliedGalleryReadToken !== expectedGalleryReadToken) {
      return jsonResponse({
        status: "error",
        message: "Unauthorized."
      });
    }

    var galleryOpenTime = new Date("2026-11-18T00:00:00+05:30").getTime();
    if (Date.now() < galleryOpenTime) {
      return jsonResponse({
        status: "error",
        message: "The Holi Gallery opens after the event on 18 November 2026."
      });
    }

    if (action === "galleryphoto") {
      var photo = findApprovedGalleryPhoto(String(params.photoId || ""));
      return photo
        ? jsonResponse(photo)
        : jsonResponse({ status: "error", message: "Photo not found." });
    }

    return jsonResponse({
      status: "success",
      photos: readApprovedGalleryPhotos()
    });
  }

  if (action === "read") {
    var expectedReadToken = PropertiesService.getScriptProperties().getProperty("GOOGLE_SHEET_READ_TOKEN");
    var suppliedReadToken = String(params.readToken || "");
    if (!expectedReadToken || !suppliedReadToken || suppliedReadToken !== expectedReadToken) {
      return jsonResponse({
        status: "error",
        message: "Unauthorized."
      });
    }

    var records = readRegistrations(category);
    return jsonResponse({
      status: "success",
      category: category,
      total: records.length,
      records: records
    });
  }

  return jsonResponse({
    status: "active",
    message: "CINERO'26 registration service is running."
  });
}

function readRegistrations(category) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var targetSheets = [
    { name: "School Registrations", key: "school" },
    { name: "University Registrations", key: "university" }
  ];

  var results = [];
  var requestedCategory = String(category || "all").toLowerCase();

  for (var i = 0; i < targetSheets.length; i++) {
    var sheetConfig = targetSheets[i];
    var sheet = spreadsheet.getSheetByName(sheetConfig.name);
    if (!sheet) continue;

    var values = sheet.getDataRange().getValues();
    if (values.length < 2) continue;

    var headers = values[0].map(function (header) {
      return String(header || "").trim();
    });

    for (var rowIndex = 1; rowIndex < values.length; rowIndex++) {
      var row = values[rowIndex];
      if (!row || row.every(function (cell) {
        return String(cell || "").trim() === "";
      })) {
        continue;
      }

      var record = {};
      for (var colIndex = 0; colIndex < headers.length; colIndex++) {
        record[headers[colIndex]] = row[colIndex] !== undefined ? row[colIndex] : "";
      }

      var categoryName = String(record["Category"] || "").toLowerCase();
      var matchesCategory = requestedCategory === "all"
        || (requestedCategory === "school" && categoryName.indexOf("school") !== -1)
        || (requestedCategory === "university" && categoryName.indexOf("university") !== -1);

      if (matchesCategory) {
        results.push(record);
      }
    }
  }

  return results;
}

var GALLERY_PHOTOS_SHEET = "Gallery_Photos";
var GALLERY_PHOTOS_HEADERS = [
  "Photo_ID",
  "File_Name",
  "Drive_File_ID",
  "Mime_Type",
  "File_Size_Bytes",
  "Uploaded_By",
  "Uploaded_At",
  "Status",
  "Reviewed_By",
  "Reviewed_At"
];
var GALLERY_MAX_FILE_BYTES = 3 * 1024 * 1024;

function handleGalleryUpload(data) {
  var expectedToken = PropertiesService.getScriptProperties().getProperty("GALLERY_UPLOAD_TOKEN");
  var suppliedToken = String(data.galleryUploadToken || "");
  if (!expectedToken || !suppliedToken || suppliedToken !== expectedToken) {
    return jsonResponse({ status: "error", message: "Unauthorized photo upload request." });
  }

  var fileName = String(data.fileName || "").trim();
  var mimeType = String(data.mimeType || "").toLowerCase();
  var base64 = String(data.base64 || "");
  var uploadedBy = String(data.uploadedBy || "").trim();
  var allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence"
  ];

  if (
    !fileName ||
    fileName.length > 180 ||
    allowedMimeTypes.indexOf(mimeType) === -1 ||
    !base64 ||
    uploadedBy.length > 80
  ) {
    return jsonResponse({ status: "error", message: "Photo details are invalid or unsupported." });
  }

  var bytes;
  try {
    bytes = Utilities.base64Decode(base64);
  } catch (error) {
    return jsonResponse({ status: "error", message: "The photo data is invalid." });
  }

  if (!bytes || bytes.length === 0 || bytes.length > GALLERY_MAX_FILE_BYTES) {
    return jsonResponse({ status: "error", message: "Each photo must be smaller than or equal to 3 MB." });
  }

  var readerEmail = PropertiesService.getScriptProperties().getProperty("GALLERY_DRIVE_READER_EMAIL");
  if (!readerEmail || readerEmail.indexOf("@") === -1) {
    return jsonResponse({
      status: "error",
      message: "The gallery Drive service account is not configured."
    });
  }

  var lock = LockService.getScriptLock();
  var locked = false;
  var createdFile = null;
  try {
    lock.waitLock(30000);
    locked = true;

    var folder = getGalleryUploadFolder(readerEmail);
    var sheet = getGalleryPhotosSheet();
    var photoId = Utilities.getUuid();
    var safeName = fileName.replace(/[\\/:*?"<>|]/g, "_").slice(0, 150);
    if (/^[=+\-@]/.test(safeName)) safeName = "'" + safeName;
    var blob = Utilities.newBlob(bytes, mimeType, photoId + "_" + safeName);
    createdFile = folder.createFile(blob);
    createdFile.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);

    var safeUploader = uploadedBy.replace(/[\r\n\t]/g, " ").slice(0, 80);
    if (/^[=+\-@]/.test(safeUploader)) safeUploader = "'" + safeUploader;
    var uploadedAt = new Date();
    sheet.appendRow([
      photoId,
      safeName,
      createdFile.getId(),
      mimeType,
      bytes.length,
      safeUploader,
      uploadedAt,
      "PENDING",
      "",
      ""
    ]);
    SpreadsheetApp.flush();

    return jsonResponse({
      status: "success",
      photoId: photoId,
      reviewStatus: "PENDING"
    });
  } catch (error) {
    if (createdFile) {
      try {
        createdFile.setTrashed(true);
      } catch (cleanupError) {
        Logger.log("Unable to clean up failed gallery upload: " + cleanupError.message);
      }
    }
    Logger.log("Gallery upload error: " + error.message);
    return jsonResponse({
      status: "error",
      message: "The photo could not be saved. Please try again."
    });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function getGalleryUploadFolder(readerEmail) {
  var properties = PropertiesService.getScriptProperties();
  var folderId = properties.getProperty("GALLERY_DRIVE_FOLDER_ID");
  var folder = folderId ? DriveApp.getFolderById(folderId) : null;

  if (!folder) {
    folder = DriveApp.createFolder("CINERO'26 Holi Gallery Uploads");
    folder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    properties.setProperty("GALLERY_DRIVE_FOLDER_ID", folder.getId());
  }

  var viewers = folder.getViewers();
  var hasReader = viewers.some(function (viewer) {
    return viewer.getEmail().toLowerCase() === readerEmail.toLowerCase();
  });
  if (!hasReader) folder.addViewer(readerEmail);

  return folder;
}

function getGalleryPhotosSheet() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(GALLERY_PHOTOS_SHEET);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(GALLERY_PHOTOS_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(GALLERY_PHOTOS_HEADERS);
    sheet.getRange(1, 1, 1, GALLERY_PHOTOS_HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#171518")
      .setFontColor("#f5d77f");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function initializeGalleryPhotosSheet() {
  getGalleryPhotosSheet();
  Logger.log("Gallery_Photos sheet is ready for pending photo uploads.");
}

function readApprovedGalleryPhotos() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(GALLERY_PHOTOS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function (header) {
    return String(header || "").trim();
  });
  var column = {};
  headers.forEach(function (header, index) {
    column[header] = index;
  });

  return values.slice(1)
    .filter(function (row) {
      return String(row[column.Status] || "").trim().toUpperCase() === "APPROVED";
    })
    .map(function (row) {
      return {
        status: "success",
        photoId: String(row[column.Photo_ID] || ""),
        fileName: String(row[column.File_Name] || "CINERO26-photo"),
        mimeType: String(row[column.Mime_Type] || "image/jpeg"),
        uploadedAt: row[column.Uploaded_At] instanceof Date
          ? row[column.Uploaded_At].toISOString()
          : String(row[column.Uploaded_At] || "")
      };
    })
    .filter(function (photo) {
      return Boolean(photo.photoId);
    })
    .slice(-100)
    .reverse();
}

function findApprovedGalleryPhoto(photoId) {
  if (!photoId) return null;

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(GALLERY_PHOTOS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function (header) {
    return String(header || "").trim();
  });
  var column = {};
  headers.forEach(function (header, index) {
    column[header] = index;
  });

  for (var index = values.length - 1; index > 0; index--) {
    var row = values[index];
    if (
      String(row[column.Photo_ID] || "") === photoId &&
      String(row[column.Status] || "").trim().toUpperCase() === "APPROVED" &&
      String(row[column.Drive_File_ID] || "")
    ) {
      return {
        status: "success",
        reviewStatus: "APPROVED",
        photoId: photoId,
        driveFileId: String(row[column.Drive_File_ID]),
        fileName: String(row[column.File_Name] || "CINERO26-photo"),
        mimeType: String(row[column.Mime_Type] || "image/jpeg")
      };
    }
  }

  return null;
}
