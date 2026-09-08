<!--
Sync Impact Report
- Version change: template (unratified) -> 1.0.0
- Added principles:
  - I. Privacy by Data Minimization
  - II. Honest Provenance and Confidence
  - III. Accessible by Default
  - IV. Tested Public Logic
  - V. Small, Open, and Inspectable
- Added sections:
  - Data and Safety Constraints
  - Specification-Driven Workflow
- Removed sections: none
- Follow-up TODOs: none
-->
# Berkeley Trash Day Constitution

## Core Principles

### I. Privacy by Data Minimization
The service MUST collect only the block range, collection stream, observed weekday, and
server receipt time needed to calculate a community result. It MUST NOT request or store
names, accounts, contact details, exact addresses, photographs, precise coordinates, or
free-form resident content. Hosting infrastructure MAY process transient connection data
for delivery and abuse prevention, but application records MUST NOT contain that data.

Rationale: a collection schedule does not justify creating a directory of residents or
homes.

### II. Honest Provenance and Confidence
Every displayed schedule MUST identify whether it is community-reported or supported by
a documented official source. The interface MUST show raw supporting and total report
counts whenever it presents a leading day. "Community consensus" requires at least three
recent reports and at least 67% agreement. The project MUST NOT invent seed reports,
confidence percentages, street boundaries, or official verification.

Rationale: visible evidence is more trustworthy than an opaque score.

### III. Accessible by Default
Primary lookup and reporting tasks MUST work with a keyboard, meaningful document
structure, visible focus, and text that does not rely on color alone. The public interface
MUST remain usable at 320 CSS pixels wide and under reduced-motion preferences. Critical
instructions and status messages MUST be available to assistive technology.

Rationale: public-interest neighborhood information must be usable by the widest practical
audience.

### IV. Tested Public Logic
Validation, report aging, aggregation, and consensus thresholds MUST have automated tests.
Changes to those rules MUST update or add tests in the same contribution. The end-to-end
lookup and submission paths MUST be verified against the deployed runtime before a release.

Rationale: small errors in apparently simple civic data can mislead an entire block.

### V. Small, Open, and Inspectable
Source code, requirements, decision rules, and contribution guidance MUST be public under
an open-source license. New dependencies, tracking services, maps, account systems, or
data fields MUST have a documented user need and privacy impact in the feature plan.
Browser-native and platform-native capabilities SHOULD be preferred when they satisfy the
requirement.

Rationale: a focused tool is easier for neighbors to audit, maintain, and contribute to.

## Data and Safety Constraints

- The service MUST be labeled unofficial and independent of the City of Berkeley.
- The interface MUST link to the City's residential waste information and provide the
  Berkeley Zero Waste customer-service phone number for authoritative answers.
- Community reports MUST stop affecting results after 180 days.
- Accepted blocks, collection streams, and weekdays MUST be fixed enumerations; arbitrary
  text MUST NOT enter the public data path.
- Public submission endpoints MUST have reasonable request-size and frequency limits plus
  basic automated-submission resistance.
- Secrets and deployment credentials MUST remain outside the repository and browser bundle.
- Expansion beyond the initial 9th Street beta MUST be specified and reviewed before data
  collection begins.

## Specification-Driven Workflow

Every material feature MUST begin with a testable specification describing users, scope,
acceptance scenarios, edge cases, and measurable outcomes. An implementation plan MUST
record architecture, privacy review, data model, and interface contracts. Tasks MUST trace
to user stories and tests. Before merge or deployment, contributors MUST run the automated
checks, review constitution compliance, and confirm that displayed data is not fabricated.

Pull requests MUST explain any new data collection, dependency, or complexity. A reviewer
MUST reject changes that violate a MUST rule unless a constitution amendment is approved
first.

## Governance

This constitution governs all specifications, plans, tasks, source code, and deployment
decisions in the project. Amendments require a written rationale, a Sync Impact Report,
and updates to affected artifacts. Versioning follows semantic versioning: MAJOR for a
removed or incompatible principle, MINOR for a new principle or materially expanded rule,
and PATCH for a clarification that does not change obligations.

Every implementation plan and release review MUST include a constitution check. Any
intentional exception MUST be documented with scope, risk, owner, and removal date; no
exception may permit collection of exact addresses or resident identity data.

**Version**: 1.0.0 | **Ratified**: 2026-09-07 | **Last Amended**: 2026-09-07
