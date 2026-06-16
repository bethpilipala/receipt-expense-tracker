# Frequently Asked Questions (FAQ)

## What is this project?

This project automatically processes receipt images and records the extracted expenses into a Google Sheets budget tracker.

---

## Why would I use this?

Instead of manually entering receipts into a spreadsheet, you can:

- Drop receipt photos into a folder
- Run the script (or schedule it automatically)
- Have expenses categorized and added to your spreadsheet

This saves time and reduces data-entry mistakes.

---

## Is this free?

Yes. We will be using the Gemini API free tier that is sufficient for most personal finance use cases.

---

## The script failed, or nothing happened when it ran. What should I do?

First, check the spreadsheets tab "Gemini Logs". This will show you any errors that may have occurred.

Common causes include:

- Invalid or missing Gemini API key
- Incorrect folder IDs
- Gemini API rate limits or quota limits

If the error mentions Gemini, check your Gemini API usage and logs. Temporary failures can occur if too many requests are made in a short period of time.

You can also try running the script again after a few minutes.

---

## Can I run this automatically?

Yes.

Apps Script triggers can run the receipt processor on a schedule, such as:

- Every hour
- Every day
- Every week

See the setup guide for trigger instructions.

---

## How do I modify the expense categories?

Categories are stored directly in the spreadsheet but are also included in the prompt given to the AI.

To add, remove, or rename categories in the spreadsheet:

1. Open the Categories tab (or the location where your category list is stored).
2. Make your changes.
3. Save the spreadsheet.

To do the same for the AI prompt:

1. Go to Extensions → Apps Script
2. Scroll down until you find the AI prompt
3. Change the categories that the AI will choose from to reflect the categories in your spreadsheet.

Future receipts will use the updated category list when categorizing expenses.

If a category is removed, existing transactions will not automatically change.

---

## The AI categorized something incorrectly.

AI systems are never perfect.

While Gemini is generally very accurate at reading receipts and categorizing purchases, it can occasionally make mistakes.

Examples include:

- Misreading blurry receipts
- Choosing the wrong category
- Missing line items
- Incorrectly identifying vendors

Always review imported transactions before relying on them for budgeting or financial decisions.

If you notice an incorrect category or amount, simply edit the spreadsheet entry manually.

For best results:

- Upload clear, high-quality receipt images.
- Avoid cropped or partially obscured receipts.
- Periodically review recent transactions for accuracy.

---

## Will this overwrite my existing data?

No.

The script only appends new transactions to the spreadsheet.

Your existing budget categories, formulas, and historical transactions are not modified unless you manually edit them.

---

Return to the [README](README.md).