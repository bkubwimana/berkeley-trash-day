# UI Contract: West Berkeley Map

## Search

- Label: `Search supported ranges`
- Placeholder: `Try “2100 9th” or “Allston”`
- Results are native buttons with range, street, and cross streets.
- Empty message: `No live community range matches that search yet.`
- Search is local and has no autocomplete network request.

## Map

- Starts on the West Berkeley neighborhood view.
- Uses a light base style with normal map navigation controls.
- Supported lines are green; the selected line is wider and coral-accented.
- The canvas has an accessible name but is never the only way to select a range.
- Loading/failure status is announced without removing the semantic result list.

## Selection

One `selectedBlock` React value controls map highlight, result/list pressed state, selected-range summary, weekly calendar, pickup cards, and report form.

## Attribution

Attribution appears in the footer, not over the selection controls: OpenFreeMap, OpenMapTiles, OpenStreetMap contributors, and City of Berkeley Streets Network.
