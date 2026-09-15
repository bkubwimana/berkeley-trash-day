# Feature specification: Street-sweeping reminders

## Goal

Help a person parking in a selected West Berkeley street range find the City of Berkeley's published residential street-sweeping schedule for the correct curb side and add a useful reminder to their calendar.

## User stories

1. As a driver, I can choose the side where I parked and see the published week, weekday, and AM/PM window.
2. As a driver, I can download a calendar reminder for that curb side without giving the site calendar access.
3. As a driver, I am warned that posted signs control and that holiday service can differ.
4. As a visitor outside a published residential route, I see an honest unavailable state and a link to the City rather than a guessed schedule.

## Functional requirements

- The selected map range determines which City schedule rows are eligible.
- Opposite curb sides remain separate when the City lists separate schedules.
- Side labels include address parity: west/south are even; east/north are odd, following the City's schedule note.
- A City opt-out block must not be presented as covered by the corresponding schedule row.
- Each available side has its own `.ics` download with 24 monthly reminders and a one-day alert.
- Calendar events describe the published AM/PM window but do not invent an exact clock time.
- The interface links to the official City street-sweeping page and identifies the City PDF source.
- The feature stores no address, parking location, or calendar data.

## Safety and accuracy requirements

- “Posted signs control” must appear beside every available schedule and in every exported event.
- The interface must state that City holidays are not swept and that the next regular date applies.
- Missing coverage is shown as missing published residential data, not as “no sweeping.”
- Source data is checked in as a generated module so the deployed app does not depend on runtime PDF parsing.

## Acceptance examples

- `2100 9th Street` shows west/even as first Friday AM and east/odd as second Monday AM.
- `2100 8th Street` does not show the west/even route because the City schedule lists that block as opted out; east/odd remains available.
- An unsupported range displays the City-link fallback and cannot export a sweeping calendar.
- The downloaded calendar includes the selected range, curb side, recurrence, safety warning, source URL, and no fabricated exact time.

