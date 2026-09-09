# Data Model: West Berkeley Map

## ServiceArea

| Field | Type | Meaning |
|---|---|---|
| `id` | fixed string | Existing report API identifier, initially `2100`–`2400` |
| `addressRange` | string | Human-readable range number |
| `streetName` | string | Display street name |
| `aliases` | string[] | Local search aliases such as `Ninth Street` |
| `startStreet` | string | Northern cross street |
| `endStreet` | string | Southern cross street |
| `center` | `[longitude, latitude]` | Label/camera anchor |
| `geometry` | GeoJSON `LineString` coordinates | Real street centerline for the supported range |
| `source` | string | Geometry/source provenance |

## Derived Map Features

- `serviceAreaFeatureCollection(selectedId)` emits one line feature per service area with `selected` and searchable label properties.
- `serviceAreaLabelCollection(selectedId)` emits one point per service area for readable map labels and click targets.
- `searchServiceAreas(query)` normalizes case, spacing, ordinal aliases, and punctuation, then matches only registry fields.

## Privacy boundary

The selected service-area ID is application state and the only location-like value accepted by the report API. Map center, zoom, search text, and coordinates are never submitted or stored.
