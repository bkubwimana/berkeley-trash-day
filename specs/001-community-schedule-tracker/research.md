# Research: Community Collection Schedule Tracker

## Decision 1: Use constrained block-level community observations

**Decision**: Collect a fixed block range, waste stream, weekday, and server receipt time.
Do not ask for accounts, exact addresses, coordinates, photographs, contact details, or
free-form text.

**Rationale**: The lookup can work without resident identity or household-level location.
This minimizes privacy and moderation risk while still supporting the core question.
California's privacy rules are context dependent, so minimization and a plain-language
notice are useful protections even for a small noncommercial project.

**Alternatives considered**:

- Exact addresses: rejected because they add household-level sensitivity without improving
  the initial block-level result.
- Accounts or email verification: rejected because they add identity data and onboarding
  friction; abuse is handled first with input constraints and rate limits.
- Free-form comments and photographs: rejected because they introduce personal data,
  moderation, and accessibility burdens.

**Sources**:

- [California Attorney General — California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa)
- [California Attorney General — Making Your Privacy Practices Public](https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/making_your_privacy_practices_public.pdf)

## Decision 2: Clearly separate community data from official City information

**Decision**: Label the tool unofficial and community-reported, show exact evidence counts,
and route authoritative questions to Berkeley Zero Waste at (510) 981-7270 and the City's
residential waste page.

**Rationale**: The City currently tells residents to call Customer Service to find a
collection day. A community tool can complement that path, but it must not imply City
affiliation or verification.

**Alternatives considered**:

- Branding the data as "verified": rejected because resident agreement is not City
  verification.
- Scraping or guessing schedules: rejected because the authoritative public page does not
  publish an address-to-day lookup suitable for this beta.
- Showing a model-generated confidence score: rejected in favor of auditable counts.

**Source**:

- [City of Berkeley — Residential waste services](https://berkeleyca.gov/city-services/trash-recycling/residential-waste-services)

## Decision 3: Use transparent recent-report consensus

**Decision**: Include only reports received in the previous 180 days. Show the leading day
and counts after the first report, but reserve "Community consensus" for three or more
reports with at least two-thirds agreement. Ties remain "Developing."

**Rationale**: The rule is understandable, testable, and able to adapt when schedules
change. Three reports are enough to make the initial beta achievable without presenting a
single observation as broad agreement.

**Alternatives considered**:

- Permanent reports: rejected because old observations could outvote a changed schedule.
- One-report verification: rejected because a mistake would appear authoritative.
- Bayesian or reputation-weighted scoring: rejected because the anonymous beta has no
  justified prior or contributor identity signal.

## Decision 4: Use a static client, serverless functions, and managed object storage

**Decision**: Serve browser-native assets, expose one read endpoint and one write endpoint,
and store immutable reports as small JSON objects in the hosting platform's managed blob
store.

**Rationale**: The platform already selected for hosting supports functions, per-function
rate limiting, and key-value/blob storage without operating a separate database. Immutable
records keep the first version simple and auditable.

**Alternatives considered**:

- Browser-only static data: rejected because neighbors could not share reports.
- A separate relational database and application server: rejected as unnecessary for four
  blocks and a tiny fixed schema.
- A hosted form product: rejected because it would obscure aggregation rules and introduce
  another data processor.

**Sources**:

- [Netlify Docs — Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Netlify Docs — Rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- [Netlify Docs — Functions configuration](https://docs.netlify.com/build/functions/configuration/)

## Decision 5: Keep mapping out of the initial beta

**Decision**: Use four explicit block controls rather than a geographic map.

**Rationale**: Cross streets and boundaries have not been authoritatively verified, and a
map is unnecessary for users who already know their block number. This also avoids external
map requests, attribution work, and location permissions.

**Alternatives considered**:

- Interactive parcel map: rejected due to scope, privacy perception, and unverified
  boundaries.
- Automatic geolocation: rejected because it collects more location precision than the
  service needs.

## Decision 6: Publish the specification with the code

**Decision**: Commit the constitution, specification, plan, research, model, contract,
validation guide, and dependency-ordered tasks in the public repository.

**Rationale**: Contributors can inspect not just the implementation but why the project
has narrow data and confidence rules. Changes can be reviewed against stable requirements.

**Alternatives considered**:

- README-only documentation: rejected because it does not provide traceable acceptance
  criteria or governance for scope changes.
