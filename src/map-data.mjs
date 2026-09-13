import {
  SERVICE_AREAS as SERVICE_AREA_INDEX,
  SERVICE_AREA_METADATA,
  getServiceArea
} from "./service-areas.generated.mjs";
import { SERVICE_AREA_GEOMETRIES } from "./service-area-geometries.generated.mjs";

export const SERVICE_AREAS = Object.freeze(SERVICE_AREA_INDEX.map((area) => ({
  ...area,
  geometry: SERVICE_AREA_GEOMETRIES[area.id]
})));

export { SERVICE_AREA_METADATA, getServiceArea };

export const WEST_BERKELEY_VIEW = {
  center: [-122.296, 37.867],
  zoom: 13.25,
  maxBounds: [[-122.326, 37.835], [-122.25, 37.902]]
};

const ORDINAL_WORDS = [
  ["first", "1st"], ["second", "2nd"], ["third", "3rd"], ["fourth", "4th"],
  ["fifth", "5th"], ["sixth", "6th"], ["seventh", "7th"], ["eighth", "8th"],
  ["ninth", "9th"], ["tenth", "10th"], ["eleventh", "11th"], ["twelfth", "12th"]
];

function normalizeSearch(value) {
  let normalized = String(value).toLowerCase();
  for (const [word, ordinal] of ORDINAL_WORDS) {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, "g"), ordinal);
  }
  return normalized
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\broad\b/g, "rd")
    .replace(/\blane\b/g, "ln")
    .replace(/\bcrescent\b/g, "cres")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesAddressNumber(area, addressNumber) {
  return addressNumber >= area.addressMin && addressNumber <= area.addressMax;
}

export function searchServiceAreas(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return SERVICE_AREAS;
  const tokens = normalized.split(/\s+/);
  const addressNumber = /^\d{1,5}$/.test(tokens[0]) ? Number(tokens.shift()) : null;

  return SERVICE_AREAS.flatMap((area) => {
    if (addressNumber !== null && !matchesAddressNumber(area, addressNumber)) return [];
    const primaryHaystack = normalizeSearch([
      area.addressRange,
      "block",
      area.streetName,
      area.officialStreetName,
      ...area.aliases
    ].join(" "));
    const fullHaystack = normalizeSearch([
      primaryHaystack,
      area.startStreet,
      area.endStreet
    ].join(" "));
    if (!tokens.every((token) => fullHaystack.includes(token))) return [];
    return [{ area, direct: tokens.every((token) => primaryHaystack.includes(token)) }];
  }).sort((a, b) => Number(b.direct) - Number(a.direct)).map(({ area }) => area);
}

export function serviceAreaFeatureCollection(selectedId) {
  return {
    type: "FeatureCollection",
    features: SERVICE_AREAS.map((area) => ({
      type: "Feature",
      properties: {
        id: area.id,
        label: `${area.addressRange} ${area.streetName}`,
        selected: area.id === selectedId
      },
      geometry: area.geometry
    }))
  };
}

export function serviceAreaLabelCollection(selectedId) {
  return {
    type: "FeatureCollection",
    features: SERVICE_AREAS.map((area) => ({
      type: "Feature",
      properties: {
        id: area.id,
        addressRange: area.addressRange,
        selected: area.id === selectedId
      },
      geometry: { type: "Point", coordinates: area.center }
    }))
  };
}

function geometryLines(geometry) {
  return geometry.type === "MultiLineString" ? geometry.coordinates : [geometry.coordinates];
}

export function boundsForServiceArea(area) {
  return geometryLines(area.geometry).flat().reduce(
    (bounds, [longitude, latitude]) => [
      [Math.min(bounds[0][0], longitude), Math.min(bounds[0][1], latitude)],
      [Math.max(bounds[1][0], longitude), Math.max(bounds[1][1], latitude)]
    ],
    [[Infinity, Infinity], [-Infinity, -Infinity]]
  );
}
