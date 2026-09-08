# Research: Interactive 9th Street Corridor

## Decision 1: Use the real 2100–2400 cross-street sequence

**Decision**: Display the corridor as Addison Street → 2100 block → Allston Way → 2200
block → Bancroft Way → 2300 block → Channing Way → 2400 block → Dwight Way.

**Rationale**: OpenStreetMap address points place sample 2101, 2201, 2301, and 2401 Ninth
Street addresses in those four consecutive intervals. City of Berkeley pavement records
independently describe 9th Street sections spanning University to Bancroft, Bancroft to
Channing, and Channing to Dwight, supporting the street order. This avoids reusing the
reference mockup's unrelated south-Berkeley street labels.

**Alternatives considered**:

- Copy Heinz, Ashby, Murray, Pardee, and Parker from the mockup: rejected because they do
  not bound the 2100–2400 address ranges.
- Omit all boundary names: safe but less useful for spatial recognition.
- Embed a live map: rejected because the four-segment schematic meets the user need without
  location permissions, runtime tile requests, or a heavy dependency.

**Sources**:

- [OpenStreetMap](https://www.openstreetmap.org/copyright) address points and street centerlines
- [City of Berkeley pavement management update](https://berkeleyca.gov/sites/default/files/2022-02/Pavement-Management-Update-2020.pdf)
- [City of Berkeley Community GIS Portal](https://berkeleyca.gov/city-services/community-gis-portal)

## Decision 2: Signals mean report presence, not verification

**Decision**: Each segment has trash, recycling, and compost signals. A signal is active
only when that stream's recent `total` is greater than zero. The segment count is the sum
of all three totals and is labeled "recent reports."

**Rationale**: The compact graphic becomes live and useful while remaining a faithful view
of the existing API. Status and weekdays stay in the detail cards, where the evidence can
be explained without ambiguity.

**Alternatives considered**:

- "Verified" count: rejected because community agreement is not official verification.
- Percentage confidence: rejected because the first feature deliberately uses raw counts
  and a documented threshold.
- Hard-coded colorful signals: rejected because decoration would imply nonexistent data.

## Decision 3: Use native buttons inside a CSS schematic

**Decision**: Keep one native button per block and visually connect them with a street line
and boundary markers. Include bounds and activity in accessible labels.

**Rationale**: Native buttons already provide keyboard activation and pressed-state support.
CSS can produce the map-like structure without canvas semantics or SVG focus complexity.

**Alternatives considered**:

- Canvas: rejected because text, focus, resizing, and screen-reader semantics would need a
  second accessibility implementation.
- Clickable SVG paths: viable but unnecessary for four equal rectangular segments.
- Horizontally scrolling mobile map: rejected because the primary flow must not require
  horizontal page scrolling.

## Decision 4: Reuse the mockup's visual grammar, not its fictional data

**Decision**: Use a faint CSS grid, central roadway, extended intersection markers, colored
stream signals, collection symbols, and a three-column selected-block summary. Populate the
summary with active block, recent reports, and streams with coverage.

**Rationale**: These elements make the tool feel spatial and technically intentional. They
do not require a mapping runtime and can remain fully driven by the existing aggregate.
OpenStreetMap is used only to validate and attribute street labels; it is not queried by a
visitor's browser and supplies no collection schedule.

**Alternatives considered**:

- Copy "verified" and percentage confidence from the picture: rejected because neither is
  supported by the data model.
- Use letters as permanent collection icons: rejected because familiar bin, recycling, and
  leaf symbols scan faster when paired with existing text labels.
- Load a tile map under the controls: rejected because a decorative grid provides the needed
  spatial texture without another network service or privacy disclosure.

## Decision 5: Use React components now; reserve MapLibre for broader coverage

**Decision**: Migrate the frontend to React and Vite. Keep this four-block experience as
a CSS schematic, with the corridor view model isolated so a future MapLibre component can
render citywide GeoJSON or vector-tile service areas.

**Rationale**: React provides reusable stateful components for additional corridors,
filters, moderation, and map overlays. MapLibre is designed for interactive vector tiles
and GeoJSON, but a live basemap at this stage adds rendering weight and a third-party tile
request without improving the accuracy of the community schedule itself.

**Alternative considered**: Add a live tile map immediately. Rejected for this bounded
release because the concept design is a schematic and the project currently has only four
known block choices. Revisit when the data model includes broader geographic coverage.
