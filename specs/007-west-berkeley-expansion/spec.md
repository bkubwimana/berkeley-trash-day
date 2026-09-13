# Feature Specification: Full West Berkeley Reporting Coverage

**Feature Branch**: `007-west-berkeley-expansion`
**Created**: 2026-09-12
**Input**: Expand community reporting from four Ninth Street ranges to all addressable West Berkeley street ranges.

## User Stories

### Story 1 — Find any supported West Berkeley address

As a West Berkeley resident, I can search my street address or street name and select the matching official block range.

**Acceptance scenarios**

1. Given an address on or west of San Pablo Avenue within Berkeley, searching its number and street returns the containing range.
2. Searching a street or cross street returns matching ranges without loading every result into an unbounded list.
3. Selecting a result synchronizes the map, range summary, calendar, pickup details, and reporting form.

### Story 2 — Submit a report outside Ninth Street

As a resident on another West Berkeley street, I can submit the same privacy-preserving trash, recycling, and compost observation available to the original four ranges.

**Acceptance scenarios**

1. The API accepts every ID in the generated West Berkeley registry and rejects IDs outside it.
2. A stored report records the selected registry ID and its public street/range label, never an exact household address.
3. The four original Ninth Street IDs remain valid so existing community reports are preserved.

### Story 3 — Maintain the coverage dataset

As an open-source contributor, I can regenerate the registry from the documented City of Berkeley public GIS source instead of hand-editing map geometry.

## Requirements

- **FR-001**: Coverage MUST use the City of Berkeley `Block Numbers` centerline layer as the range, address, municipality, and geometry source.
- **FR-002**: For this release, West Berkeley MUST mean addressable Berkeley centerlines on or west of San Pablo Avenue, from the Oakland/Emeryville boundary to the Albany boundary.
- **FR-003**: Highways, ramps, pedestrian overpasses, and ranges without usable address numbers MUST NOT be opened for residential reports.
- **FR-004**: Adjacent source fragments for the same street and hundred range MUST be grouped into one reporting area.
- **FR-005**: Every reporting area MUST have a stable ID, display range, street name, geometry, center, address bounds, and source centerline IDs.
- **FR-006**: The original IDs `2100`, `2200`, `2300`, and `2400` MUST map to their existing Ninth Street ranges.
- **FR-007**: One canonical generated registry MUST drive map features, local search, selection labels, form options, API validation, and schedule aggregation.
- **FR-008**: Address search MUST happen locally and MUST NOT retain or transmit search text or an entered exact address.
- **FR-009**: The result list MUST be bounded and progressively reveal more matches.
- **FR-010**: The UI MUST report the generated number of live ranges and streets without hardcoded counts.
- **FR-011**: Source attribution and the operational coverage definition MUST be documented.
- **FR-012**: Existing stored report shapes MUST remain readable.

## Success Criteria

- **SC-001**: Every generated ID is unique and every area has valid WGS84 line geometry and numeric address bounds.
- **SC-002**: The generated registry includes the four original Ninth Street ranges and multiple non-Ninth Street examples across West Berkeley.
- **SC-003**: Exact-address, street, range, abbreviation, ordinal, and cross-street search behaviors pass automated tests.
- **SC-004**: API and aggregate tests prove a non-Ninth Street range can report and reach consensus.
- **SC-005**: The interface works at 320 CSS pixels and does not render an unbounded result list.
- **SC-006**: Full tests, production build, and browser verification pass before deployment.
