# Implementation plan

1. Import the three City residential street-sweeping PDF tables into a deterministic generated JavaScript module.
2. Match official rows to the canonical service-area registry by normalized street name, numeric range overlap, side, and opt-out block.
3. Add a side-aware street-sweeping panel below the pickup calendar.
4. Generate a separate privacy-preserving `.ics` file for each curb side.
5. Add source, holiday, ticket-risk, and posted-sign safeguards.
6. Cover matching, opt-outs, recurrence, ICS content, UI content, build, and mobile layout with tests and visual verification.

