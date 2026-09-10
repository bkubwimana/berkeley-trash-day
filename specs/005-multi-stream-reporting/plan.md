# Implementation Plan: Multi-stream Same-day Reporting

## Design

- Replace mutually exclusive collection-type radios with checkboxes.
- Keep one weekday selector; every checked type shares that observed day.
- Submit one `streams` array to the existing report endpoint and store one blob record.
- Normalize legacy singular `stream` records during aggregation without rewriting production data.
- Keep validation server-side and reject empty, duplicate, unknown, or mixed legacy/new fields.
- Update the OpenAPI contract, privacy copy, README example, and the stale City GIS reference.

## Verification

- Unit-test batch validation, legacy compatibility, duplicate rejection, and three streams on one day.
- Content-test the checkbox affordance and explanatory copy.
- Run the complete test suite and production build.
- Verify the deployed form and live schedule endpoint without inserting fabricated reports.

