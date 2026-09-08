# Feature Specification: Interactive 9th Street Corridor

**Feature Branch**: `002-interactive-corridor-map`

**Created**: 2026-09-07

**Status**: Ready for planning

**Input**: User description: "Make the block selection feel like an interactive corridor
map, similar to the supplied dark dashboard design, while retaining real geography and
real community data rather than fabricated verification or confidence values."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select a Block Spatially (Priority: P1)

A resident sees the four supported blocks as contiguous segments of 9th Street between
their real cross streets and selects a segment to inspect its collection details.

**Why this priority**: Spatial context makes a block faster to recognize than four generic
buttons and is the main value of this refinement.

**Independent Test**: Select each segment with a mouse and keyboard and confirm that exactly
one block is highlighted, its cross-street bounds are correct, and the details below match
the selected block.

**Acceptance Scenarios**:

1. **Given** the tracker loads, **When** a resident views the corridor, **Then** the cross
   streets appear in geographic order as Addison Street, Allston Way, Bancroft Way,
   Channing Way, and Dwight Way.
2. **Given** a resident selects a block segment, **When** selection changes, **Then** that
   segment receives a visible and programmatic selected state and the details below update
   to the same block.
3. **Given** a resident knows either the block number or bounding streets, **When** they scan
   the corridor, **Then** both pieces of information are visible without another map.

---

### User Story 2 - Scan Community Activity (Priority: P2)

A resident can see whether each block has recent trash, recycling, and compost reports
before selecting it, without mistaking colored decoration for official verification.

**Why this priority**: Small live signals make the corridor informative while preserving
the transparent detail cards as the source of truth.

**Independent Test**: Supply empty and mixed report aggregates and confirm that every block
shows the correct total and per-stream presence, with text available to assistive technology.

**Acceptance Scenarios**:

1. **Given** a block has no recent reports, **When** the corridor renders, **Then** it shows
   zero reports and subdued stream signals without suggesting a pickup day.
2. **Given** a block has reports for some collection streams, **When** it renders, **Then**
   only those stream signals become active and the displayed total equals the sum of the
   three stream totals.
3. **Given** a visitor cannot distinguish the signal colors, **When** they use assistive
   text or inspect the detailed cards, **Then** collection type, count, day, and status remain
   understandable.

---

### User Story 3 - Use the Corridor on a Small Screen (Priority: P3)

A mobile resident can move through the same corridor without horizontal page scrolling or
tiny targets.

**Why this priority**: Residents are likely to look up a schedule from a phone near their
carts or curb.

**Independent Test**: At 320 CSS pixels, navigate all four segments by keyboard and touch,
then inspect all detail cards and submit a report without horizontal page scrolling.

**Acceptance Scenarios**:

1. **Given** a narrow screen, **When** the corridor renders, **Then** block segments remain
   at least 44 CSS pixels tall and fit within the page.
2. **Given** reduced-motion preferences, **When** selection changes, **Then** no essential
   feedback depends on animation.

### Edge Cases

- Schedule data cannot load. The corridor remains selectable, shows activity as unavailable,
  and the detail cards explain the failure.
- A block has several reports in one stream and none in the other two. The total and active
  signals reflect that distribution exactly.
- Long cross-street labels wrap on a narrow screen without overlapping the street or blocks.
- A report is submitted while another block is selected. Only the aggregate returned by the
  service controls activity signals; the client never increments a count optimistically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tracker MUST present the 2100–2400 block options as one contiguous,
  map-like 9th Street corridor rather than an unrelated button grid.
- **FR-002**: The corridor MUST label the five boundaries in order: Addison Street, Allston
  Way, Bancroft Way, Channing Way, and Dwight Way.
- **FR-003**: Each segment MUST show its block number and bounding cross streets.
- **FR-004**: Selecting a segment MUST update its visual selected state, programmatic pressed
  state, selected-location summary, report-form block, and schedule detail cards together.
- **FR-005**: Each segment MUST display one signal for trash, recycling, and compost plus the
  total number of recent reports across those streams.
- **FR-006**: A stream signal MUST become active only when the loaded aggregate reports a
  nonzero recent total for that block and stream.
- **FR-007**: Corridor signals MUST NOT use "verified," an opaque confidence percentage, a
  fabricated count, or a hard-coded pickup day.
- **FR-008**: The meaning and current state of each stream signal MUST be available as text
  to assistive technology and MUST remain fully explained in the detail cards.
- **FR-009**: Every segment MUST be keyboard operable, have a visible focus state, and provide
  a target at least 44 CSS pixels tall.
- **FR-010**: The corridor and primary tracker controls MUST fit at 320 CSS pixels without
  horizontal page scrolling or overlapping labels.
- **FR-011**: The map-like presentation MUST NOT request geolocation, load map tiles, expose
  exact addresses, or add another resident data field.
- **FR-012**: The interface MUST attribute the source used to validate the cross-street
  labels and continue to distinguish the schematic from official collection information.
- **FR-013**: The corridor MUST use a restrained map-grid background, a central street line,
  and intersection markers to communicate spatial continuity without loading map tiles.
- **FR-014**: Trash, recycling, and compost MUST use recognizable symbols alongside text
  labels in the detailed schedule view; symbols MUST be decorative to assistive technology.
- **FR-015**: The selected-block summary MUST show the active block, its real recent-report
  total, and the number of streams with recent coverage instead of a verification or
  confidence claim.
- **FR-016**: The frontend MUST use reusable React components and keep corridor view
  derivation separate from rendering so broader geographic views can be introduced
  without changing the reporting API.

### Key Entities

- **Corridor Segment**: A presentation of one existing Supported Block with its northern and
  southern boundary labels, three activity signals, report total, and selected state.
- **Activity Signal**: A non-authoritative indication that at least one recent community
  report exists for one collection stream on one block.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time resident can identify and select a target block from either its
  number or cross streets in under 15 seconds.
- **SC-002**: In data-driven scenario tests, 100% of corridor totals equal the sum of the
  three corresponding recent stream totals.
- **SC-003**: In data-driven scenario tests, 100% of active signals correspond to a nonzero
  recent report total and no empty stream appears active.
- **SC-004**: All four segments can be selected with a keyboard and remain at least 44 CSS
  pixels tall at viewport widths down to 320 CSS pixels.
- **SC-005**: The 320-pixel layout has no horizontal page overflow, cross-street overlap, or
  loss of primary lookup and reporting functionality.
- **SC-006**: No corridor label or signal introduces an unsupported schedule, verification
  claim, confidence score, or resident data field.
- **SC-007**: The visual hierarchy contains a recognizable map grid, street, intersections,
  three stream colors, and three collection symbols while every datum remains readable as
  text.

## Assumptions

- The corridor is a schematic orientation aid, not a parcel-level geographic map.
- Address numbering increases from the Addison Street boundary toward Dwight Way for the
  supported 2100–2400 ranges.
- Street-label validation uses current OpenStreetMap address and street-centerline data,
  cross-checked with City of Berkeley documents describing 9th Street segments.
- Detailed schedule cards remain the authoritative explanation of the community aggregate.
- The feature changes presentation only; report storage, retention, consensus, and API
  contracts remain unchanged.
