# Quickstart Validation: Community Collection Schedule Tracker

## Prerequisites

- Node.js 22 or newer
- npm

From the repository root:

```bash
npm install
npm test
npm run check
npm run dev
```

Open the local URL printed by the development command. The local runtime provides the
static site, functions, and development report storage.

## Scenario 1: Empty production-safe state

1. Open the tracker before submitting any local report.
2. Select each of the four blocks.
3. Inspect trash, recycling, and compost.

Expected: every group says "No reports yet." No weekday, fabricated report, or confidence
percentage appears.

## Scenario 2: Developing result

1. Select the 2100 block.
2. Submit a Tuesday trash observation once.
3. Return to the selected block result.

Expected: Trash shows Tuesday, "1 of 1 recent reports agree," and "Developing." The page
still identifies the result as community-reported and unofficial.

## Scenario 3: Consensus threshold

1. Submit two additional Tuesday trash observations for the 2100 block in a local test
   environment. If the local frequency limit intervenes, use the automated aggregation
   test instead of weakening the production limit.
2. Inspect the result after three agreeing recent observations.

Expected: Trash shows Tuesday, "3 of 3 recent reports agree," and "Community consensus."

The automated suite also proves the 2-of-3 boundary, disagreement, ties, and 180-day aging
without manufacturing production data.

## Scenario 4: Input constraints

Submit malformed JSON, an unsupported block, an unsupported collection stream, an invalid
weekday, a nonempty hidden `website` value, and a body larger than 2,000 bytes to the report
endpoint described in [`contracts/openapi.yaml`](contracts/openapi.yaml).

Expected: each request fails without storing a report or echoing unsafe input.

## Scenario 5: Accessibility and responsive use

1. Set the viewport to 320 CSS pixels wide.
2. Complete block lookup and report submission using only the keyboard.
3. Confirm selected, loading, success, error, developing, and consensus states have visible
   text and are exposed as status updates.
4. Enable reduced-motion preferences.

Expected: no horizontal page scrolling is needed for primary tasks, focus remains visible,
and no meaning depends on color or motion alone.

## Scenario 6: Official information and privacy

1. Locate the unofficial notice, Berkeley Zero Waste telephone number, City link, and
   privacy page from the tracker.
2. Confirm the report form has no name, account, contact, address, comment, photo, or
   location field.

Expected: a first-time visitor can distinguish community data from City information and
understand exactly what a report stores.

## Release gate

Repeat Scenarios 1, 4, 5, and 6 against the deployed URL. Submit one real observation only
if it is genuinely observed or confirmed for the block; never seed production for a demo.
