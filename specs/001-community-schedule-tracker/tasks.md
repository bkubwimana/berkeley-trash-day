# Tasks: Community Collection Schedule Tracker

**Input**: Design documents from `/specs/001-community-schedule-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by Constitution Principle IV and the feature specification.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independent increment.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the dependency-light project and local hosting runtime.

- [ ] T001 Create Node.js project metadata and validation commands in `package.json`
- [ ] T002 [P] Configure static publishing, functions, redirects, security headers, and cache rules in `netlify.toml`
- [ ] T003 [P] Add repository and local-runtime exclusions to `.gitignore`
- [ ] T004 [P] Create the semantic tracker document skeleton in `public/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement and test the fixed domain rules shared by all stories.

**Critical**: User-story work begins only after this phase passes.

- [ ] T005 Write failing enumeration, validation, retention, tie, and consensus tests in `test/reporting.test.mjs`
- [ ] T006 Implement fixed block, stream, weekday, validation, retention, and aggregation rules in `src/reporting.mjs`
- [ ] T007 Run `npm test` and confirm all foundational decision-rule tests pass

**Checkpoint**: Domain rules are deterministic, tested, and independent of hosting.

---

## Phase 3: User Story 1 - Look Up a Block Schedule (Priority: P1) — MVP

**Goal**: A resident can inspect honest empty, developing, and consensus results for all
three collection streams on a supported block.

**Independent Test**: Exercise the read endpoint with empty, developing, tied, consensus,
and expired input records; select each block in the browser and compare every displayed
day and count with the endpoint response.

### Tests for User Story 1

- [ ] T008 [P] [US1] Add read-endpoint contract tests with injected report storage in `test/functions.test.mjs`
- [ ] T009 [P] [US1] Add browser rendering tests for empty, developing, and consensus states in `test/browser.test.mjs`

### Implementation for User Story 1

- [ ] T010 [US1] Implement recent-report loading and schedule response contract in `netlify/functions/schedule.mjs`
- [ ] T011 [US1] Implement block selection, schedule loading, and evidence rendering in `public/app.js`
- [ ] T012 [US1] Build the responsive block and collection-result interface in `public/index.html` and `public/styles.css`

**Checkpoint**: The lookup works without requiring report submission and never fabricates a day.

---

## Phase 4: User Story 2 - Report an Observed Day (Priority: P2)

**Goal**: A neighbor can submit one constrained observation without identity or exact-address
data and immediately see the aggregate update.

**Independent Test**: Submit a valid report and compare the refreshed count, then submit
malformed, unsupported, oversized, honeypot, and frequency-limited requests and verify no
record is created.

### Tests for User Story 2

- [ ] T013 [P] [US2] Add write-endpoint success, validation, size, and method contract tests in `test/functions.test.mjs`
- [ ] T014 [P] [US2] Add report form synchronization, success, and error tests in `test/browser.test.mjs`

### Implementation for User Story 2

- [ ] T015 [US2] Implement report validation, immutable storage, body limit, and rate-limit configuration in `netlify/functions/submit-report.mjs`
- [ ] T016 [US2] Implement constrained report controls, observation confirmation, and honeypot in `public/index.html`
- [ ] T017 [US2] Implement submission, safe feedback, form reset, and aggregate refresh in `public/app.js`

**Checkpoint**: Reporting adds only the fields in the data model and lookup remains usable.

---

## Phase 5: User Story 3 - Judge Whether to Trust a Result (Priority: P3)

**Goal**: A resident can identify provenance, interpret confidence, and reach official City
information.

**Independent Test**: A first-time visitor can explain the status rule and locate the City
link and phone number from both tracker and privacy pages without assistance.

### Tests for User Story 3

- [ ] T018 [P] [US3] Add static-content assertions for provenance, method, City contact, and prohibited form fields in `test/content.test.mjs`

### Implementation for User Story 3

- [ ] T019 [US3] Add unofficial labeling, transparent confidence method, and official City path to `public/index.html`
- [ ] T020 [US3] Add plain-language data collection, hosting, retention, and affiliation disclosures to `public/privacy.html`

