function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Expenses")
    .addItem("Process Receipts Now", "processReceipts")
    .addToUi();
}

function processReceipts() {
  const RECEIPTS_FOLDER_ID = PropertiesService.getScriptProperties().getProperty("RECEIPTS_FOLDER_ID");
  const PROCESSED_FOLDER_ID = PropertiesService.getScriptProperties().getProperty("PROCESSED_FOLDER_ID");

  const folder = DriveApp.getFolderById(RECEIPTS_FOLDER_ID);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();

    // skip non-images
    if (!file.getMimeType().startsWith("image/")) continue;

    const result = callGemini(file);

    if (!result) continue;

    if (result.items) {
      result.items = consolidateItems(result.items);
    }

    writeToSheets(result, file);

    moveFile(file.getId(), RECEIPTS_FOLDER_ID, PROCESSED_FOLDER_ID);
  }
}

function callGemini(file) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

  const blob = file.getBlob();
  const base64 = Utilities.base64Encode(blob.getBytes());

  const prompt = `
Extract receipt data and return ONLY valid JSON.

Schema:

{
"date": "YYYY-MM-DD",
"merchant": "",
"total": 0,
"confidence": 0.92,
"items": [
{
"name": "",
"quantity": 1,
"price": 0,
"category": "",
"confidence": 0.95
}
]
}

Requirements:

* Return valid JSON only. No markdown, comments, or explanations.
* Use ISO date format: YYYY-MM-DD.
* Total must match the receipt total as closely as possible.
* Ignore tax, subtotal, discounts, coupons, loyalty information, payment information, and change due unless they are needed to determine the receipt total.
* Do not invent items that are not visible on the receipt.
* If information is unclear, make your best estimate and lower the confidence score.

Categories must be exactly one of:

Housing
Utilites
Insurance
School
Gas
Groceries
Restaurants
Shopping
Entertainment
Miscellaneous
Unsure

Confidence Rules:

* Confidence must be between 0 and 1.
* Receipt confidence reflects confidence in the overall extraction.
* Item confidence reflects confidence in the item's name, quantity, and price.
* Use lower confidence when text is blurry, obscured, incomplete, or ambiguous.

Quantity Rules:

- If a receipt explicitly shows a quantity, use it.
- If no quantity is shown, assume quantity = 1.
- Return one entry for each line item identified on the receipt.

Verification Checklist:

1. Extract all visible purchased items.
2. Verify quantities and prices.
3. Compare item totals against the receipt subtotal or total when possible.
4. Re-check any inconsistent or low-confidence items.
5. Return the final consolidated JSON.

Return ONLY JSON.
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: file.getMimeType(),
              data: base64
            }
          }
        ]
      }
    ]
  };

  let res;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      res = UrlFetchApp.fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        }
      );

      const code = res.getResponseCode();

      if (code === 200) {
        break;
      }

      if (code === 503 || code === 429) {
        Logger.log(`Retry ${attempt}: Gemini busy`);
        Utilities.sleep(attempt * 5000); // 5s, 10s, 15s...
        continue;
      }

      throw new Error(res.getContentText());

    } catch (err) {
      if (attempt === 5) throw err;
      Utilities.sleep(attempt * 5000);
    }
  }

  Logger.log(res.getContentText());

  const text = JSON.parse(res.getContentText());

  logGeminiResponse(
    file.getName(),
    JSON.stringify(text)
  );

  let raw = "";

  try {
    raw = text.candidates[0].content.parts[0].text; 
    raw = raw.replace(/```json|```/g, "").trim(); // remove markdown formatting if present
    return JSON.parse(raw);
  } catch (e) {
    Logger.log("Gemini parse failed");
    Logger.log(raw);
    Logger.log(e.toString());
    return null;
  }
}

function writeToSheets(data, file) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const transactions = ss.getSheetByName("Transactions");
  const items = ss.getSheetByName("Items");

  const receiptId = "R" + new Date().getTime();
  const date = data.date;
  const month = date ? date.substring(0, 7) : "";

  const categories = {};

  data.items = Array.isArray(data.items) ? data.items : [];

  data.items.forEach(item => {
    if (!item) return;

    const cat = item.category || "Unsure";
    categories[cat] =
    (categories[cat] || 0) +
    ((item.quantity || 1) * (item.price || 0));
  });

  const transactionCategory =
    Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0] || "Unsure";

  // Transactions row
  transactions.appendRow([
    receiptId,
    date,
    month,
    data.merchant,
    data.total,
    transactionCategory,
    data.confidence || "",
    file.getName()
  ]);

  // Items rows
  data.items.forEach(item => {
    items.appendRow([
      receiptId,
      date,
      month,
      data.merchant,
      item.name,
      item.quantity,
      item.price,
      item.category,
      item.confidence || ""
    ]);
  });
}

function moveFile(fileId, fromFolderId, toFolderId) {
  const file = DriveApp.getFileById(fileId);
  const fromFolder = DriveApp.getFolderById(fromFolderId);
  const toFolder = DriveApp.getFolderById(toFolderId);

  fromFolder.removeFile(file);
  toFolder.addFile(file);
}

function logGeminiResponse(fileName, responseText) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Gemini Logs");

  if (!sheet) return;

  sheet.appendRow([
    new Date(),
    fileName,
    responseText
  ]);
}

function consolidateItems(items) {
  const grouped = {};

  items.forEach(item => {
    const name = (item.name || "").trim();
    const price = Number(item.price) || 0;

    const key = name + "|" + price;

    if (!grouped[key]) {
      grouped[key] = {
        name: name,
        quantity: Number(item.quantity) || 1,
        price: price,
        category: item.category || "Unsure",
        confidence: item.confidence || 0
      };
    } else {
      grouped[key].quantity += Number(item.quantity) || 1;

      // keep the lower confidence
      grouped[key].confidence = Math.min(
        grouped[key].confidence,
        item.confidence || 0
      );
    }
  });

  return Object.values(grouped);
}