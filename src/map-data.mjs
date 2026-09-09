export const WEST_BERKELEY_VIEW = {
  center: [-122.2935, 37.8665],
  zoom: 13.25,
  maxBounds: [[-122.326, 37.835], [-122.25, 37.902]]
};

export const SERVICE_AREAS = [
  {
    id: "2100",
    addressRange: "2100",
    streetName: "9th Street",
    aliases: ["Ninth Street", "9th St", "Ninth St"],
    startStreet: "Addison Street",
    endStreet: "Allston Way",
    center: [-122.293865, 37.867283],
    source: "OpenStreetMap way 164659520",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.2940025, 37.8673211], [-122.293992, 37.8672896],
        [-122.2939868, 37.8672736], [-122.2938936, 37.8669893],
        [-122.2938455, 37.8668423], [-122.2937655, 37.8665915],
        [-122.2937077, 37.8664102], [-122.2935896, 37.8660328],
        [-122.2935839, 37.8660133], [-122.2935736, 37.8659841]
      ]
    }
  },
  {
    id: "2200",
    addressRange: "2200",
    streetName: "9th Street",
    aliases: ["Ninth Street", "9th St", "Ninth St"],
    startStreet: "Allston Way",
    endStreet: "Bancroft Way",
    center: [-122.2936906, 37.8657754],
    source: "OpenStreetMap way 164659521",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.2935364, 37.8658786], [-122.2935251, 37.8658464],
        [-122.2935205, 37.865832], [-122.2933657, 37.8653443],
        [-122.2933235, 37.8652173], [-122.2931418, 37.8646523],
        [-122.2930234, 37.8642667], [-122.2930182, 37.86425],
        [-122.2930084, 37.8642197]
      ]
    }
  },
  {
    id: "2300",
    addressRange: "2300",
    streetName: "9th Street",
    aliases: ["Ninth Street", "9th St", "Ninth St"],
    startStreet: "Bancroft Way",
    endStreet: "Channing Way",
    center: [-122.2930944, 37.8640153],
    source: "OpenStreetMap way 164659519",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.2929736, 37.8641117], [-122.2929641, 37.8640822],
        [-122.2929589, 37.8640662], [-122.2928579, 37.8637534],
        [-122.2928077, 37.8635981], [-122.2927992, 37.8635718],
        [-122.292718, 37.8633206], [-122.2925392, 37.8627672],
        [-122.292447, 37.8624817], [-122.2924426, 37.8624671],
        [-122.2924306, 37.86243]
      ]
    }
  },
  {
    id: "2400",
    addressRange: "2400",
    streetName: "9th Street",
    aliases: ["Ninth Street", "9th St", "Ninth St"],
    startStreet: "Channing Way",
    endStreet: "Dwight Way",
    center: [-122.2925371, 37.8622683],
    source: "OpenStreetMap way 1251939837",
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.292415, 37.8623815], [-122.2924031, 37.8623448],
        [-122.2923981, 37.8623292], [-122.2918757, 37.8607064],
        [-122.2918506, 37.8606404]
      ]
    }
  }
];

function normalizeSearch(value) {
  return String(value)
    .toLowerCase()
    .replace(/\bninth\b/g, "9th")
    .replace(/\bstreet\b/g, "st")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchServiceAreas(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return SERVICE_AREAS;
  const tokens = normalized.split(/\s+/);

  return SERVICE_AREAS.filter((area) => {
    const haystack = normalizeSearch([
      area.addressRange,
      area.streetName,
      ...area.aliases,
      area.startStreet,
      area.endStreet
    ].join(" "));
    return tokens.every((token) => haystack.includes(token));
  });
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

export function boundsForServiceArea(area) {
  return area.geometry.coordinates.reduce(
    (bounds, [longitude, latitude]) => [
      [Math.min(bounds[0][0], longitude), Math.min(bounds[0][1], latitude)],
      [Math.max(bounds[1][0], longitude), Math.max(bounds[1][1], latitude)]
    ],
    [[Infinity, Infinity], [-Infinity, -Infinity]]
  );
}
