# Implementation Plan: Community Collection Schedule Tracker

**Branch**: `001-community-schedule-tracker` | **Date**: 2026-09-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from
`/specs/001-community-schedule-tracker/spec.md`

## Summary

Deliver a small, accessible web tracker where residents select one of four 9th Street
blocks, inspect transparent aggregates for three waste streams, and submit a constrained
observation without an account or exact address. A static browser interface calls two
serverless endpoints; immutable report records use managed key-value storage and are
aggregated from only the preceding 180 days. Production starts empty.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: HTML5, CSS, browser JavaScript (ES2022), Node.js 22

**Primary Dependencies**: Netlify Functions runtime, `@netlify/blobs`; Netlify CLI for
local development only

**Storage**: Netlify Blobs, one immutable JSON object per community report

**Testing**: Node built-in test runner for validation and aggregation; syntax checks;
local and deployed endpoint smoke tests; manual responsive and keyboard review

**Target Platform**: Modern mobile and desktop browsers; Netlify static hosting and
serverless functions

**Project Type**: Small web application with two JSON endpoints

**Performance Goals**: Static content becomes interactive within 2 seconds on a typical
mobile connection; a block change renders immediately after data is loaded; lookup and
submission feedback appear within 2 seconds under normal hosting conditions

**Constraints**: No application-level PII; no analytics, maps, accounts, external fonts,
or client secrets; 2 KB submission limit; five submissions per source per three minutes;
320 CSS pixel minimum viewport; report lifetime fixed at 180 days

**Scale/Scope**: Four blocks, three collection types, one public page, one privacy page,
hundreds of recent reports during the beta

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Privacy by Data Minimization**: PASS. The report schema contains only enumerated civic
  observations and receipt time; there are no identity, address, coordinate, or free-text
  fields.
- **Honest Provenance and Confidence**: PASS. Aggregates expose supporting and total counts;
  the consensus rule is explicit; production has no seed reports.
- **Accessible by Default**: PASS. Semantic controls, keyboard focus, live status, textual
  states, reduced motion, and 320-pixel layouts are design requirements.
- **Tested Public Logic**: PASS. Validation, retention, tie handling, and consensus require
  automated tests; endpoint and browser paths have release checks.
- **Small, Open, and Inspectable**: PASS. The interface is browser-native, storage uses one
  production dependency, and the repository includes MIT licensing and public artifacts.
- **Data and Safety Constraints**: PASS. Official contact details, unofficial labeling,
  rate limits, fixed enumerations, and secret separation are included.

**Post-design re-check**: PASS. The data model, API contract, and validation guide preserve
all constitutional gates without an exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-community-schedule-tracker/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
public/
├── index.html          # lookup and report interface
├── app.js              # browser state, rendering, and endpoint calls
├── styles.css          # responsive and accessible visual system
├── privacy.html        # plain-language data and unofficial-use notice
└── 404.html

netlify/functions/
├── schedule.mjs        # GET aggregate endpoint
└── submit-report.mjs   # POST validation and persistence endpoint

src/
└── reporting.mjs       # shared enumerations, validation, retention, aggregation

test/
├── reporting.test.mjs  # decision-rule unit tests
└── functions.test.mjs  # endpoint contract tests with injected report storage
```

**Structure Decision**: Use one dependency-light web project. Domain rules live in a shared
module so both functions and tests use the same validation and aggregation behavior. Static
assets remain framework-free; storage access stays behind server-side functions.
