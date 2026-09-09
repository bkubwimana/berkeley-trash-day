# Research: West Berkeley Map

## Rendering

**Decision**: Use MapLibre GL JS with OpenFreeMap's Positron style.

**Rationale**: MapLibre renders interactive vector maps with WebGL and accepts GeoJSON overlays. OpenFreeMap publishes ready-to-use MapLibre style endpoints, including a light Positron design, without requiring a browser API token.

- [MapLibre GL JS documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [OpenFreeMap quick start](https://openfreemap.org/quick_start/)

## Street geometry and expansion

**Decision**: Keep a versioned local registry for enabled report ranges. Use the City of Berkeley Streets Network dataset as the reviewed ingestion source for future West Berkeley expansion.

**Rationale**: Berkeley describes the dataset as its street-centerline network and says it includes address ranges for each street segment. The existing Ninth Street registry is anchored to current OpenStreetMap centerline geometry and address points. Visible basemap features outside that registry are never treated as schedule coverage.

- [City of Berkeley Community GIS Portal](https://berkeleyca.gov/city-services/community-gis-portal)
- [City of Berkeley Streets Network](https://data.cityofberkeley.info/Transportation/Streets-Network/hqnk-qfhq)
- [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright)

## Search and privacy

**Decision**: Search only the local service-area registry in the first map release.

**Rationale**: Public Nominatim forbids client-side autocomplete and has strict capacity limits. Local matching is fast, does not transmit address-like input, and cannot offer unsupported report destinations. A later geocoder must be self-hosted or selected behind a replaceable provider contract with caching and privacy review.

- [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)

## Failure and accessibility

**Decision**: Treat the map as progressive enhancement over a semantic search/result/list interface.

**Rationale**: A WebGL canvas is not an adequate sole control for keyboard and screen-reader users and may fail on constrained devices. Every reportable segment therefore remains a normal button outside the canvas.
