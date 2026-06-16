# AI Receipt Expense Tracker for Google Sheets

Turn receipt photos into organized financial data automatically using Google Sheets, Google Drive, Google Apps Script, and Google's Gemini AI.

## What This Project Does

Most budgeting systems require you to manually enter every purchase.

This project allows you to:

- Take a picture of a receipt.
- Upload it to Google Drive.
- Let Gemini AI read the receipt.
- Automatically extract:
  - Merchant
  - Date
  - Total
  - Individual items
- Categorize purchases.
- Store everything in Google Sheets.
- Compare spending against your budget.

The goal is to make expense tracking simple enough that you'll actually keep doing it.

---

## Features

### Automatic Receipt Processing

Upload receipt images or screenshots and let AI extract the information.

### Budget Tracking

Track spending against category budgets.

### Historical Reporting

Keep all transactions in one dataset for long-term analysis.

### Item-Level Detail

See exactly what was purchased, not just the receipt total.

### Manual Income Tracking

Track:
- Paychecks
- Reimbursements
- Refunds
- Gifts
- Any other incoming money



---

# Step 1: Create Your Own Copy

Open the spreadsheet template:

**[INSERT YOUR SPREADSHEET TEMPLATE LINK HERE]**

Choose:

File → Make a copy

Create a copy in your own Google Drive.

![Make a Copy](images/create-copy.png)

---

# Step 2: Create Google Drive Folders

Create two folders anywhere in your Google Drive.

## Folder 1 - Receipts

This is where you will upload new receipt photos.

## Folder 2 - Processed Receipts

This is where receipts will be moved after they have been imported.

![Processed Folder](images/folders.png)

---

# Step 3: Get a Gemini API Key

Google provides a free Gemini API tier that is more than enough for most personal budgeting needs.

Visit:

https://aistudio.google.com

Sign in with your Google account.

Choose:

Get API Key (Small key icon in the bottom left-hand corner)

Create a new API key.

Copy the key somewhere safe.

![Gemini API Key](images/gemini-api-key.png)

### Important

Anyone with your API key can use your Gemini quota.

Do not share your API key publicly.

Never commit it to GitHub.

---

# Step 4: Get Folder IDs

Open your Receipts folder.

The URL will look something like:

```text
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
```

Copy the part after:

```text
folders/
```

That long string is your Folder ID.

Repeat for:
- Receipts
- Processed Receipts

![Folder ID](images/folder-id.png)

---

# Step 5: Open Google Apps Script

Inside your spreadsheet choose:

Extensions → Apps Script

A new Apps Script project will open.

![Open Apps Script](images/open-appscript.png)

Delete any starter code.

---

# Step 6: Install the Script

Download the Apps Script file from this repository:

**[INSERT APPS SCRIPT FILE LINK HERE]**

Copy the entire contents into Apps Script.

Save the project.

![Paste Script](images/paste-script.png)

---

# Step 7: Add Script Properties

In Apps Script:

Project Settings → Script Properties

Create the following properties.

| Property | Value |
|-----------|---------|
| GEMINI_API_KEY | Your Gemini API key |
| RECEIPTS_FOLDER_ID | Receipts folder ID |
| PROCESSED_FOLDER_ID | Processed folder ID |

![Script Properties](images/script-properties.png)

---

# Step 8: Grant Permissions

Run the function:

```javascript
processReceipts
```

for the first time.

Google will ask for permission.

Review the permissions and approve them.

This only needs to be done once.

![Grant Permissions](images/grant-permissions.png)

---

# Step 9: Create an Automatic Trigger

In Apps Script choose:

Triggers → Add Trigger

Settings:

| Setting | Value |
|-----------|---------|
| Function | processReceipts |
| Event Source | Time-driven |
| Type | Hour timer |
| Frequency | Every hour |

![Create Trigger](images/create-trigger.png)

### Why Hourly?

Running every hour:
- Uses fewer Apps Script resources.
- Uses less Gemini quota.
- Is still effectively automatic.

---

# Step 10: Test the System

Upload a receipt image into the Receipts folder.

Wait for the trigger or run:

Expenses → Process Receipts Now

The system should:

1. Read the receipt.
2. Extract the information.
3. Add rows to the spreadsheet.
4. Move the file to Processed Receipts.

![Upload Receipt](images/upload-receipt.png)

---

# Security Notes

This project has access to:
- Your spreadsheet
- Your receipt folders
- Your Gemini API key

Only install scripts from sources you trust.

Never publish your API key.

Never share screenshots that expose your API key or folder IDs.
