# UI Contract: Friendly Weekly Calendar

- The calendar contains exactly seven ordered weekday cells.
- A stream appears only in the cell matching its loaded summary weekday when its total is positive.
- Each visible event includes a recognizable stream symbol and label.
- Each event exposes evidence status and recent report count as assistive text.
- Empty data produces no event; load failure uses “Unavailable.”
- The visible calendar note describes a typical community-reported week and holiday limitation.
- Road segments contain only address numbers visually; “block” remains screen-reader-only.
- Street attribution appears in the footer after main content.
- At 320 CSS pixels, calendar cells wrap without document-level horizontal overflow.

