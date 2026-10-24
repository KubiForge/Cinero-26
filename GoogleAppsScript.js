
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

    // This script must be connected to the target Google Sheet.
    var sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getActiveSheet();

    // Create headers automatically for an empty sheet.
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Reference ID",
        "Category",
        "Team Name",
        "Leader Full Name",
        "Leader Mobile (WhatsApp)",
        "Leader Email",
        "Team Size",
        "Other Team Members",
        "Institution (School / University)",
        "District / Faculty",
        "Grade / Year of Study",
        "Teacher / Student Reg No",
        "Guardian / Degree",
        "Consent / Eligibility Check",
        "Registration Fee (Rs.)",
        "Payment Method",
        "Payment Date",
        "Payment Slip Ref / No",
        "Student ID File Link",
        "Payment Slip File Link",
        "Confirmation Signature",
        "Questions & Inquiries",
        "Heard From"
      ];

      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#171518")
        .setFontColor("#f5d77f");

      sheet.setFrozenRows(1);
    }

    var studentIdUrl = saveFile(
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

    var row = [
      data.timestamp || new Date().toISOString(),
      data.referenceId,
      data.category || "N/A",
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

    // Save the registration before returning success.
    sheet.appendRow(row);
    SpreadsheetApp.flush();

    return jsonResponse({
      status: "success",
      message: "Registration saved successfully.",
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

  // Anyone with the link can view these uploaded documents.
  // Consider restricted access because these may contain personal data.
  file.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  return file.getUrl();
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
