# Quickstart Validation: Interactive 9th Street Corridor

Run the automated gates:

```bash
npm test
npm run check
```

Start the local site with `npm run dev` and verify:

1. Cross streets read Addison Street, Allston Way, Bancroft Way, Channing Way, Dwight Way.
2. The selected segment, selected-location heading, form block, and details stay synchronized
   for all four block buttons.
3. Empty local data shows zero recent reports and inactive signals, never "verified" or a
   confidence percentage.
4. After a local report, only its stream signal activates and the segment total matches the
   endpoint aggregate.
5. Keyboard activation and visible focus work for every segment.
6. At 320 CSS pixels, `document.documentElement.scrollWidth` is not greater than
   `document.documentElement.clientWidth`, targets remain at least 44 pixels tall, and labels
   do not overlap.
7. The attribution and unofficial collection-data notice are visible.

Repeat the empty-data, width, content, and security checks against the production URL. Do
not submit fictional valid reports to production.
