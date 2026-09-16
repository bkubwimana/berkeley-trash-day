# Feature Specification: Search Discovery

## Goal

Help people searching for Berkeley trash pickup, recycling, compost, or street sweeping
discover a useful and accurate entry point into the tracker.

## User stories

### Story 1 — Find the tracker from a collection-day search

A West Berkeley resident searching for a trash, recycling, or compost pickup day can find
an indexable page that explains the community data and links directly to street search.

### Story 2 — Find the tracker from a street-sweeping search

A person parking in West Berkeley can find an indexable guide that explains curb-side
matching, calendar reminders, and the authority of posted signs.

## Functional requirements

- **FR-001**: The homepage MUST use a concise title, description, heading, canonical URL,
  and social metadata that accurately describe the tracker.
- **FR-002**: The homepage MUST describe the app with valid `WebApplication` structured
  data and MUST NOT claim reviews, ratings, official affiliation, or unavailable features.
- **FR-003**: The site MUST publish one substantive pickup guide and one substantive street
  sweeping guide as static HTML that remains useful without client-side JavaScript.
- **FR-004**: Every discovery page MUST link to the tracker and clearly distinguish
  community collection reports from City-published sweeping information.
- **FR-005**: The guides MUST be internally linked and listed in the canonical sitemap.
- **FR-006**: The project MUST NOT generate thin pages for every street or address range.
- **FR-007**: Search Console submission MUST be treated as a separate owner-authorized step;
  source changes cannot guarantee indexing or ranking.

## Success criteria

- Production serves all sitemap URLs with indexable HTML and canonical metadata.
- Automated tests protect the page titles, structured data, cautions, internal links, and
  sitemap entries.
- Google can discover the sitemap from `robots.txt`; indexing and ranking remain Google’s
  decision and may take days or weeks.
