import { STREET_SWEEPING_METADATA, STREET_SWEEPING_ROWS } from "./street-sweeping.generated.mjs";

const ORDINAL_LABELS = Object.freeze({ 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" });
const SIDE_LABELS = Object.freeze({ N: "North side", S: "South side", E: "East side", W: "West side", "N/S": "Both sides", "S/N": "Both sides", "E/W": "Both sides", "W/E": "Both sides" });
const ADDRESS_PARITY = Object.freeze({ N: "Odd addresses", E: "Odd addresses", S: "Even addresses", W: "Even addresses", "N/S": "All addresses", "S/N": "All addresses", "E/W": "All addresses", "W/E": "All addresses" });

const STREET_ALIASES = Object.freeze({
  "dwight way": "dwight",
  "park way": "park"
});

function normalizeStreetName(value) {
  const lower = String(value).toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  if (STREET_ALIASES[lower]) return STREET_ALIASES[lower];
  return lower
    .replace(/\b(street|avenue|boulevard|drive|road|lane|way)\b/g, "")
    .replace(/\b(st|ave|blvd|dr|rd|ln)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hundredBlock(area) {
  return Math.floor(Number(area.addressMin) / 100) * 100;
}

function matchesArea(row, area) {
  return normalizeStreetName(row.streetName) === normalizeStreetName(area.streetName) &&
    row.addressFrom <= area.addressMax &&
    row.addressTo >= area.addressMin;
}

export function streetSweepingOptions(area) {
  if (!area) return [];
  const block = hundredBlock(area);
  const seen = new Set();

  return STREET_SWEEPING_ROWS.flatMap((row) => {
    if (!matchesArea(row, area) || row.optOutBlocks.includes(block)) return [];
    const key = [row.side, row.ordinal, row.weekday, row.period].join("-");
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      id: `${area.id}-${key.toLowerCase()}`,
      side: row.side,
      sideLabel: SIDE_LABELS[row.side],
      addressParity: ADDRESS_PARITY[row.side],
      ordinal: row.ordinal,
      ordinalLabel: ORDINAL_LABELS[row.ordinal],
      weekday: row.weekday,
      period: row.period,
      fromStreet: row.fromStreet,
      toStreet: row.toStreet,
      sourceUrl: STREET_SWEEPING_METADATA.sourceDocuments[row.source].url
    }];
  }).sort((a, b) => a.side.localeCompare(b.side));
}

export { STREET_SWEEPING_METADATA };
