# Implementation Plan: Friendly Weekly Calendar

**Branch**: `003-friendly-weekly-calendar` | **Date**: 2026-09-08 | **Spec**: [spec.md](spec.md)

## Summary

Add a pure seven-day calendar derivation to the existing React view model and render it as a responsive weekly grid above pickup details. Apply a warm light palette, use the selected generated calendar logo, replace the recycling drawing with the familiar loop, simplify road labels, and move street-source attribution to the footer.

## Technical Context

**Language/Version**: React 19 JSX, CSS, browser JavaScript (ES2022), Node.js 22
**Dependencies**: Existing React, ReactDOM, Vite; no new runtime package
**Storage/API**: Unchanged Netlify Functions and Netlify Blobs schedule response
**Testing**: Node built-in tests, Vite build, headless Chrome screenshots and runtime measurements
**Constraints**: No invented dates, no external calendar recurrence, no tile requests, no new resident data, 320 CSS pixel minimum

## Constitution Check

- **Privacy by Data Minimization**: PASS. No request, storage, or permission is added.
- **Honest Provenance and Confidence**: PASS. Events derive from report summaries and keep their status/count.
- **Accessible by Default**: PASS. Calendar events have textual type/status/count and empty states do not rely on color.
- **Tested Public Logic**: PASS. Week derivation is pure and covered for mixed, empty, and unavailable cases.
- **Small, Open, and Inspectable**: PASS. No new package or endpoint; changes stay in focused React, model, style, and test files.

## Structure

```text
src/corridor.mjs       # pure weekly calendar derivation
src/App.jsx            # calendar, logo, simplified labels, footer source
src/CollectionIcon.jsx # familiar recycling loop
src/styles.css          # light palette and responsive week
public/berkeley-trash-day-logo.png
test/browser.test.mjs
test/content.test.mjs
```

