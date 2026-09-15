# Research

## Official source

The City of Berkeley Street Sweeping page instructs drivers to move cars before scheduled sweeping to avoid a ticket and to check posted signs for the day and exact time. It publishes three residential schedule PDFs: street names A–G, H–Z, and numbered streets.

The PDF tables provide route, street, curb side, address range, ordinal week, weekday, AM/PM, bounding cross streets, and optional opted-out blocks. They explicitly say even addresses are on south/west sides and odd addresses are on north/east sides. They also say streets are not swept on holidays and affected streets wait until their next regularly scheduled date.

## Product decisions

- Use City rows as read-only reference data; community trash reports do not alter sweeping schedules.
- Ask users to identify their curb side/address parity because a centerline range alone cannot select the correct schedule.
- Export an all-day “check/move car” reminder with a one-day alarm. This avoids claiming an exact time the source does not provide.
- Treat absent rows as absent published residential coverage, not proof that sweeping never occurs.
- Keep posted signs authoritative because temporary restrictions and sign-specific hours cannot be represented safely by the PDFs.

## Sources

- https://berkeleyca.gov/city-services/streets-sidewalks-sewers-and-utilities/street-sweeping
- https://berkeleyca.gov/sites/default/files/2022-03/StreetSweepingSchedule_StNamesA-G.pdf
- https://berkeleyca.gov/sites/default/files/2022-03/StreetSweepingSchedule_StNamesH-Z.pdf
- https://berkeleyca.gov/sites/default/files/2022-03/StreetSweepingSchedule_StNumbered.pdf

