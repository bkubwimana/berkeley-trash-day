# Data Model: Interactive 9th Street Corridor

This feature adds no stored entity and does not change the schedule API. It derives a
presentation model from each existing BlockSchedule.

## CorridorSegmentView

| Field | Type | Rule |
|---|---|---|
| `block` | SupportedBlock | Existing `2100`–`2400` key |
| `startStreet` | string | Fixed verified boundary for this block |
| `endStreet` | string | Fixed verified boundary for this block |
| `trashActive` | boolean | `BlockSchedule.trash.total > 0` |
| `recyclingActive` | boolean | `BlockSchedule.recycling.total > 0` |
| `compostActive` | boolean | `BlockSchedule.compost.total > 0` |
| `totalReports` | nonnegative integer or null | Sum of stream totals; null while unavailable |
| `coveredStreams` | integer 0–3 or null | Count of streams with at least one recent report; null while unavailable |
| `selected` | boolean | Segment block equals current selected block |

## Fixed boundaries

| Block | Start | End |
|---|---|---|
| 2100 | Addison Street | Allston Way |
| 2200 | Allston Way | Bancroft Way |
| 2300 | Bancroft Way | Channing Way |
| 2400 | Channing Way | Dwight Way |

## State transitions

```text
loading -> unavailable
loading -> empty (three zero totals)
loading -> active (one or more nonzero totals)

unselected <-> selected
```

Only a completed schedule response may move activity from loading/unavailable to empty or
active. A form submission never increments the corridor optimistically; the subsequent
schedule response is the source of truth.
