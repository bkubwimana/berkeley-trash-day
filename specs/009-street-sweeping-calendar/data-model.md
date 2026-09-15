# Data model

## Generated schedule row

- `source`: `a-g`, `h-z`, or `numbered`
- `route`: City route number
- `streetName`: City table street label
- `side`: `N`, `S`, `E`, `W`, or a combined side value
- `addressFrom`, `addressTo`: inclusive published range
- `ordinal`: 1–4
- `weekday`: full weekday name
- `period`: `AM` or `PM`
- `fromStreet`, `toStreet`: City table bounding labels
- `optOutBlocks`: normalized hundred-block values excluded by the City table

## Derived sweeping option

- `id`: deterministic schedule/side identifier
- `side`, `sideLabel`, `addressParity`
- `ordinal`, `ordinalLabel`, `weekday`, `period`
- `sourceUrl`

No per-user parking or calendar data is persisted.

