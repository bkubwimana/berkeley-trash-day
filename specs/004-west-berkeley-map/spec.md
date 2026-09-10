# Feature Specification: West Berkeley Map

**Feature Branch**: `004-west-berkeley-map`
**Created**: 2026-09-08
**Status**: Complete
**Input**: Replace the fixed corridor drawing with a scalable, attractive canvas map for searching and expanding across West Berkeley.

## User Scenarios & Testing

### User Story 1 - Browse real West Berkeley geography (Priority: P1)

A resident can pan and zoom a light, labeled map of West Berkeley and see community-report coverage drawn on the real street centerline.

**Independent Test**: Load the tracker in a WebGL-capable browser and verify the map starts in West Berkeley, supports pan and zoom, and draws only registry-backed service ranges as interactive overlays.

1. **Given** the tracker loads, **When** the resident views the map, **Then** real roads, buildings, parks, and neighborhood labels provide geographic context.
2. **Given** a supported range is selected, **When** the map updates, **Then** that real street segment is visually distinct and the schedule below uses the same range identifier.
3. **Given** an unsupported part of West Berkeley is visible, **When** the resident explores it, **Then** the application makes no pickup-day or report-coverage claim for it.

### User Story 2 - Search the growing service registry (Priority: P1)

A resident can search by supported address range, street, or cross street and move the map to the matching range.

**Independent Test**: Search for `2100 9th`, `Ninth Street`, and `Allston`; verify matching ranges are returned and selection synchronizes the map, summary, calendar, details, and report form.

1. **Given** a matching query, **When** the resident chooses a result, **Then** the map fits that segment and every dependent control selects the same range.
2. **Given** no registry match, **When** the search is submitted, **Then** the interface explains that community reporting is not live there yet and does not call a public autocomplete service.

### User Story 3 - Keep the lookup usable without canvas (Priority: P2)

A keyboard, screen-reader, reduced-data, or no-WebGL visitor can select the same supported ranges from a semantic list.

**Independent Test**: Block the tile/style request and verify the range search and list still select schedules without horizontal overflow at 320 CSS pixels.

## Requirements

- **FR-001**: The primary geography view MUST use MapLibre GL JS and a WebGL canvas.
- **FR-002**: The basemap MUST open on a bounded West Berkeley view and use a light vector style.
- **FR-003**: Selectable overlays MUST derive from a versioned local service-area registry with real centerline geometry and fixed report identifiers.
- **FR-004**: The map MUST NOT imply that visible but unregistered streets have schedule coverage.
- **FR-005**: Search MUST match the local registry by address range, street name, and cross streets.
- **FR-006**: Search MUST NOT send keystrokes, exact addresses, or resident input to a third-party geocoder.
- **FR-007**: Map and list selection MUST synchronize the summary, calendar, details, and report form.
- **FR-008**: A semantic button list MUST provide every selectable range outside the canvas.
- **FR-009**: If WebGL, the map style, or map tiles fail, lookup and reporting MUST remain usable.
- **FR-010**: The privacy page MUST disclose that the tile provider receives ordinary connection data when the map loads.
- **FR-011**: Footer attribution MUST credit OpenFreeMap, OpenMapTiles, OpenStreetMap contributors, and Berkeley's street network source.
- **FR-012**: The implementation MUST fit at 320 CSS pixels and honor reduced motion.
- **FR-013**: The selected-range summary MUST use a vector location pin instead of a punctuation dot.
- **FR-014**: The report API and stored report schema MUST remain limited to fixed block identifiers, selected streams, weekday, and receipt time.
- **FR-015**: The MapLibre host MUST fill the visible map stage even when the library stylesheet loads after application styles.

## Success Criteria

- **SC-001**: All supported registry entries render as map features and semantic selection buttons.
- **SC-002**: Search tests correctly match range, numeric/street alias, and cross-street queries and return no false match for an unsupported street.
- **SC-003**: Clicking or searching a range changes all five dependent views to the same identifier.
- **SC-004**: A failed map load introduces zero false schedule claims and does not block lookup or reporting.
- **SC-005**: Desktop and 320-pixel screenshots have no page-level horizontal overflow.
- **SC-006**: In a production browser, the MapLibre host has the same non-zero height as the visible map stage and the basemap is visible.

## Scope

The map browses West Berkeley. Community schedule reporting remains live only for registry-backed ranges. Adding all West Berkeley reportable ranges requires an explicit, reviewable ingestion of Berkeley's official street-centerline/address-range dataset rather than generated or guessed geometry.
