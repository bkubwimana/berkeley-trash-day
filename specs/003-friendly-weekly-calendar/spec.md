# Feature Specification: Friendly Weekly Calendar

**Feature Branch**: `003-friendly-weekly-calendar`
**Created**: 2026-09-08
**Status**: In progress
**Input**: User requested a lighter interface, a generated calendar-oriented logo, the familiar recycling symbol, less repetitive use of “block,” footer-only map attribution, and a calendar as the primary practical value.

## User Scenarios & Testing

### User Story 1 - Read a pickup week at a glance (Priority: P1)

A resident selects an address range and sees a seven-day week populated from the same recent community summaries used by the detail cards.

**Independent Test**: Feed summaries for multiple streams on one or more weekdays and verify every stream appears on exactly its reported weekday with its evidence status available.

**Acceptance Scenarios**:

1. **Given** trash and recycling share Tuesday, **When** the calendar renders, **Then** both appear in Tuesday and no other day.
2. **Given** a stream has no reports, **When** the calendar renders, **Then** it is not placed on a weekday.
3. **Given** schedule loading fails, **When** the calendar renders, **Then** days show unavailable rather than invented pickup information.
4. **Given** a weekday is based on developing evidence, **When** it appears, **Then** its developing status remains available visually and to assistive technology.

### User Story 2 - Experience a friendly civic interface (Priority: P2)

A visitor sees a light, approachable interface with a distinctive project logo and familiar collection symbols.

**Independent Test**: Inspect desktop and mobile renders and verify the default palette is light, text contrast remains readable, the selected logo is visible, and recycling uses the standard three-arrow loop.

### User Story 3 - Focus on the map rather than metadata (Priority: P3)

A visitor sees uncluttered address numbers on the road while source attribution remains available at the bottom of the page.

**Independent Test**: Verify road segments visibly show only address numbers, their accessible names still identify them as blocks, and OpenStreetMap attribution occurs in the footer rather than the corridor.

## Requirements

- **FR-001**: The selected range MUST provide a seven-day Monday-through-Sunday calendar.
- **FR-002**: Calendar placement MUST derive only from the selected range’s loaded stream summaries.
- **FR-003**: Streams without a reported weekday MUST NOT be assigned to a day.
- **FR-004**: Calendar events MUST expose collection type, evidence status, and recent report count to assistive technology.
- **FR-005**: The calendar MUST state that it is a typical community-reported week and may not reflect holiday changes.
- **FR-006**: The system MUST NOT generate recurring external calendar events until holiday exceptions have an authoritative source.
- **FR-007**: The default theme MUST be light and retain readable contrast and distinct neutral, blue, and green stream colors.
- **FR-008**: The header MUST use the user-selected generated calendar logo and MUST NOT display “BT.”
- **FR-009**: Recycling MUST use the familiar three-arrow loop.
- **FR-010**: Road segments MUST visually omit the repeated word “block” while retaining it for assistive technology.
- **FR-011**: OpenStreetMap attribution MUST be placed in the site footer, not inside the corridor.
- **FR-012**: The calendar and corridor MUST fit at 320 CSS pixels without horizontal page overflow.
- **FR-013**: The corridor MUST identify “9th Street corridor · Berkeley, CA” with a
  recognizable vector map-pin symbol that does not depend on emoji rendering.

## Success Criteria

- **SC-001**: Calendar unit tests correctly place 100% of test streams on their reported weekday.
- **SC-002**: Empty and unavailable calendar states introduce zero pickup claims.
- **SC-003**: Desktop and 320-pixel screenshots show no horizontal overflow.
- **SC-004**: The rendered header contains no “BT” text.
- **SC-005**: OpenStreetMap attribution is visible after the main content and absent from the corridor.
- **SC-006**: The location caption remains legible and aligned at desktop and 320 CSS pixels.
