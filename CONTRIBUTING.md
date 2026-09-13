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

## Updating service ranges

Map visibility is not report coverage. West Berkeley ranges are generated from the City
of Berkeley public Block Numbers layer:

1. Run `npm run generate:service-areas`.
2. Review changes to `src/service-areas.generated.mjs` and
   `src/service-area-geometries.generated.mjs`, especially count, provenance,
   exclusions, existing IDs, geometry, and boundary cases near San Pablo Avenue.
3. Run search, geometry, validation, empty-state, API, and mobile tests.
4. Use a Spec Kit feature review before changing the coverage definition or collecting
   production data for a new neighborhood.

Do not hand-edit the generated registry or add a map-only range to the API.
