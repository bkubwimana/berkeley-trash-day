# Feature specification: Reliance notice and Terms acknowledgement

## Goal

Warn visitors clearly that schedule information can be wrong or outdated, direct them to
authoritative sources, and require affirmative acknowledgement before they submit a report
or download a calendar reminder.

## Requirements

- A conspicuous notice appears before the tracker, not only in the footer.
- The notice names community-data and reminder limitations and links to the Terms of Use.
- Report submission stays disabled until the visitor accepts the current Terms version.
- Calendar actions remain discoverable. Selecting one without current acceptance opens a
  confirmation dialog; accepting continues into the calendar chooser.
- Basic schedule browsing remains available without acceptance.
- The current Terms version is remembered in browser local storage for convenience.
- A submitted report stores the current Terms version and a server-generated acceptance
  timestamp, without an account, exact address, application-stored IP, or fingerprint.
- Calendar downloads remain local and do not create server acceptance records.
- The Terms identify the project as independent and unofficial, require independent
  verification, disclaim warranties, and address tickets, towing, missed collections,
  penalties, property loss, and related reliance damages to the extent permitted by law.
- The Terms do not claim to waive rights or liability that cannot lawfully be waived.
- The site continues to link directly to Berkeley Zero Waste and official parking guidance.

## Acceptance examples

- On a fresh page load, report submission is disabled; reminder actions open confirmation.
- Checking the acknowledgement enables any otherwise-eligible action immediately.
- Reloading the page restores acceptance only when the stored version is current.
- The Terms and Privacy pages are reachable from the tracker and sitemap.
