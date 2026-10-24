/**
 * CINERO'26 Team Registration - Google Apps Script
 * 
 * Instructions to connect with your Google Sheet:
 * 1. Open Google Sheets (https://sheets.new) and name it "CINERO'26 Registrations".
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Delete any default code in Code.gs, paste this entire file, and click Save (Ctrl + S).
 * 4. Click the blue "Deploy" button at the top right > "New deployment".
 * 5. Select type: "Web app" (click gear icon next to Select type).
 * 6. Set Description: "CINERO 26 Form Submissions".
 * 7. Set "Execute as": "Me" (your Google account).
 * 8. Set "Who has access": "Anyone" (IMPORTANT: this allows the website to submit data).
 * 9. Click "Deploy", authorize permissions when prompted, and copy the "Web app URL" (ends with /exec).
 * 10. Paste this URL into your .env.local file as:
 *     VITE_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 */

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    // Wait for up to 30 seconds for other processes to finish
    lock.waitLock(30000);

    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Check if header row exists, if not create headers
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
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#171518");
      headerRange.setFontColor("#f5d77f");
      sheet.setFrozenRows(1);
    }

    // Handle File Uploads to Google Drive (if present)
    var studentIdUrl = data.studentIdFileName || "N/A";
    var paymentSlipUrl = data.paymentSlipFileName || "N/A";

    var driveFolder = null;
    if (data.studentIdBase64 || data.paymentSlipBase64) {
      var folderName = "CINERO'26 Registration Uploads";
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        driveFolder = folders.next();
      } else {
        driveFolder = DriveApp.createFolder(folderName);
      }
    }

    // Save Student ID file to Drive
    if (driveFolder && data.studentIdBase64 && data.studentIdFileName) {
      try {
        var decodedStudentId = Utilities.base64Decode(data.studentIdBase64);
        var studentIdBlob = Utilities.newBlob(
          decodedStudentId,
          data.studentIdMime || "image/jpeg",
          data.referenceId + "_StudentID_" + data.studentIdFileName
        );
        var studentIdFile = driveFolder.createFile(studentIdBlob);
        studentIdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        studentIdUrl = studentIdFile.getUrl();
      } catch (err) {
        studentIdUrl = "Error saving file: " + err.message;
      }
    }

    // Save Payment Slip file to Drive
    if (driveFolder && data.paymentSlipBase64 && data.paymentSlipFileName) {
      try {
        var decodedSlip = Utilities.base64Decode(data.paymentSlipBase64);
        var slipBlob = Utilities.newBlob(
          decodedSlip,
          data.paymentSlipMime || "image/jpeg",
          data.referenceId + "_PaymentSlip_" + data.paymentSlipFileName
        );
        var slipFile = driveFolder.createFile(slipBlob);
        slipFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        paymentSlipUrl = slipFile.getUrl();
      } catch (err) {
        paymentSlipUrl = "Error saving file: " + err.message;
      }
    }

    // Prepare row values
    var newRow = [
      data.timestamp || new Date().toLocaleString(),
      data.referenceId || "N/A",
      data.category || "N/A",
      data.teamName || "N/A",
      data.leaderName || "N/A",
      data.leaderPhone || "N/A",
      data.leaderEmail || "N/A",
      data.teamSize || "N/A",
      data.otherMembers || "N/A",
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

    sheet.appendRow(newRow);
    lock.releaseLock();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration added successfully",
      referenceId: data.referenceId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "CINERO'26 Google Sheets Registration Webhook is running."
  })).setMimeType(ContentService.MimeType.JSON);
}
