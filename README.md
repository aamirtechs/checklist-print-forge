# Checklist Print Forge
Live page: https://aamirtechs.github.io/checklist-print-forge/

Opening and closing checklists, cleaning rotas and warehouse checks live in documents that print badly: no checkboxes, no room to sign, sections split across pages. Checklist Print Forge turns your own Markdown or CSV list into a clean, print-ready PDF with checkboxes, section headings, frequency badges and sign-off lines.

## Features
- Paste a Markdown task list (- [ ] items, headings become sections) or CSV (section, task, frequency)
- Print layout planning for A4 or Letter, with section grouping
- Frequency badges for daily and weekly tasks
- Date line plus completed-by and sign-off footer lines
- Print-ready PDF export via pdf-lib, and lists saved in your browser (localStorage)

## How it works
Paste your list, choose a page size, and preview the exact page plan: which sections and tasks land on which page. The PDF is then rendered locally with pdf-lib from that same plan, so what you preview is what prints. It runs entirely in the browser.

## Privacy
Runs 100% in your browser. Your files never leave this device, nothing is uploaded,
and there is no tracking.

## Development
Core logic lives in `src/logic.js` and is shared by the page and the tests.
Run the tests with `npm test`.

## License
MIT, Copyright 2026 Amir Hussain.
