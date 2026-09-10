# Feature Specification: Multi-stream Same-day Reporting

**Feature Branch**: `005-multi-stream-reporting`
**Created**: 2026-09-09
**Status**: Complete
**Input**: Let residents report that trash, recycling, compost, or any combination are collected on the same observed day.

## User Scenarios & Testing

### User Story 1 - Report every cart collected together (Priority: P1)

A resident can select one or more collection types for a supported block and assign the same observed weekday to all selected types in one submission.

**Independent Test**: Select trash, recycling, and compost with Tuesday, submit once, and verify each Tuesday summary receives exactly one observation.

1. **Given** multiple carts are collected together, **When** the resident selects those collection types and one day, **Then** the service records one observation for each selected type.
2. **Given** collection types are collected on different days, **When** the resident reports one same-day group, **Then** the form explains that another report can be sent for the other day.
3. **Given** no collection type is selected, **When** the resident submits, **Then** the interface asks them to select at least one and stores nothing.

### User Story 2 - Preserve trustworthy historical data (Priority: P1)

Existing reports containing one `stream` remain readable after new reports begin storing a `streams` list.

**Independent Test**: Aggregate a legacy single-stream record and a new multi-stream record and verify each stream count is correct with no duplicate counting.

## Requirements

- **FR-001**: The form MUST allow any non-empty combination of trash, recycling, and compost.
- **FR-002**: One submitted weekday MUST apply to every collection type selected in that submission.
- **FR-003**: A multi-stream submission MUST be stored as one immutable record with a unique, duplicate-free list of supported stream identifiers.
- **FR-004**: Aggregation MUST count a multi-stream record once for each selected stream.
- **FR-005**: Aggregation MUST remain backward compatible with existing records containing a singular `stream` field.
- **FR-006**: Unsupported, empty, duplicated, or malformed stream selections MUST be rejected.
- **FR-007**: The form MUST explain how to report collection types that occur on different weekdays.
- **FR-008**: No additional identity or precise-location information may be collected.

## Success Criteria

- **SC-001**: A resident can report all three collection types on one weekday with one request.
- **SC-002**: Automated tests prove all three streams can appear on one calendar day and receive independent counts.
- **SC-003**: Existing singular-stream records produce the same aggregates as before this feature.
- **SC-004**: The form remains keyboard-operable and usable at 320 CSS pixels.
