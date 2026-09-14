# Tasks: Security and Privacy-Preserving Observability

## Phase 1: Specification and review

- [x] T001 [US1] Document the threat model and incident response.
- [x] T002 [US2] Research server-side measurement and billing boundaries.
- [x] T003 [US3] Define consent-gated Google Ads prerequisites without shipping a tag.

## Phase 2: API and hosting hardening

- [x] T004 [US1] Add shared Function request/response security policy.
- [x] T005 [US1] Enforce JSON media type, browser origin, fetch metadata, and early size checks.
- [x] T006 [US1] Return explicit security headers from both Functions.
- [x] T007 [US1] Add HTTPS and cross-origin hardening to `netlify.toml`.
- [x] T008 [US1] Publish `/.well-known/security.txt`.
- [x] T008A [US1] Add least-privilege CI and weekly dependency update checks.

## Phase 3: Discovery and documentation

- [x] T009 [US2] Update privacy and architecture documentation without claiming analytics is enabled.
- [x] T010 [US2] Add canonical metadata and a sitemap.
- [x] T011 [US3] Document Google Ads configuration and consent prerequisites.

## Phase 4: Verification and release

- [x] T012 [US1] Expand Function tests for headers and rejected request classes.
- [x] T013 Run tests, build, syntax checks, dependency audit, and bundle scan.
- [ ] T014 Verify the deployed site and API.
- [ ] T015 Commit and push the verified release.
