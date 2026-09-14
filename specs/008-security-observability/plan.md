# Implementation Plan: Security and Privacy-Preserving Observability

**Branch**: `008-security-observability` | **Date**: 2026-09-13 | **Spec**: [spec.md](spec.md)

## Summary

Harden the static site and public Functions, publish an inspectable threat model and disclosure path, improve crawl discovery, and document a two-stage measurement strategy. Stage one uses optional Netlify server-side aggregate analytics. Stage two defers Google conversion tags until identifiers, consent, and policy changes are explicitly approved.

## Technical Context

**Language/Version**: JavaScript ES modules on Node.js 22; React 19 browser application

**Primary Dependencies**: Netlify Functions, Netlify Blobs, React, Vite, MapLibre GL JS

**Storage**: Existing `collection-reports` Netlify Blobs store; no analytics records added by the application

**Testing**: Node test runner, syntax/build checks, dependency audit, deployed response inspection

**Target Platform**: Netlify CDN and Functions; evergreen browsers down to 320 CSS pixels

**Constraints**: No PII, exact address, persistent visitor ID, client telemetry SDK, or unapproved billing change

**Scale/Scope**: Public West Berkeley beta; 277 ranges, 48 streets, modest initial traffic

## Constitution Check

- Privacy by Data Minimization: PASS. No application analytics record or resident identifier is introduced.
- Honest Provenance and Confidence: PASS. Security limitations and analytics semantics are explicit.
- Accessible by Default: PASS. No consent interface or interaction change is shipped in this stage.
- Tested Public Logic: PASS. Request validation and response policies receive automated tests.
- Small, Open, and Inspectable: PASS. No dependency is added; controls and decisions are public.

## Project Structure

```text
netlify/functions/
├── _shared/http-security.mjs
├── schedule.mjs
└── submit-report.mjs
public/
├── .well-known/security.txt
├── robots.txt
└── sitemap.xml
.github/
├── dependabot.yml
└── workflows/ci.yml
specs/008-security-observability/
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
test/
└── functions.test.mjs
```

**Structure Decision**: Reuse the existing single-project layout. Shared server-only response policy lives beside the Functions so it cannot enter the browser bundle.

## Complexity Tracking

No constitution violation or additional runtime dependency is required.
