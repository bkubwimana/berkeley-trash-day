# Implementation Plan: Interactive 9th Street Corridor

**Branch**: `002-interactive-corridor-map` | **Date**: 2026-09-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-interactive-corridor-map/spec.md`

## Summary

Replace the generic block grid with a schematic, interactive 9th Street corridor. A faint
map grid and five verified cross-street markers frame four contiguous block buttons. Each
button and the selected-block summary derive activity, report total, and covered streams
from the existing schedule response. Recognizable collection symbols improve scanning. The
report form, data model, endpoints, and consensus rules remain unchanged.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: React 19 JSX, CSS, browser JavaScript (ES2022), Node.js 22

**Primary Dependencies**: React, ReactDOM, Vite; existing Netlify Functions and test runner

**Storage**: No change; the feature reads existing schedule aggregates only

**Testing**: Node built-in tests for view derivation and static content; headless Chrome
screenshots and runtime width/overflow assertions at desktop and 320-pixel viewports

**Target Platform**: Modern mobile and desktop browsers on the existing Netlify site

**Project Type**: Presentation refinement within a small web application

**Performance Goals**: Selection updates synchronously; one schedule request serves the
entire corridor; no third-party tile, font, image, or script is introduced

**Constraints**: 320 CSS pixel minimum, 44-pixel targets, no horizontal page overflow, no
geolocation or exact addresses, no fake counts or verification, visible and programmatic
selection, OpenStreetMap attribution for validated street labels

**Scale/Scope**: Four corridor segments, five cross-street labels, three activity signals
and one derived total per segment, three selected-block summary values, three collection
symbols

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Privacy by Data Minimization**: PASS. No data field, permission, or third-party runtime
  request is added.
- **Honest Provenance and Confidence**: PASS. Signals and totals derive only from existing
  recent-report aggregates; no verification or confidence label is introduced.
- **Accessible by Default**: PASS. Segment buttons retain native keyboard behavior, visible
  focus, textual bounds, accessible activity summaries, and 320-pixel behavior.
- **Tested Public Logic**: PASS. Pure view derivation and data-to-signal mappings receive
  tests; responsive overflow receives a browser release check.
- **Small, Open, and Inspectable**: PASS. The frontend is split into focused React
  components and a pure view-model module; React/Vite are the only new UI/build packages.

**Post-design re-check**: PASS. The UI contract and derived view model preserve all gates.

## Project Structure

### Documentation (this feature)

```text
specs/002-interactive-corridor-map/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contract.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
index.html              # Vite React document entry
privacy.html            # Vite-built privacy page
404.html                # Vite-built not-found page
vite.config.js          # multi-page production inputs

src/
├── App.jsx             # tracker, corridor, summary, schedule, and report components
├── CollectionIcon.jsx  # accessible inline collection symbols
├── corridor.mjs        # pure segment activity and schedule view model
└── styles.css          # street schematic, segments, states, responsive rules

test/
├── browser.test.mjs    # corridor view-model and selection-state tests
└── content.test.mjs    # real labels, attribution, and claim guardrails
```

**Structure Decision**: Migrate the UI to React and Vite so corridors, maps, and reporting
flows can grow as components. The first corridor remains semantic JSX and CSS rather than
a geographic mapping dependency; a pure JavaScript view function derives activity from
the already-loaded response for deterministic testing. A future MapLibre component can
consume GeoJSON without changing the schedule contract.
