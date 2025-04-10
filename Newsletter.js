/**
 * Handles POST requests from the newsletter form and appends data to a Google Sheet.
 * https://script.google.com/macros/s/AKfycbxpPGsCwkGoQI654b-8NFiXtMOFt8gB9--P9lM_o_SE_DxCZ65J-K7Y8mLiu-IOrYmZtw/exec
 */
function doPost(e) {
  // --- Configuration ---
  // Spreadsheet ID provided by user
  var SPREADSHEET_ID = "1_e9mwEpx47Hnx2TjGsL1lToJXj3ILQAb4RRIgQdiFs8";

  // Sheet Name provided by user
  var SHEET_NAME = "Newsletter";
  // ---------------------


  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds for other processes to finish.

  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    // Check if sheet exists
    if (!sheet) {
       Logger.log("Error: Sheet '" + SHEET_NAME + "' not found in Spreadsheet ID: " + SPREADSHEET_ID);
       return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Sheet not found. Please check configuration." }))
         .setMimeType(ContentService.MimeType.JSON);
    }

    // Get parameters from the POST request
    var name = e.parameter.name || ''; // Get 'name' parameter from form data
    var email = e.parameter.email || ''; // Get 'email' parameter from form data
    var timestamp = e.parameter.timestamp || new Date(); // Get timestamp or use current time

    // Basic validation
    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Email is required." })).setMimeType(ContentService.MimeType.JSON);
    }
     if (!name) {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Name is required." })).setMimeType(ContentService.MimeType.JSON);
    }

    // Append the data as a new row
    // Ensure the order matches your sheet headers (Timestamp, Name, Email)
    sheet.appendRow([timestamp, name, email]);

    // Return a success response
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
  return HtmlService.createHtmlOutput("Google Apps Script for Printscrafter Newsletter is running.");
}
