# Research: Full West Berkeley Reporting Coverage

## Decision 1: Use Berkeley's Block Numbers service

The City GIS layer supplies stable centerline IDs, left/right address bounds, full street names, municipality tags, road class, update timestamps, and polyline geometry. This is more suitable for a reporting registry than inferring blocks from visual basemap tiles.

## Decision 2: Define an operational boundary explicitly

City planning references describe West Berkeley as a strip along the city's western edge with San Pablo Avenue forming its eastern edge. The generator retains Berkeley-tagged addressable ranges whose representative point is on or west of the Berkeley portion of San Pablo Avenue. This definition is documented as operational coverage, not presented as a legal neighborhood boundary.

## Decision 3: Group source fragments by street and hundred range

The centerline network sometimes splits one resident-facing block into several records. Grouping the same normalized street and hundred range prevents duplicate choices while retaining every source ID for traceability.

## Decision 4: Preserve original public IDs

The first four ranges may already have community records keyed by `2100`, `2200`, `2300`, and `2400`. Their IDs remain unchanged. New ranges use `cob-<centerline IDs>` to avoid street-number collisions.

## Decision 5: Do not transmit address searches

The checked-in registry contains public street-range data. Search is performed in JavaScript and an entered house number is used only to match numeric bounds in memory.
