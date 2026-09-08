# Tasks: Interactive 9th Street Corridor

**Input**: Design documents from `/specs/002-interactive-corridor-map/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by Constitution Principle IV and the feature success criteria.

## Phase 1: Setup

- [x] T001 Migrate the frontend to focused React components with a Vite build while preserving the endpoints in `netlify/functions/`
- [x] T002 Add verified cross-street sources and interaction decisions to `specs/002-interactive-corridor-map/research.md`

---

## Phase 2: Foundational View Model

- [x] T003 Write failing corridor geometry, total, active-signal, empty, and unavailable tests in `test/browser.test.mjs`
- [x] T004 Implement fixed corridor boundaries and pure segment-view derivation in `src/corridor.mjs`
- [x] T005 Run `npm test` and confirm the corridor view model passes without changing schedule-domain tests

---

## Phase 3: User Story 1 - Select a Block Spatially (Priority: P1) — MVP

**Goal**: Present four contiguous, accurately bounded block segments with synchronized
native-button selection.

**Independent Test**: Select all four blocks with pointer and keyboard input and confirm
segment, heading, form, and details identify the same block.

- [x] T006 [US1] Replace the generic block grid with semantic React corridor markers and segment buttons in `src/App.jsx`
- [x] T007 [US1] Implement the map grid, street line, intersections, contiguous segments, selected state, and focus treatment in `src/styles.css`
- [x] T008 [US1] Synchronize pressed state, selected location, form block, and details from each corridor segment in `src/App.jsx`

---

## Phase 4: User Story 2 - Scan Community Activity (Priority: P2)

**Goal**: Show data-derived stream presence and recent-report totals without implying
verification or confidence.

**Independent Test**: Feed empty, unavailable, and mixed aggregates and compare every signal
and total against the three stream totals.

- [x] T009 [P] [US2] Add real-label, attribution, claim-guardrail, and activity-markup assertions in `test/content.test.mjs`
- [x] T010 [US2] Render data-derived activity signals, selected recent total, covered-stream count, and accessible summaries in `src/App.jsx`
- [x] T011 [US2] Add recognizable collection symbols and style inactive, active, unavailable, summary, and count states in `src/CollectionIcon.jsx` and `src/styles.css`

---

## Phase 5: User Story 3 - Use the Corridor on a Small Screen (Priority: P3)

**Goal**: Preserve the spatial interaction at 320 CSS pixels without page overflow or tiny
targets.

**Independent Test**: At 320 pixels, confirm zero page overflow, non-overlapping labels,
44-pixel targets, keyboard operation, and usable detail and report controls.

- [x] T012 [US3] Add compact stacked mobile corridor geometry and label wrapping rules in `src/styles.css`
- [x] T013 [US3] Capture and inspect desktop and 320-pixel screenshots and assert document width and target sizes using `specs/002-interactive-corridor-map/quickstart.md`

---

## Phase 6: Release

- [x] T014 Run the full automated, local Netlify, content, responsive, and security regression gates
- [x] T015 Commit and push the Spec Kit feature, deploy production, and smoke-test `https://berkeleytrashday.netlify.app`

## Dependencies and Strategy

- T001–T005 establish a tested view model and block the UI stories.
- US1 provides the selectable corridor; US2 layers live activity onto the same segments.
- US3 follows the final desktop geometry so its responsive rules are tested against reality.
- The MVP is T001–T008; release includes all 15 tasks.

## Task Summary

- Total tasks: 15
- Setup and foundation: 5
- US1: 3
- US2: 3
- US3: 2
- Release: 2
