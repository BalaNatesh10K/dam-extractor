# DAM Paths Extractor Chrome Extension

A Chrome extension that extracts all unique image paths (`src` and `srcset`) starting with `/content/dam` from the current webpage.  
It displays the results in a popup with options to copy to clipboard or save as a `.txt` file. The results are also logged to the browser console.

---

## Features

- Extracts unique `/content/dam` image paths from the current page.
- Displays results in a clean, translucent popup with blue accents.
- Copy results to clipboard with a confirmation tooltip.
- Save results as a `.txt` file.
- Logs results to the browser console for easy inspection.
- Handles large result sets with a scrollable textarea.

---

## Installation

1. Clone or download this repository.

2. Open Chrome and go to `chrome://extensions/`.

3. Enable **Developer mode** (toggle switch in top right).

4. Click **Load unpacked** and select the extension folder.

5. The extension will appear in your toolbar.

---

## Usage

- Navigate to any webpage.
- Click the extension icon.
- The popup will show all unique image paths starting with `/content/dam`.
- Use **Copy to Clipboard** or **Save as .txt** buttons to export the results.
- Check the browser console for the logged paths as well.

---

## File Structure

- `manifest.json` — Extension manifest and permissions.
- `popup.html` — Popup UI with styles.
- `popup.js` — JavaScript logic for extracting paths and handling UI actions.
- `README.md` — This file.

---

## Notes

- The extension only extracts image paths starting with `/content/dam`.
- Duplicate paths are automatically removed.
