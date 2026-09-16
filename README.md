# Berkeley Trash Day

Find your block. Know your day.

Berkeley Trash Day is a privacy-first, community-reported guide to trash, recycling,
and compost collection days across West Berkeley, California. The current registry
contains 277 addressable ranges across 48 streets.

It is an independent community project and is not affiliated with the City of
Berkeley. Community data should not be treated as an official service notice.

## Why this exists

Berkeley directs residents to call Customer Service to confirm a collection day. This
small open-source experiment tests whether neighbors can build a useful block-level
view without publishing exact home addresses or opaque confidence scores.

## Data model

Each report stores only:

- Block range
- One or more collection streams observed on the same day
- Observed weekday
- Server receipt time

Reports influence the public result for 180 days. During the early traction phase, a
result becomes **Community consensus** after one recent report; the 67% leading-day rule
still applies as more reports arrive and ties remain developing. The interface always
shows the underlying count. The minimum is deliberately isolated as
`MINIMUM_REPORTS` so it can return to three without changing stored data.

The app does not request names, emails, accounts, exact addresses, photos, or location
coordinates.

The tracker presents a conspicuous reliance notice before its results. Report submission
and calendar downloads require an affirmative Terms acknowledgement. The current Terms
version is remembered in browser local storage. Submitted reports store that version and a
server-generated acceptance timestamp, but no identity or application-stored IP address.
Calendar downloads remain local and unlogged. The Terms explain that users must verify
collection days with Berkeley Zero Waste and follow posted parking signs; they also disclose
the limits of community data and calendar reminders. These safeguards reduce ambiguity but
are not a guarantee against a claim, and the maintainer should obtain legal review for the
final wording.

## Local development

Requirements: Node.js 22 or newer and network access the first time the pinned Netlify CLI
development command runs.

```bash
npm install
npm run dev
```

Netlify Dev serves the frontend, functions, and a local Netlify Blobs environment.

Run checks with:

```bash
npm test
npm run check
```

## Architecture

- React components and a Vite production build
- A lazily loaded MapLibre GL JS canvas with OpenFreeMap vector tiles
- A versioned local service-area registry with pure search and GeoJSON helpers
- Netlify Functions for the read and submit APIs
- Netlify Blobs for small community-report records
- Function-level IP rate limiting, strict JSON validation, same-origin browser checks,
  bounded request bodies, and a form honeypot for layered abuse resistance

Reporting coverage is generated from the City of Berkeley's public
[Block Numbers centerline layer](https://gis.cityofberkeley.info/arcgis/rest/services/Public/Portal_CommSvcs/MapServer/1).
For this release, West Berkeley means addressable Berkeley centerlines on or west of San
Pablo Avenue. Highways, ramps, pedestrian facilities, overpasses, and records without
usable address numbers are excluded. The source's latest update among included records is
December 26, 2019, so the map is a reviewed reporting registry rather than a claim about
current City collection service. OpenFreeMap and OpenStreetMap provide the visual basemap.

Range search runs locally in the browser and sends no search text to a geocoder. The map
loads style and tile resources from OpenFreeMap, whose servers receive ordinary web
connection data. No analytics SDK, account system, geolocation permission, or
client-side tracking is included.

Netlify's hosting layer processes ordinary request data and exposes operational metrics.
Optional Netlify Web Analytics is the preferred first measurement layer because it is
server-side and does not add a browser tracking SDK. Enabling analytics is an account-level
billing decision, not a code requirement. Google Analytics and Google Ads tags are not
included; adding them requires a separate consent, privacy, and Content Security Policy
review. See [`specs/008-security-observability`](specs/008-security-observability/).

The selected range also has a seven-day community calendar. It places collection streams
only on weekdays supported by recent reports and keeps holiday limitations visible. Once
a stream reaches community consensus, “Add to calendar” downloads an `.ics` file that
works with Apple Calendar and Outlook and can be imported into Google Calendar. It creates
26 weekly all-day reminders, omits developing observations, and does not account for
holiday changes. The file is generated locally in the browser without calendar permissions
or personal data.

Street sweeping is separate from community pickup reports. The app matches the selected
range against the City of Berkeley's three published residential street-sweeping tables,
then shows each curb side independently with address parity, ordinal week, weekday, and
AM/PM window. The current City tables overlap 90 of the registry's 277 West Berkeley
ranges. Missing coverage is not interpreted as “no sweeping”; posted signs remain the
authority.

Each available curb side can be downloaded as a local `.ics` file with 24 monthly
check/move-car reminders and a one-day alert. The reminder intentionally does not invent
an exact time, and it notes that City holidays are not swept.

## API

`GET /api/schedule` returns recent range-level aggregates and the consensus method.

`POST /api/reports` accepts JSON shaped like:

```json
{
  "block": "2100",
  "streams": ["trash", "recycling", "compost"],
  "day": "Tuesday",
  "termsAccepted": true,
  "termsVersion": "2026-09-15"
}
```

Every selected stream receives one observation for the shared day. If streams are
collected on different days, send a separate report for each same-day group.

Valid blocks and collection streams are intentionally limited in
the generated [`src/service-areas.generated.mjs`](src/service-areas.generated.mjs) registry
and [`src/reporting.mjs`](src/reporting.mjs).

## Refreshing the range registry

The production build uses checked-in data and does not call the City GIS at runtime. To
refresh the registry from the paginated public source:

```bash
npm run generate:service-areas
npm test
npm run check
```

The generator preserves the four original Ninth Street IDs, groups duplicate centerline
fragments into one resident-facing range, derives nearby cross streets, and refuses to
write an unexpectedly small result.

## Refreshing street-sweeping schedules

Download the three PDFs linked from the [City of Berkeley street-sweeping
page](https://berkeleyca.gov/city-services/streets-sidewalks-sewers-and-utilities/street-sweeping),
then run:

```bash
npm run generate:street-sweeping -- \
  --a-g path/to/StreetSweepingSchedule_StNamesA-G.pdf \
  --h-z path/to/StreetSweepingSchedule_StNamesH-Z.pdf \
  --numbered path/to/StreetSweepingSchedule_StNumbered.pdf
npm test
npm run check
```

The importer uses `pdftotext -layout`, validates the table schema and minimum row count,
normalizes opt-out block notation, and writes the checked-in runtime module. The deployed
site does not fetch or parse PDFs.

## Official information

For an official collection schedule, contact Berkeley Zero Waste at
[(510) 981-7270](tel:+15109817270) or visit the [City of Berkeley residential waste
services page](https://berkeleyca.gov/city-services/trash-recycling/residential-waste-services).

## Contributing

Bug reports and focused pull requests are welcome. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing a new neighborhood or data field.
Report vulnerabilities through the private process in [`SECURITY.md`](SECURITY.md).

## License

[MIT](LICENSE)
