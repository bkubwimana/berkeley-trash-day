# Berkeley Trash Day

Find your block. Know your day.

Berkeley Trash Day is a privacy-first, community-reported guide to trash, recycling,
and compost collection days. The initial beta covers the 2100–2400 blocks of 9th
Street in Berkeley, California.

It is an independent community project and is not affiliated with the City of
Berkeley. Community data should not be treated as an official service notice.

## Why this exists

Berkeley directs residents to call Customer Service to confirm a collection day. This
small open-source experiment tests whether neighbors can build a useful block-level
view without publishing exact home addresses or opaque confidence scores.

## Data model

Each report stores only:

- Block range
- Collection stream
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

The map can browse West Berkeley, while only the four registry-backed Ninth Street
ranges are highlighted and open for reports. Their line geometry follows public
OpenStreetMap street centerlines. Future range expansion should be reviewed against the
[City of Berkeley Streets Network](https://data.cityofberkeley.info/Transportation/Streets-Network/hqnk-qfhq),
which includes street segment address ranges. Visible basemap streets do not imply
schedule coverage.

Range search runs locally in the browser and sends no search text to a geocoder. The map
loads style and tile resources from OpenFreeMap, whose servers receive ordinary web
connection data. No analytics SDK, account system, geolocation permission, or
client-side tracking is included.

The selected range also has a seven-day community calendar. It places collection streams
only on weekdays supported by recent reports and keeps holiday limitations visible.

## API

`GET /api/schedule` returns recent block-level aggregates and the consensus method.

`POST /api/reports` accepts JSON shaped like:

```json
{
  "block": "2100",
  "stream": "trash",
  "day": "Tuesday"
}
```

Valid blocks and collection streams are intentionally limited in
[`src/reporting.mjs`](src/reporting.mjs).

## Official information

For an official collection schedule, contact Berkeley Zero Waste at
[(510) 981-7270](tel:+15109817270) or visit the [City of Berkeley residential waste
services page](https://berkeleyca.gov/city-services/trash-recycling/residential-waste-services).

## Contributing

Bug reports and focused pull requests are welcome. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing a new neighborhood or data field.

## License

[MIT](LICENSE)
