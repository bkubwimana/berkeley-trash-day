# Security policy

## Reporting a vulnerability

Please use GitHub's [private security advisory form](https://github.com/bkubwimana/berkeley-trash-day/security/advisories/new). Do not open a public issue for an unpatched vulnerability, and do not include resident information, credentials, access tokens, or unnecessary request logs.

Include the affected URL or commit, impact, minimal reproduction, and any suggested mitigation. The maintainer will acknowledge a credible report, contain active harm first, and coordinate disclosure after a fix is deployed.

## Security boundaries

This is an anonymous community schedule, not an identity, emergency, payment, or authoritative City system. It stores only a fixed street-range ID, one or more enumerated collection streams, an enumerated weekday, server receipt time, and public range labels. It does not request accounts, names, contact details, exact addresses, photos, coordinates, or free-form content.

Netlify terminates TLS, serves static files, runs the two public Functions, applies platform rate limits, and stores report blobs. OpenFreeMap serves optional map resources. GitHub stores the public source. These provider boundaries are not application authentication.

## Threat model and current controls

| Threat | Current controls | Residual risk |
| --- | --- | --- |
| Script injection or page framing | React text escaping, no public free-form content, restrictive CSP, no-sniff, frame denial, same-origin opener/resource policies | A compromised dependency or deployment account could replace trusted code |
| Malformed or oversized API input | JSON-only writes, 2 KB declared and actual body limits, fixed fields and enumerations, unsupported-field rejection | The platform may receive a larger transport body before application code runs |
| Cross-site browser submission | Same-origin `Origin` validation and Fetch Metadata rejection | Non-browser clients can omit or forge these headers |
| Automated report spam | Honeypot, confirmation step, three-per-ten-minute IP/domain Function rate limit | Distributed clients and patient attackers can still submit false reports |
| False community consensus | Raw counts, minimum of three reports, two-thirds agreement, 180-day expiry, no official label | Anonymous reports do not prove distinct people or truthful observations |
| Traffic or cost amplification | Netlify DDoS controls, read and write rate limits, short durable caching, and rejection of query-string cache bypasses before Blob access | A distributed attack or unbounded report growth can still increase Function and Blob work |
| Secret or supply-chain compromise | No browser secrets, locked dependency versions, dependency audit, public review, Netlify environment boundary | Maintainer, GitHub, npm, or Netlify account compromise remains possible |
| Domain takeover or interception | GoDaddy transfer lock, Netlify-managed DNS, automatic TLS, HSTS | Registrar, DNS, or Netlify account compromise remains possible |
| Privacy leakage through telemetry | No client analytics SDK, no persistent visitor ID, no request-body logging by application code | Hosting and map providers process ordinary connection data |

## Operational controls

- Keep GoDaddy, GitHub, and Netlify multi-factor authentication enabled and recovery codes offline.
- Keep the domain transfer lock enabled and review nameserver, DNS, and Netlify audit activity after unexpected changes.
- Store deployment credentials only in the hosting environment; never commit `.env` files, API keys, or tokens.
- Review Dependabot updates and require the read-only GitHub Actions verification workflow to run `npm audit --omit=dev`, `npm test`, and `npm run check` on changes.
- Review Netlify Observability for request spikes, repeated `429`, Function errors, and unusual paths.
- Treat surprising consensus changes as a data-integrity incident even when no code was compromised.

## Incident response

1. Preserve relevant Netlify deploy, Function, DNS, and GitHub audit evidence without copying unnecessary visitor data.
2. Contain the issue: roll back the deploy, pause reporting, rotate exposed secrets, or restore DNS as appropriate.
3. Quarantine clearly malicious report records without inventing replacement observations.
4. Patch and test the smallest complete fix, then verify the production headers, site, and API.
5. Publish a correction when displayed schedule data may have misled residents; direct residents to Berkeley Zero Waste for official information.
6. Document the cause and add a regression test or operational control.

## Known limitations and escalation

This release deliberately preserves anonymous reporting, so it does not claim one-person-one-report enforcement. IP hashes, browser fingerprints, accounts, and tracking cookies are not acceptable silent fixes. If measurable coordinated abuse appears, the next design review should compare a privacy-reviewed challenge, moderation queue, official schedule source, and temporary reporting pause.

Security support follows the current public beta on a best-effort basis. Do not use the service for urgent sanitation, safety, or legal decisions.
