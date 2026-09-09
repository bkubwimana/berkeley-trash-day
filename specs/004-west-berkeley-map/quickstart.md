# Quickstart: West Berkeley Map Verification

1. Run `npm test`.
2. Run `npm run check`.
3. Open the production build at desktop width and verify the light map loads in West Berkeley.
4. Search `2100 9th`, choose the result, and confirm map, summary, calendar, pickup details, and form agree.
5. Search `Allston` and verify both adjacent live ranges appear.
6. Search an unsupported street and verify the empty-coverage message contains no schedule claim.
7. Disable the tile host and verify the semantic range buttons remain usable.
8. At 320 CSS pixels, verify no horizontal overflow and touch targets remain at least 44 CSS pixels.
9. Confirm the selected summary uses a location pin rather than `·` punctuation.
10. Confirm map/data attribution and the tile privacy disclosure are visible.
