# Quickstart: Verify West Berkeley Expansion

1. Run `npm run generate:service-areas` and confirm the generated metadata and geometry are deterministic.
2. Run `npm test` and `npm run check`.
3. Search one exact address, one abbreviated street, one ordinal street, and one cross street.
4. Select a non-Ninth Street range and confirm map, summary, calendar, pickup details, and form agree.
5. Confirm the initial result list is bounded and “Show more” progressively reveals matches.
6. Submit a test report only against injected test storage; do not seed production community data.
7. Check 320 px mobile and desktop layouts, then verify City and basemap attribution in the footer.
