# Good first issues

## Add a two-column layout option
Offer a two-column page plan for long lists.
Extend the layout planner in src/logic.js and add tests for the column split.

## Add numbered task rows
Optionally number tasks within each section on the printed sheet.
Keep numbering in the layout plan so the page and PDF agree.

## Add list sharing via URL hash
Encode the current list into the URL hash so a manager can share a link.
Decode on load when a hash is present.
