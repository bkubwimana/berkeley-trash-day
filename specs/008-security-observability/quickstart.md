# Quickstart: Security and Observability Verification

1. Run `npm test` and `npm run check`.
2. Run `npm audit --omit=dev` and review every production finding.
3. Build and scan `dist/` for `googletagmanager`, `google-analytics`, `gtag(`, and known tracking SDK names; expect no matches.
4. Submit valid same-origin JSON; expect `201`.
5. Submit `text/plain`; expect `415`.
6. Submit a foreign `Origin` or `Sec-Fetch-Site: cross-site`; expect `403`.
7. Submit a declared or actual body over 2,000 bytes; expect `413`.
8. Inspect production `/`, `/api/schedule`, and API errors for the specified security headers.
9. Retrieve `/.well-known/security.txt` and `/sitemap.xml`.
10. Confirm Netlify billing terms before selecting **Enable Analytics**.
11. Do not configure Google tags until the tag ID, conversion action, consent behavior, privacy wording, and CSP host list are reviewed together.
