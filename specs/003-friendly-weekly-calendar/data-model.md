# Data Model: Friendly Weekly Calendar

This feature stores nothing new and leaves both APIs unchanged.

## WeeklyCalendarView

| Field | Type | Rule |
|---|---|---|
| `unavailable` | boolean | True only when schedule loading failed |
| `days` | seven CalendarDay values | Monday through Sunday, fixed order |

## CalendarDay

| Field | Type | Rule |
|---|---|---|
| `day` | Weekday | Fixed day represented by the cell |
| `streams` | CalendarStream[] | Only summaries with `total > 0` and a valid matching weekday |

## CalendarStream

| Field | Type | Rule |
|---|---|---|
| `id` | trash, recycling, compost | Existing stream key |
| `label` | string | Existing human-readable stream label |
| `status` | string | Existing API evidence status, unchanged |
| `total` | positive integer | Existing recent-report total |

The view is recalculated whenever the selected address range or loaded schedule changes.

