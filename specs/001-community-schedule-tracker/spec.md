# Feature Specification: Community Collection Schedule Tracker

**Feature Branch**: `001-community-schedule-tracker`

**Created**: 2026-09-07

**Status**: Ready for planning

**Input**: User description: "Create a short public open-source project where Berkeley
neighbors can look up and report trash, recycling, and compost pickup days by block,
starting with four blocks of 9th Street. Host the initial version at
berkeleytrashday.netlify.app and use berkeleytrashday.org later."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Look Up a Block Schedule (Priority: P1)

A resident selects one of the supported 9th Street blocks and sees the leading reported
day for trash, recycling, and compost, together with the evidence supporting each result.

**Why this priority**: Finding a likely pickup day is the core public value of the service.

**Independent Test**: Select each supported block with a mix of empty, developing, and
consensus data and confirm that all three collection types display an accurate, plainly
labeled result.

**Acceptance Scenarios**:

1. **Given** a block has no recent reports for a collection type, **When** a resident
   selects that block, **Then** the service says no reports exist and invites the first
   report without suggesting a day.
2. **Given** a block has recent reports but does not meet the consensus rule, **When** a
   resident selects it, **Then** the leading day, exact agreement count, and "Developing"
   status are shown.
3. **Given** a block has at least three recent reports with at least 67% agreement,
   **When** a resident selects it, **Then** the leading day, exact agreement count, and
   "Community consensus" status are shown.

---

### User Story 2 - Report an Observed Day (Priority: P2)

A neighbor reports one or more collection types and the pickup day they observed for a supported block
without creating an account or sharing an exact address.

**Why this priority**: The lookup becomes useful only when neighbors can contribute recent
observations safely.

**Independent Test**: Submit one valid report and confirm it changes the selected block's
visible count; then submit invalid and excessive requests and confirm they are rejected
without changing the result.

**Acceptance Scenarios**:

1. **Given** a neighbor selects an allowed block, one or more collection types, and a weekday and confirms
   the observation, **When** they submit, **Then** the service records the report, thanks
   them, and refreshes the community result.
2. **Given** a submission includes an unsupported value, arbitrary text, or is too large,
   **When** it is submitted, **Then** the service rejects it with a safe, understandable
   error and stores nothing.
3. **Given** a source sends submissions too frequently or triggers automated-submission
   defenses, **When** another report arrives, **Then** the service rejects or safely ignores
   it without exposing technical or resident data.

---

### User Story 3 - Judge Whether to Trust a Result (Priority: P3)

A resident can understand what the status means, distinguish community reports from
official information, and reach the City when an authoritative answer is needed.

**Why this priority**: Transparent limits reduce the risk that community information is
mistaken for an official service promise.

**Independent Test**: Ask a first-time visitor to explain the source and strength of a
displayed result and locate official City contact information using only the page.

**Acceptance Scenarios**:

1. **Given** any public result, **When** a resident views it, **Then** the page identifies
   the project as unofficial and community-reported.
2. **Given** a resident needs an authoritative answer, **When** they view the tracker or
   privacy page, **Then** they can call Berkeley Zero Waste or open the City's residential
   waste information.
3. **Given** a resident wants to understand confidence, **When** they read the method,
   **Then** they can see the minimum report count, agreement threshold, and report lifetime.

---

### User Story 4 - Inspect and Improve the Project (Priority: P4)

A developer or Berkeley neighbor can inspect the source, understand the decision rules,
run the project locally, and propose a focused improvement.

**Why this priority**: Public review and contributions support trust and long-term
maintenance after the initial beta.

**Independent Test**: A contributor starting from the public repository can find the
license, specification, privacy rules, local setup steps, tests, and contribution process.

**Acceptance Scenarios**:

1. **Given** a contributor opens the repository, **When** they read the project documents,
   **Then** they can identify the scope, data model, consensus rule, privacy constraints,
   and commands needed to validate a change.
2. **Given** a contributor proposes a new data field or neighborhood, **When** they consult
   the governance documents, **Then** they are directed to document the user need and
   privacy impact before implementation.

### Edge Cases

- Two or more weekdays tie for the highest report count. The result remains "Developing"
  and uses a deterministic weekday order without claiming consensus.
- A report becomes older than 180 days. It no longer affects the visible total, leader, or
  consensus status.
- Reports disagree after consensus was previously reached. Current recent data alone
  determines whether the status stays consensus or returns to developing.
- The schedule service is temporarily unavailable. The interface explains that community
  data cannot be loaded and does not display a fabricated fallback day.