**Checkpoint**: Community information cannot reasonably be mistaken for City verification.

---

## Phase 6: User Story 4 - Inspect and Improve the Project (Priority: P4)

**Goal**: A contributor can understand, run, test, and safely extend the project.

**Independent Test**: Starting at the repository page, locate the license, specification,
architecture, local commands, privacy rule, consensus rule, and security-reporting path.

### Implementation for User Story 4

- [ ] T021 [P] [US4] Document purpose, architecture, data rules, local commands, and official information in `README.md`
- [ ] T022 [P] [US4] Document privacy-preserving contribution rules and workflow in `CONTRIBUTING.md`
- [ ] T023 [P] [US4] Add the MIT grant and copyright notice to `LICENSE`
- [ ] T024 [P] [US4] Document private vulnerability reporting and secret handling in `SECURITY.md`
- [ ] T025 [US4] Review Spec Kit artifacts for requirement-to-task traceability in `specs/001-community-schedule-tracker/`

**Checkpoint**: The public repository is understandable without private project context.

---

## Phase 7: Polish and Release Gates

**Purpose**: Verify cross-cutting quality and publish the empty-data beta.

- [ ] T026 [P] Add an accessible not-found page and crawler policy in `public/404.html` and `public/robots.txt`
- [ ] T027 Run syntax, unit, endpoint contract, and content checks using commands in `package.json`
- [ ] T028 Run responsive, keyboard, reduced-motion, and visual checks from `specs/001-community-schedule-tracker/quickstart.md`
- [ ] T029 Initialize Git history and create the public `bkubwimana/berkeley-trash-day` repository
- [ ] T030 Link the project to a new Netlify site named `berkeleytrashday` and deploy production
- [ ] T031 Smoke-test empty state, invalid input, privacy, official contact, and security headers at `https://berkeleytrashday.netlify.app`
- [ ] T032 Confirm the production report store contains no fabricated test observations

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup has no dependencies.
- Foundational depends on Setup and blocks every user story.
- US1, US2, and US3 depend on Foundational. US2 integrates with US1's refreshed aggregate
  but can be contract-tested independently.
- US4 depends only on finalized design artifacts and may proceed alongside US1–US3.
- Polish and Release Gates depend on all selected stories.

### User Story Dependencies

```text
Foundational ─┬─> US1 Look Up Schedule ─> production lookup
              ├─> US2 Report a Day ─────> aggregate refresh
              ├─> US3 Judge Trust ──────> safe public interpretation
              └─> US4 Contribute ───────> maintainable public repository
```

### Parallel Opportunities

- T002–T004 modify independent setup files.
- T008 and T009 cover independent server and browser surfaces for US1.
- T013 and T014 cover independent server and browser surfaces for US2.
- T021–T024 are independent contributor documents.
- US1, US3, and US4 can proceed independently after the foundation; US2 can begin its
  endpoint work while US1 browser integration is finishing.

## Parallel Example: User Story 1

```text
Task: T008 [US1] Write read-endpoint contract tests in test/functions.test.mjs
Task: T009 [US1] Write browser rendering tests in test/browser.test.mjs
```

## Parallel Example: User Story 4

```text
Task: T021 [US4] Complete README.md
Task: T022 [US4] Complete CONTRIBUTING.md
Task: T023 [US4] Complete LICENSE
Task: T024 [US4] Complete SECURITY.md
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks.
2. Complete US1 and verify empty, developing, and consensus lookup independently.
3. Preserve an empty production store while demonstrating state transitions in automated
   tests and local development.

### Incremental Delivery

1. Add US2 constrained reporting and confirm the read view refreshes.
2. Add US3 trust and official-information context.
3. Finish US4 public contribution artifacts.
4. Complete release gates, deploy, and verify the live empty state.

## Task Summary

- Total tasks: 32
- Setup: 4
- Foundational: 3
- US1: 5
- US2: 5
- US3: 3
- US4: 5
- Polish and release: 7
- MVP scope: Setup + Foundational + US1 (T001–T012)
