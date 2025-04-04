// --- Configuration ---
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId(); // Gets the ID of the sheet this script is bound to
const SHEET_NAME = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName(); // Or specify a sheet name like "Sheet1"
const DRIVE_FOLDER_NAME = "PrintAppUploads"; // The name of the folder to store images in Google Drive
const NOTIFICATION_EMAIL = "printscrafter@gmail.com"; // Email address to send order notifications

/**
 * Handles HTTP POST requests to the web app.
 * Expects JSON payload with user details and items array.
 * Saves images to Drive, records order in Sheet, sends email notification.
 */
function doPost(e) {
  let responsePayload;
  let orderData;
  const orderTimestamp = new Date();
  const orderId = Utilities.formatDate(orderTimestamp, Session.getScriptTimeZone(), "yyyyMMddHHmmss") + "_" + Math.random().toString(36).substring(2, 8); // Unique Order ID

  try {
    // 1. Parse Incoming Data
    if (!e.postData || !e.postData.contents) {
      throw new Error("No data received in POST request.");
    }
    orderData = JSON.parse(e.postData.contents);

    if (!orderData.userName || !orderData.userEmail || !orderData.userAddress || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error("Invalid or incomplete order data received.");
    }

    Logger.log("Received Order Data for Order ID: " + orderId);
    // Logger.log(JSON.stringify(orderData, null, 2)); // Log received data (optional, remove sensitive data in production)

    // 2. Get or Create Google Drive Folder
    const uploadFolder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
    Logger.log("Using Drive Folder ID: " + uploadFolder.getId());

    // 3. Access Google Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Use active sheet since script is bound
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
       throw new Error(`Sheet named "${SHEET_NAME}" not found.`);
    }

    // 4. Process Each Item
    const emailBodyItems = [];
    for (const item of orderData.items) {
      if (!item.fileName || !item.mimeType || !item.base64Data || !item.size || !item.quantity || item.price === undefined) {
        Logger.log("Skipping invalid item in order " + orderId + ": " + JSON.stringify(item));
        continue; // Skip invalid items but process the rest
      }

      // Decode Base64 and create Blob
      const decodedData = Utilities.base64Decode(item.base64Data);
      const blob = Utilities.newBlob(decodedData, item.mimeType, item.fileName);

      // Save file to Drive
      const file = uploadFolder.createFile(blob);
      const fileUrl = file.getUrl();
      Logger.log(`Saved file: ${item.fileName}, URL: ${fileUrl}`);

      // Append row to Google Sheet
      sheet.appendRow([
        orderTimestamp,
        orderId,
        orderData.userName,
        orderData.userEmail,
        orderData.userAddress,
        item.fileName,
        fileUrl,
        item.size,
        item.quantity,
        item.price,
        orderData.totalPrice // Total price for the whole order
      ]);

      // Add item details to email body
       emailBodyItems.push(
         `- ${item.fileName} (Size: ${item.size}, Qty: ${item.quantity}, Price: $${item.price.toFixed(2)}) - URL: ${fileUrl}`
       );
    }
     Logger.log("Finished processing items for Order ID: " + orderId);


    // 5. Send Email Notification
    if (emailBodyItems.length > 0) { // Only send email if items were successfully processed
        const subject = `New Print Order Received - ID: ${orderId}`;
        const body = `
A new print order has been received:

Order ID: ${orderId}
Timestamp: ${orderTimestamp.toLocaleString()}

Customer Details:
Name: ${orderData.userName}
Email: ${orderData.userEmail}
Address: ${orderData.userAddress}

Order Items:
${emailBodyItems.join("\n")}

Total Order Price: $${orderData.totalPrice.toFixed(2)}

Uploaded images are saved in the "${DRIVE_FOLDER_NAME}" folder in Google Drive.
Sheet Record ID: ${orderId}
`;
        MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
        Logger.log("Notification email sent for Order ID: " + orderId + " to " + NOTIFICATION_EMAIL);
    } else {
         Logger.log("No valid items processed for Order ID: " + orderId + ". Email not sent.");
         // Consider if an error should be thrown here if NO items were valid
         if (orderData.items.length > 0) { // If there were items initially, but none were valid
             throw new Error("Order received, but contained no valid items to process.");
         }
    }


    // 6. Prepare Success Response
    responsePayload = {
      status: "success",
      message: "Order received successfully! Check your email for confirmation.",
      orderId: orderId
    };

  } catch (error) {
    Logger.log("Error processing order (Order ID: " + (orderId || 'N/A') + "): " + error.toString());
    Logger.log("Stack Trace: " + error.stack);
     // Log the received data on error for debugging
     if (e && e.postData && e.postData.contents) {
       Logger.log("Failed Request Data: " + e.postData.contents);
     }

    // Prepare Error Response
    responsePayload = {
      status: "error",
      message: "Failed to process order: " + error.message
    };
   }

   // 7. Return JSON Response
   Logger.log("Returning response: " + JSON.stringify(responsePayload)); // Add logging before returning
   return ContentService
     .createTextOutput(JSON.stringify(responsePayload))
     .setMimeType(ContentService.MimeType.JSON);
 } // Make sure this closing brace for the doPost function is present

/**
 * Helper function to find a folder by name or create it if it doesn't exist.
 * Searches the entire Drive of the user running the script.
 * @param {string} folderName The name of the folder to find or create.
 * @return {Folder} The Google Drive Folder object.
 */
function getOrCreateFolder_(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  let folder;

  if (folders.hasNext()) {
    // Folder exists, use the first one found
    folder = folders.next();
     Logger.log(`Found existing folder: "${folderName}" (ID: ${folder.getId()})`);
  } else {
    // Folder doesn't exist, create it
    folder = DriveApp.createFolder(folderName);
     Logger.log(`Created new folder: "${folderName}" (ID: ${folder.getId()})`);
  }
  return folder;
}

// Optional: Add a doGet function for basic testing in browser
function doGet(e) {
   return HtmlService.createHtmlOutput("<h1>PrintScrafter GAS Backend</h1><p>This endpoint is for POST requests from the web app.</p>");
}
