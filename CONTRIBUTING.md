# Contributing

Thanks for helping make collection-day information easier to find.

## Principles

- Protect resident privacy. Never collect or publish exact resident addresses, names,
  contact details, photographs of homes, or submitted location coordinates. Public
  street-centerline geometry may be added only with documented provenance.
- Label community information honestly. Do not describe a report as verified by the
  City unless a documented official source supports it.
- Show the evidence behind confidence. Preserve raw report counts and the public
  consensus rule.
- Keep the project small and accessible. Prefer browser-native HTML, CSS, and
  JavaScript over unnecessary dependencies.

## Development

1. Fork and clone the repository.
2. Run `npm install`.
3. Run `npm run dev`.
4. Add tests for changes to validation or consensus logic.
5. Run `npm test` and `npm run check` before opening a pull request.

Please use fictional reports only in local development. Do not seed the production
database with test schedules.

## Adding a service range

Map visibility is not report coverage. New reportable ranges require all of the following:

1. A reviewed street segment and address range from a documented public source such as
   the City of Berkeley Streets Network.
2. A fixed, non-identifying service-area ID added to both the frontend registry and API
   allowlist.
3. Search, geometry, validation, empty-state, and mobile tests.
4. A Spec Kit feature review before production data collection begins.
