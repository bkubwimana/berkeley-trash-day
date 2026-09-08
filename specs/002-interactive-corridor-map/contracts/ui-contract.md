# UI Contract: Interactive Corridor

## Semantic structure

- One group named "9th Street block" contains four native button segments in ascending
  block order.
- Every segment exposes its block, start and end cross street, current recent-report total,
  and selected state in text or an accessible name.
- Exactly one segment has `aria-pressed="true"` after initialization.
- Five visible boundary labels appear in the documented geographic order.

## Data mapping

For each `blocks[block]` object returned by the unchanged schedule endpoint:

```text
trash active     = blocks[block].trash.total > 0
recycling active = blocks[block].recycling.total > 0
compost active   = blocks[block].compost.total > 0
recent total     = trash.total + recycling.total + compost.total
```

When schedule loading fails, signals remain inactive and total text reads "Unavailable"
rather than `0`.

## Selection synchronization

Activating any segment updates, in the same interaction:

1. the segment's visual selected state;
2. `aria-pressed` on all four buttons;
3. the selected block heading;
4. the report form's block selection; and
5. all three detailed collection cards.

## Claim guardrails

The corridor must not contain the words "verified" or "confidence," any percentage, or a
pickup weekday. Those concepts remain governed by the detailed aggregate view. The count
must be labeled as recent community reports.

## Responsive contract

- Minimum segment height: 44 CSS pixels.
- At 320 CSS pixels, the corridor fits the viewport with no page-level horizontal overflow.
- Cross-street labels must not overlap segment content.
- Information and selection remain available with reduced motion and without color.