- A visitor changes blocks while a form is open. The form and visible location stay aligned.
- A weekday has 2 of 3 supporting reports. The displayed agreement is 67% after rounding
  and qualifies under the defined two-thirds threshold.
- The interface is used at 320 CSS pixels, with keyboard navigation, or with reduced-motion
  preferences. Lookup, evidence, and report controls remain usable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The service MUST support only the 2100, 2200, 2300, and 2400 blocks of 9th
  Street in Berkeley during the initial beta.
- **FR-002**: A resident MUST be able to select a supported block and view separate results
  for trash, recycling, and compost.
- **FR-003**: For each collection type with recent reports, the service MUST display the
  leading weekday, number of reports supporting it, total recent reports, and a textual
  status.
- **FR-004**: The service MUST display "Community consensus" only when at least three
  recent reports exist and at least 67% support the leading weekday.
- **FR-005**: The service MUST display a no-reports state without implying a pickup day when
  no recent report exists for a block and collection type.
- **FR-006**: A neighbor MUST be able to submit exactly one supported block, one or more
  collection types collected on the same weekday, and one weekday after affirming that
  they observed or confirmed the schedule.
- **FR-007**: The service MUST reject unsupported enumerated values, arbitrary resident
  text, malformed submissions, and submissions exceeding the documented size limit.
- **FR-008**: The application record for a report MUST contain only block, selected
  collection types, weekday, receipt time, fixed location label, and community provenance.
- **FR-009**: The report experience MUST NOT request a name, account, email, telephone
  number, exact address, photograph, free-form comment, or precise coordinates.
- **FR-010**: Reports older than 180 days MUST NOT influence displayed results.
- **FR-011**: The public submission path MUST apply basic automated-submission resistance
  and frequency limits.
- **FR-012**: The service MUST identify itself as unofficial, community-reported, and not
  affiliated with the City of Berkeley wherever a resident evaluates a schedule.
- **FR-013**: The service MUST provide the current Berkeley Zero Waste customer-service
  telephone number and a link to the City's residential waste information.
- **FR-014**: The service MUST explain its consensus threshold, report lifetime, collected
  fields, and excluded personal data in plain language.
- **FR-015**: Lookup and reporting MUST be operable with a keyboard, expose status changes
  to assistive technology, use text in addition to color, and remain usable at 320 CSS
  pixels wide.
- **FR-016**: The public repository MUST include an open-source license, contributor
  guidance, security reporting guidance, local setup instructions, decision-rule tests,
  and the specification artifacts that govern the feature.
- **FR-017**: Production MUST begin with no fabricated reports; only submitted community
  observations may create a community result.

### Key Entities

- **Community Report**: One recent observation for a supported block and one or more
  collection types; contains a weekday, receipt time, fixed Berkeley location label, and
  community provenance.
- **Block Schedule**: The three current collection-type summaries for one supported block.
- **Collection Summary**: A leading weekday, supporting count, total recent count, agreement
  percentage, and status calculated from Community Reports.
- **Supported Block**: One enumerated 9th Street block range included in the limited beta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can select a block and interpret all three collection
  results in under 30 seconds.
- **SC-002**: A neighbor can submit a valid observation in under 60 seconds without entering
  personal identity or exact-address information.
- **SC-003**: In scenario testing, 100% of displayed days and agreement counts match the
  applicable reports from the preceding 180 days.
- **SC-004**: In scenario testing, 100% of consensus labels satisfy both the three-report
  minimum and 67% agreement threshold, and no other result receives that label.
- **SC-005**: At least 90% of first-time test participants can correctly identify a result as
  community-reported and locate the official City information path without assistance.
- **SC-006**: All primary lookup and report actions can be completed using only a keyboard at
  widths down to 320 CSS pixels, with every result state conveyed in text.
- **SC-007**: A new contributor can run the documented validation checks and identify the
  privacy and consensus rules within 10 minutes of opening the repository.

## Assumptions

- The initial release is a narrow community beta for four block ranges rather than a
  citywide source of truth.
- Residents have enough local knowledge to report an observed or confirmed weekday, while
  the City remains the authority for definitive schedules and service changes.
- The beta does not model parcel boundaries, sides of a street, unit addresses, holiday
  exceptions, missed pickups, or temporary service alerts.
- Tied leading weekdays use Monday-to-Sunday order for deterministic presentation but never
  receive a consensus status.
- Anonymous community input can contain mistakes; transparent counts, aging, and a high
  minimum for consensus reduce but do not eliminate that risk.
- The custom `berkeleytrashday.org` domain will be configured later; the initial public URL
  is `berkeleytrashday.netlify.app`.
