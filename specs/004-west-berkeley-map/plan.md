# Implementation Plan: West Berkeley Map

**Branch**: `004-west-berkeley-map` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

## Summary

Replace the CSS corridor with a React MapLibre component using OpenFreeMap's light Positron vector style. Overlay the four live Ninth Street ranges from a local GeoJSON-compatible registry, add local search and an accessible range list, and retain the existing schedule/report domain unchanged.

## Technical Context

**Language/Version**: React 19, ES2022 modules, CSS, Node.js 22
**Dependencies**: `maplibre-gl` 6.8.0; existing React, Vite, Netlify packages
**Map data**: OpenFreeMap vector basemap; OpenStreetMap-derived Ninth Street geometry; City of Berkeley Streets Network planned as the authoritative expansion source
**Storage/API**: Existing fixed block IDs, Netlify Functions, and Netlify Blobs remain unchanged
**Testing**: Node built-in unit/content tests, Vite production build, browser screenshots and interaction checks

## Constitution Check

- **Privacy by Data Minimization**: PASS. Search is local; no exact address, geolocation permission, or new report field is added. Tile hosts receive standard connection data and are disclosed.
- **Honest Provenance and Confidence**: PASS. Only the fixed service-area registry is highlighted and reportable. The basemap is context, not coverage.
- **Accessible by Default**: PASS. Search results and a complete native button list duplicate canvas selection.
- **Tested Public Logic**: PASS. Search, GeoJSON derivation, empty results, and selected state are pure and unit tested.
- **Small, Open, and Inspectable**: PASS with justified dependency. MapLibre is required for the user-requested scalable WebGL vector map and keeps map behavior open-source.

## Architecture

```text
src/map-data.mjs         # versioned segment registry, search, GeoJSON derivation
src/WestBerkeleyMap.jsx # MapLibre lifecycle, overlays, search, accessible list
src/App.jsx             # shared selected-range state and tracker composition
src/styles.css           # map shell, search/list, responsive/fallback states
privacy.html             # tile-request disclosure
netlify.toml             # CSP for style, tiles, glyphs, images, and worker blob
test/map.test.mjs        # registry/search/GeoJSON tests
test/content.test.mjs    # attribution, privacy, and non-canvas fallback checks
```

MapLibre owns only visual camera/layer state. React remains the source of truth for the selected report identifier. The local registry is deliberately small but uses a stable schema that can later be generated from Berkeley's Streets Network dataset.
