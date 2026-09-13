# Implementation Plan: Full West Berkeley Reporting Coverage

**Branch**: `007-west-berkeley-expansion` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

## Summary

Generate a versioned static registry from Berkeley's public `Block Numbers` ArcGIS layer. Filter it by Berkeley municipality, addressability, road class, and the San Pablo Avenue centerline; group source fragments into resident-facing ranges; then import the registry everywhere that currently hardcodes four Ninth Street blocks.

## Source and Scope

- Range source: `Public/Portal_CommSvcs/MapServer/1` (`Block Numbers`)
- Basemap: OpenFreeMap / OpenMapTiles / OpenStreetMap
- Operational West Berkeley boundary: City-tagged addressable centerlines on or west of San Pablo Avenue
- Excluded: highways, ramps, pedestrian facilities, overpasses, and zero-address records

The generated file is checked into Git so production never depends on the city GIS being online. Regeneration is an explicit maintainer command and records source metadata.

## Architecture

```text
scripts/generate-service-areas.mjs     # paginated GIS fetch, filtering, grouping, labels
src/service-areas.generated.mjs        # canonical metadata registry and provenance
src/service-area-geometries.generated.mjs # map-only geometry loaded with the map
src/map-data.mjs                       # search and GeoJSON views of the registry
src/corridor.mjs                       # selected-area evidence view model
src/reporting.mjs                      # registry-derived validation and aggregation
src/App.jsx                            # dynamic range identity, count, form, calendar
src/WestBerkeleyMap.jsx                # scalable search results and map rendering
```

## Migration Strategy

Preserve the four existing Ninth Street IDs by assigning them to their matching City centerline groups. All new IDs are derived from their sorted City `CENTERLINEID` values. Existing blob keys and report payloads therefore continue to aggregate without rewriting user data.

## Performance Strategy

- Keep search local over static metadata.
- Render all supported geometries in one GeoJSON source.
- Reduce line and label prominence at neighborhood zoom.
- Paginate accessible HTML results in small batches.
- Pre-index valid IDs and aggregate reports in one pass rather than repeatedly filtering for every range.
