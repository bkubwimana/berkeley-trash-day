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

Reports influence the public result for 180 days. A result becomes **Community
consensus** when it has at least three reports and at least 67% agree on the leading
day. The interface always shows the underlying count, such as “2 of 3 recent reports
agree.”

The app does not request names, emails, accounts, exact addresses, photos, or location
coordinates.

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
- Function-level IP rate limiting and a form honeypot for basic abuse resistance

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

The selected range also has a seven-day community calendar. It places collection streams
only on weekdays supported by recent reports and keeps holiday limitations visible. Once
a stream reaches community consensus, “Add to calendar” downloads an `.ics` file that
works with Apple Calendar and Outlook and can be imported into Google Calendar. It creates
26 weekly all-day reminders, omits developing observations, and does not account for
holiday changes. The file is generated locally in the browser without calendar permissions
or personal data.

## API

`GET /api/schedule` returns recent range-level aggregates and the consensus method.

`POST /api/reports` accepts JSON shaped like:

```json
{
  "block": "2100",
  "streams": ["trash", "recycling", "compost"],
  "day": "Tuesday"
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

## Official information

For an official collection schedule, contact Berkeley Zero Waste at
[(510) 981-7270](tel:+15109817270) or visit the [City of Berkeley residential waste
services page](https://berkeleyca.gov/city-services/trash-recycling/residential-waste-services).

## Contributing

Bug reports and focused pull requests are welcome. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing a new neighborhood or data field.

## License

[MIT](LICENSE)
