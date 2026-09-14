# Research: Security and Privacy-Preserving Observability

## Decision 1: Start with Netlify Web Analytics

Prefer Netlify's server-side Web Analytics for pageviews, sources, top pages, broad locations, and bandwidth, after confirming the team's billing model. It uses CDN request data, adds no browser SDK, has no page-performance cost, and does not require weakening the current CSP.

Google Analytics 4 would support event funnels and Google Ads linking, but adds browser requests, consent work, CSP hosts, and a new data recipient. A custom endpoint would duplicate hosting telemetry and add an abuse surface. Log drains are excessive at beta scale.

## Decision 2: Defer Google Ads tags

Do not ship a dormant or placeholder Google tag. Add one only after the maintainer supplies the Google tag ID and conversion action and approves consent and privacy changes. Conversion measurement can optimize paid campaigns; simply installing a tag does not improve organic ranking.

Candidate later events are `report_submitted`, `calendar_downloaded`, and `official_service_opened`. Do not send block IDs, street names, pickup days, form values, exact addresses, enhanced-conversion data, or remarketing audiences.

## Decision 3: Layer controls

Combine strict schemas, media-type enforcement, same-origin browser checks, fetch-metadata checks, size limits, a honeypot, platform rate limiting, CSP, HTTPS controls, dependency review, and operational monitoring. Origin checks are not authentication, rate limits do not stop distributed attackers, and fixed schemas cannot prove that a report is truthful.

## Decision 4: Preserve anonymous reporting

Do not store an IP hash, browser fingerprint, account, or cookie-based identity to deduplicate reporters. If coordinated poisoning becomes observable, evaluate a privacy-reviewed challenge or moderated ingestion in a new specification.

## Decision 5: Include recovery

Rollback, secret rotation, domain lock verification, malicious-record quarantine, and public correction are part of the security layer because prevention is incomplete.

## Primary references

- Netlify Web Analytics: https://docs.netlify.com/manage/monitoring/web-analytics/overview/
- Netlify rate limiting: https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- Netlify security checklist: https://docs.netlify.com/resources/checklists/security-checklist/
- Google web conversions: https://support.google.com/google-ads/answer/16560108
- Google tag privacy guidance: https://support.google.com/google-ads/answer/11994839
- Google consent mode: https://support.google.com/google-ads/answer/10000067
