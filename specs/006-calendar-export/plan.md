# Implementation Plan: Consensus Calendar Export

**Branch**: `006-calendar-export` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

## Summary

Add a small pure iCalendar generator beside the existing React calendar view. The generator filters the selected range to consensus-only streams, calculates the next matching weekday in UTC, and produces a finite 26-week all-day calendar. React owns only the browser download and availability state.

## Technical Context

- React 19 and Vite client
- Existing schedule aggregate: weekday, evidence counts, and status by range and stream
- No authoritative pickup time or holiday-exception feed
- No calendar account integration or server-side calendar storage

## Design Decisions

1. Use `.ics` because it opens in Apple Calendar and Outlook and imports into Google Calendar without account permissions.
2. Export only `Community consensus`; developing observations remain visible in the on-page evidence view but cannot create reminders.
3. Use all-day events because the project has no pickup-time evidence.
4. Limit recurrence to 26 weeks so stale community observations do not become indefinite claims.
5. Generate the file in-browser; no calendar details leave the device.

## Files

```text
src/calendar.mjs        # deterministic consensus filtering and iCalendar generation
src/App.jsx             # visible action and browser download
src/styles.css          # responsive action styling
test/calendar.test.mjs  # format, filtering, recurrence, and same-day tests
test/content.test.mjs   # visible action and explanatory copy
README.md               # user-facing behavior and limitations
```
