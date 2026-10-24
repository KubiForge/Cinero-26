
var SPREADSHEET_ID = "18sPX0nKl4IKDqBf1zRhDSpfNcGUStvw-DhCddBmwoQw";

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;

  try {
    lock.waitLock(30000);
    locked = true;

    var data = JSON.parse(e.postData.contents);

    if (
      !data.referenceId ||
      !data.teamName ||
      !data.leaderName ||
      !data.leaderEmail
    ) {
      throw new Error("Required registration details are missing.");
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
            "Heard From"
          ];

      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground(isSchool ? "#1e293b" : "#171518")
        .setFontColor(isSchool ? "#38bdf8" : "#f5d77f");

      sheet.setFrozenRows(1);
    }

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

function doGet() {
  return jsonResponse({
    status: "active",
    message: "CINERO'26 registration service is running."
  });
}
