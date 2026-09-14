# Feature Specification: Security and Privacy-Preserving Observability

**Feature Branch**: `008-security-observability`

**Created**: 2026-09-13

**Status**: Implemented

**Input**: User description: "Collect useful visitor telemetry and define a well-evaluated security layer to reduce hacks and misuse."

## User Scenarios & Testing

### User Story 1 - Operate a defensible public service (Priority: P1)

As the maintainer, I can understand the service's threats, controls, limitations, and incident-response steps without relying on undocumented platform behavior.

**Why this priority**: A public reporting endpoint can be abused even though it stores no accounts or exact addresses.

**Independent Test**: Review the published security policy and verify every implemented control with automated or deployed checks.

**Acceptance Scenarios**:

1. **Given** a cross-site browser request, **When** it attempts to submit a report, **Then** the API rejects it before storage.
2. **Given** malformed, oversized, or incorrectly typed input, **When** it reaches the report API, **Then** it is rejected with a bounded error response.
3. **Given** a security researcher finds a problem, **When** they look for reporting instructions, **Then** a private GitHub advisory route is available both in the repository and at `/.well-known/security.txt`.

### User Story 2 - Measure reach without profiling residents (Priority: P2)

As the maintainer, I can review aggregate pageviews, referrers, popular pages, and broad locations without adding a browser analytics SDK, advertising cookie, account, or community-report field.

**Why this priority**: Server-side aggregate analytics answer the initial audience questions while preserving the project's data-minimization promise.

**Independent Test**: Inspect the production bundle and CSP; no third-party analytics script or advertising endpoint is present.

**Acceptance Scenarios**:

1. **Given** server-side Netlify Web Analytics is enabled by the maintainer, **When** visitors request pages, **Then** aggregate traffic trends are available without a client-side tracking SDK.
2. **Given** analytics is not enabled or is unavailable, **When** the site loads, **Then** all lookup and reporting features continue to work unchanged.

### User Story 3 - Prepare accountable advertising measurement (Priority: P3)

As the maintainer, I have a documented path for measuring a small set of meaningful actions in Google Ads without silently enabling remarketing or enhanced conversions.

**Why this priority**: Ad conversion tags introduce a new third party and consent obligations; they require a separate configured release.

**Independent Test**: Confirm that the measurement plan names each proposed event, consent state, data recipient, and retention owner before a Google tag is added.

**Acceptance Scenarios**:

1. **Given** no Google tag ID and conversion label have been approved, **When** the production site loads, **Then** no Google tag request is made.
2. **Given** a later approved Google measurement release, **When** a visitor declines advertising measurement, **Then** the site remains fully usable and no personalized advertising data is sent.

### Edge Cases

- Requests with no browser `Origin` header remain possible for command-line clients; rate limits and strict validation remain the primary controls.
- An attacker can distribute requests across IP addresses; this release does not claim Sybil resistance.
- Analytics counts may include or filter bots differently from Google Analytics and must not be treated as resident counts.
- Security headers returned by static hosting do not automatically cover Function responses, so Functions must set their own headers.

## Requirements

### Functional Requirements

- **FR-001**: The report API MUST accept only same-origin browser submissions with JSON media types.
- **FR-002**: The report API MUST reject declared or actual bodies larger than 2,000 bytes.
- **FR-003**: All API responses MUST set no-sniff, no-referrer, restrictive permissions, and non-embeddable content policies.
- **FR-004**: Static pages MUST use HTTPS hardening, frame isolation, MIME sniffing protection, a restrictive CSP, and no legacy cross-domain policy.
- **FR-005**: Public report submissions MUST retain platform IP-based rate limiting, a honeypot, fixed enumerations, and unsupported-field rejection.
- **FR-006**: The project MUST publish a threat model, residual risks, incident-response procedure, and private vulnerability-reporting route.
- **FR-007**: The production browser bundle MUST NOT include Google Analytics, Google Ads, a tracking pixel, or another client analytics SDK in this release.
- **FR-008**: Initial audience measurement SHOULD use Netlify's server-side Web Analytics, subject to the maintainer confirming the account's billing terms before enabling it.
- **FR-009**: Google Ads conversion measurement MUST be a separate configured release requiring a tag ID, conversion action, consent design, privacy-policy update, and CSP review.
- **FR-010**: Search discovery files MUST identify the canonical HTTPS origin and sitemap.
- **FR-011**: Application logs MUST NOT deliberately log report request bodies, IP addresses, or user agents.
- **FR-012**: Security claims MUST distinguish implemented controls from platform controls and acknowledged limitations.

### Key Entities

- **Security control**: A preventive, detective, or recovery measure with an owner and verification method.
- **Aggregate traffic metric**: A server-derived pageview, source, page, or broad-location count that is not added to community-report records.
- **Conversion event**: A later, explicitly approved action such as successful report submission or calendar download, identified by a stable name and consent requirements.
- **Security event**: A rejected request or platform block visible through aggregate operational metrics, without new application-level identity data.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Automated tests cover method, media type, origin, fetch metadata, body size, honeypot, enumeration, and response-header enforcement.
- **SC-002**: Production responses for `/`, `/api/schedule`, and `/api/reports` expose the intended security headers.
- **SC-003**: A production bundle scan finds no Google tag, Google Analytics, advertising pixel, or telemetry SDK.
- **SC-004**: `npm test`, `npm run check`, and a production dependency audit complete successfully before release.
- **SC-005**: The security policy lists at least six threat categories, their current controls, and residual risk.
- **SC-006**: Search crawlers can retrieve a canonical sitemap from `robots.txt`.

## Assumptions

- Netlify remains the CDN, Function runtime, DNS host, and TLS provider.
- Netlify Web Analytics is preferred for initial traffic trends because it does not require browser JavaScript.
- Enabling a billable analytics add-on is outside a code deployment and requires billing confirmation.
- Google Ads conversion tracking is useful for campaign optimization but does not itself improve organic search ranking.
- No account system, exact-address field, persistent visitor ID, or moderation dashboard is introduced.
