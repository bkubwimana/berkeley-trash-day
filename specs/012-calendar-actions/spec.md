# Feature Specification: Calendar Provider Actions

## Goal

Make calendar actions understandable and actionable instead of presenting an unexplained
file download or a disabled reminder button.

## User stories

### Story 1 — Choose a calendar destination

A resident can choose Google Calendar, Outlook, or a recurring calendar file after
selecting a supported pickup or street-sweeping reminder.

### Story 2 — Confirm at the moment of action

A resident who has not accepted the current Terms can select a reminder action and receive
a concise confirmation dialog. Accepting continues to the calendar chooser.

## Requirements

- **FR-001**: A calendar action with available schedule data MUST open a provider chooser.
- **FR-002**: The chooser MUST offer Google Calendar, Outlook, and a recurring `.ics` file.
- **FR-003**: Google and Outlook MUST open a prefilled all-day next occurrence in a new tab.
- **FR-004**: The chooser MUST state that direct provider links are the next occurrence and
  the `.ics` file contains the complete finite recurring series.
- **FR-005**: Pickup provider choices MUST include one event per consensus stream.
- **FR-006**: Street-sweeping provider choices MUST preserve the selected curb side.
- **FR-007**: A reminder action MUST remain disabled only when schedule data itself is not
  available; missing Terms acceptance MUST trigger confirmation instead of a dead control.
- **FR-008**: Acceptance through the dialog MUST use the existing versioned local record.
- **FR-009**: The provider disclosure MUST explain what reminder data leaves the site.
- **FR-010**: No calendar OAuth token, account identity, or API permission may be requested.

## Success criteria

- Automated tests validate both provider URL formats without local-time date drift.
- The dialogs are keyboard dismissible, restore focus, and fit a 320-pixel viewport.
- Existing recurring calendar-file tests and safety language continue to pass.
- The production build and complete test suite pass.
