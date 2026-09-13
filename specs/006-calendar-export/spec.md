# Feature Specification: Consensus Calendar Export

**Feature Branch**: `006-calendar-export`  
**Created**: 2026-09-12  
**Input**: Add a visible calendar action that turns sufficiently supported community pickup days into useful reminders.

## User Story

As a resident viewing a supported range, I can download its consensus pickup days as a calendar file so I do not have to remember the schedule manually.

## Acceptance Scenarios

1. **Given** one or more streams have `Community consensus`, **when** the resident selects “Add to calendar,” **then** one `.ics` file downloads with a weekly all-day reminder for each consensus stream.
2. **Given** a stream is still `Developing` or has no reports, **when** the calendar is exported, **then** that stream is omitted.
3. **Given** no stream has consensus, **then** the calendar action remains visible but disabled and explains when it becomes available.
4. **Given** multiple streams share the same weekday, **then** each is exported as a separate event on that weekday.
5. **Given** an exported reminder, **then** it is labeled unofficial, says holiday changes may not appear, and does not invent a pickup time.

## Requirements

- **FR-001**: The weekly calendar MUST expose a visible “Add to calendar” action.
- **FR-002**: Export MUST use the interoperable iCalendar (`.ics`) format.
- **FR-003**: Only summaries whose status is exactly `Community consensus` and whose weekday is valid MUST be exported.
- **FR-004**: Each exported stream MUST be an all-day event recurring weekly for 26 occurrences.
- **FR-005**: The first occurrence MUST be the next matching weekday on or after the export date.
- **FR-006**: The file MUST contain separate events when two or three collection streams share a weekday.
- **FR-007**: The file MUST identify the range and collection stream and disclose that the schedule is unofficial community data.
- **FR-008**: The UI MUST state that holiday changes may not appear.
- **FR-009**: Calendar generation MUST happen locally in the browser and MUST NOT request calendar identity, permissions, or personal data.
- **FR-010**: This feature supersedes the export deferral in `003-friendly-weekly-calendar`; the new consensus-only, finite recurrence and explicit disclaimer are required safeguards.

## Success Criteria

- **SC-001**: Automated tests demonstrate valid `.ics` output for one and multiple consensus streams.
- **SC-002**: Automated tests demonstrate zero exported events for developing, empty, invalid, or unavailable schedules.
- **SC-003**: The action and its availability explanation remain usable at 320 CSS pixels.
- **SC-004**: The production build and complete test suite pass.
