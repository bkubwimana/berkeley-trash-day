# Quickstart

1. Select a street range on the map.
2. In “Street sweeping,” find the side where the car is parked. West/south correspond to even addresses; east/north correspond to odd addresses.
3. Read the published week, day, and AM/PM window.
4. Download that side's reminder and import the `.ics` file into a calendar.
5. Before parking, check the posted street sign for the exact restriction.

To refresh source data, download the three official PDFs and run:

```sh
npm run generate:street-sweeping -- --a-g path/to/a-g.pdf --h-z path/to/h-z.pdf --numbered path/to/numbered.pdf
```

