/**
 * Handles POST requests from the newsletter form and appends data to a Google Sheet.
 */
function doPost(e) {
  // --- Configuration ---
  // Replace 'YOUR_SPREADSHEET_ID' with the actual ID of your Google Sheet.
  // You can find the ID in the URL of your sheet:
  // https://docs.google.com/spreadsheets/d/1_e9mwEpx47Hnx2TjGsL1lToJXj3ILQAb4RRIgQdiFs8/edit?usp=sharing
  var SPREADSHEET_ID = "https://docs.google.com/spreadsheets/d/1_e9mwEpx47Hnx2TjGsL1lToJXj3ILQAb4RRIgQdiFs8/edit?usp=sharing";

  // Replace 'Sheet1' with the actual name of the sheet (tab) where you have the headers.
  var SHEET_NAME = "Newsletter";
  // ---------------------


  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds for other processes to finish.

  try {
    var sheet = SpreadsheetApp.openById(1_e9mwEpx47Hnx2TjGsL1lToJXj3ILQAb4RRIgQdiFs8).getSheetByName(Newsletter);

    // Get parameters from the POST request
    var name = e.parameter.name || ''; // Get 'name' parameter from form data
    var email = e.parameter.email || ''; // Get 'email' parameter from form data
    var timestamp = e.parameter.timestamp || new Date(); // Get timestamp or use current time

    // Basic validation (optional, but recommended)
    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Email is required." })).setMimeType(ContentService.MimeType.JSON);
    }
     if (!name) {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Name is required." })).setMimeType(ContentService.MimeType.JSON);
    }

    // Append the data as a new row
    // Ensure the order matches your sheet headers (Timestamp, Name, Email)
    sheet.appendRow([timestamp, name, email]);

    // Return a success response (important for the fetch request on the client-side)
    // Note: If using mode: 'no-cors' on the client, this response won't be directly readable by the script,
    // but it confirms the script executed successfully on the server side.
    // If you configure CORS properly, you can return more detailed JSON.
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Subscription successful." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error for debugging
    Logger.log("Error processing subscription: " + error.toString());
    Logger.log("Request parameters: " + JSON.stringify(e.parameter));

    // Return an error response
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Failed to process subscription.", "errorDetails": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Optional: Simple GET request handler for testing the script deployment
function doGet(e) {
  return HtmlService.createHtmlOutput("Google Apps Script is running.");
}
