import { writeFile } from "node:fs/promises";

const SOURCE_URL = "https://gis.cityofberkeley.info/arcgis/rest/services/Public/Portal_CommSvcs/MapServer/1";
const QUERY_URL = `${SOURCE_URL}/query`;
const REGISTRY_OUTPUT_URL = new URL("../src/service-areas.generated.mjs", import.meta.url);
const GEOMETRY_OUTPUT_URL = new URL("../src/service-area-geometries.generated.mjs", import.meta.url);
const PAGE_SIZE = 1000;
const WEST_BERKELEY_ENVELOPE = "559284.8,4188961.2,563100,4195714";
const EXCLUDED_ROAD_CLASSES = new Set(["HIGHWAY", "RAMP", "PEDESTRIAN", "Private Road"]);
const EXCLUDED_NAME_PARTS = ["OVERPASS", "OVRPAS"];
const LEGACY_IDS = new Map([
  ["6794", "2100"],
  ["6813", "2200"],
  ["6808", "2300"],
  ["6812", "2400"]
]);
const ORDINALS = new Map([
  ["FIRST", "1st"], ["SECOND", "2nd"], ["THIRD", "3rd"], ["FOURTH", "4th"],
  ["FIFTH", "5th"], ["SIXTH", "6th"], ["SEVENTH", "7th"], ["EIGHTH", "8th"],
  ["NINTH", "9th"], ["TENTH", "10th"], ["ELEVENTH", "11th"], ["TWELFTH", "12th"]
]);
const STREET_TYPES = new Map([
  ["ST", "Street"], ["AVE", "Avenue"], ["BLVD", "Boulevard"], ["DR", "Drive"],
  ["RD", "Road"], ["LN", "Lane"], ["CT", "Court"], ["CIR", "Circle"],
  ["CRES", "Crescent"], ["HWY", "Highway"], ["PL", "Place"], ["TER", "Terrace"],
  ["WAY", "Way"], ["LOOP", "Loop"]
]);

function queryParameters(offset) {
  return new URLSearchParams({
    where: "1=1",
    outFields: [
      "OBJECTID", "CENTERLINEID", "FROMLEFT", "TOLEFT", "FROMRIGHT", "TORIGHT",
      "FULLNAME", "ROADCLASS", "MUNILEFT", "MUNIRIGHT", "LASTUPDATE", "block_addr"
    ].join(","),
    geometry: WEST_BERKELEY_ENVELOPE,
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    inSR: "32610",
    outSR: "4326",
    returnGeometry: "true",
    orderByFields: "OBJECTID ASC",
    resultOffset: String(offset),
    resultRecordCount: String(PAGE_SIZE),
    f: "geojson"
  });
}

async function fetchSourceFeatures() {
  const features = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await fetch(`${QUERY_URL}?${queryParameters(offset)}`);
    if (!response.ok) throw new Error(`City GIS request failed with ${response.status}`);
    const page = await response.json();
    if (page.error) throw new Error(`City GIS error: ${page.error.message ?? "unknown error"}`);
    features.push(...(page.features ?? []));
    if (!page.exceededTransferLimit && (page.features?.length ?? 0) < PAGE_SIZE) break;
  }
  return features;
}

function positiveAddresses(properties) {
  return [properties.FROMLEFT, properties.TOLEFT, properties.FROMRIGHT, properties.TORIGHT]
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
}

function coordinatesFor(feature) {
  if (feature.geometry?.type !== "LineString") return [];
  return feature.geometry.coordinates.map(([longitude, latitude]) => [longitude, latitude]);
}

function distanceSquared([aLongitude, aLatitude], [bLongitude, bLatitude]) {
  const latitudeScale = 111_320;
  const longitudeScale = Math.cos(((aLatitude + bLatitude) / 2) * Math.PI / 180) * latitudeScale;
  return ((aLongitude - bLongitude) * longitudeScale) ** 2 + ((aLatitude - bLatitude) * latitudeScale) ** 2;
}

function lineLength(coordinates) {
  let total = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    total += Math.sqrt(distanceSquared(coordinates[index - 1], coordinates[index]));
  }
  return total;
}

function pointAlongLine(coordinates, fraction = 0.5) {
  const total = lineLength(coordinates);
  if (!total) return coordinates[0];
  const target = total * fraction;
  let covered = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const start = coordinates[index - 1];
    const end = coordinates[index];
    const segmentLength = Math.sqrt(distanceSquared(start, end));
    if (covered + segmentLength >= target) {
      const progress = segmentLength ? (target - covered) / segmentLength : 0;
      return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress
      ];
    }
    covered += segmentLength;
  }
  return coordinates.at(-1);
}

function sanPabloLongitudeAt(latitude, sanPabloLines) {
  const candidates = [];
  for (const coordinates of sanPabloLines) {
    for (let index = 1; index < coordinates.length; index += 1) {
      const [aLongitude, aLatitude] = coordinates[index - 1];
      const [bLongitude, bLatitude] = coordinates[index];
      const minimum = Math.min(aLatitude, bLatitude);
      const maximum = Math.max(aLatitude, bLatitude);
      if (latitude < minimum || latitude > maximum) continue;
      const progress = aLatitude === bLatitude ? 0.5 : (latitude - aLatitude) / (bLatitude - aLatitude);
      candidates.push(aLongitude + (bLongitude - aLongitude) * progress);
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => a - b);
  return candidates[Math.floor(candidates.length / 2)];
}

function titleWord(word) {
  if (ORDINALS.has(word)) return ORDINALS.get(word);
  if (STREET_TYPES.has(word)) return STREET_TYPES.get(word);
  return word.charAt(0) + word.slice(1).toLowerCase();
}

function displayStreetName(officialName) {
  return officialName.trim().split(/\s+/).map(titleWord).join(" ");
}

function officialTitle(officialName) {
  return officialName.trim().split(/\s+/).map((word) => {
    if (STREET_TYPES.has(word)) return STREET_TYPES.get(word);
    return word.charAt(0) + word.slice(1).toLowerCase();
  }).join(" ");
}

function abbreviatedStreetName(displayName) {
  return displayName
    .replace(/\bStreet$/, "St")
    .replace(/\bAvenue$/, "Ave")
    .replace(/\bBoulevard$/, "Blvd")
    .replace(/\bDrive$/, "Dr")
    .replace(/\bRoad$/, "Rd")
    .replace(/\bLane$/, "Ln")
    .replace(/\bCrescent$/, "Cres");
}

function normalizeLine(coordinates) {
  return coordinates.map(([longitude, latitude]) => [
    Number(longitude.toFixed(7)),
    Number(latitude.toFixed(7))
  ]);
}

function canonicalLineKey(coordinates) {
  const forward = JSON.stringify(coordinates);
  const reverse = JSON.stringify([...coordinates].reverse());
  return forward < reverse ? forward : reverse;
}

function pointToSegmentDistanceSquared(point, start, end) {
  const latitudeScale = 111_320;
  const longitudeScale = Math.cos(point[1] * Math.PI / 180) * latitudeScale;
  const px = point[0] * longitudeScale;
  const py = point[1] * latitudeScale;
  const ax = start[0] * longitudeScale;
  const ay = start[1] * latitudeScale;
  const bx = end[0] * longitudeScale;
  const by = end[1] * latitudeScale;
  const dx = bx - ax;
  const dy = by - ay;
  const denominator = dx * dx + dy * dy;
  const progress = denominator ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denominator)) : 0;
  return (px - (ax + progress * dx)) ** 2 + (py - (ay + progress * dy)) ** 2;
}

function distanceToLines(point, lines) {
  let best = Infinity;
  for (const coordinates of lines) {
    for (let index = 1; index < coordinates.length; index += 1) {
      best = Math.min(best, pointToSegmentDistanceSquared(point, coordinates[index - 1], coordinates[index]));
    }
  }
  return Math.sqrt(best);
}

function boundaryEndpoints(lines) {
  const endpoints = lines.flatMap((coordinates) => [coordinates[0], coordinates.at(-1)]);
  const groups = [];
  for (const endpoint of endpoints) {
    const existing = groups.find(({ point }) => distanceSquared(point, endpoint) <= 3 ** 2);
    if (existing) existing.count += 1;
    else groups.push({ point: endpoint, count: 1 });
  }
  const boundaries = groups.filter(({ count }) => count === 1).map(({ point }) => point);
  return boundaries.length ? boundaries : groups.map(({ point }) => point);
}

function deriveCrossStreets(area, areas) {
  const candidates = new Map();
  for (const endpoint of boundaryEndpoints(area.lines)) {
    for (const other of areas) {
      if (other === area || other.officialStreetName === area.officialStreetName) continue;
      const distance = distanceToLines(endpoint, other.lines);
      if (distance > 24) continue;
      const current = candidates.get(other.streetName);
      if (current === undefined || distance < current) candidates.set(other.streetName, distance);
    }
  }
  return [...candidates.entries()]
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
    .slice(0, 2);
}

function isEligible(feature, sanPabloLines) {
  const properties = feature.properties ?? {};
  const name = String(properties.FULLNAME ?? "").trim();
  const isBerkeley = properties.MUNILEFT === "Berkeley" || properties.MUNIRIGHT === "Berkeley";
  if (!isBerkeley || !name || !positiveAddresses(properties).length) return false;
  if (EXCLUDED_ROAD_CLASSES.has(properties.ROADCLASS)) return false;
  if (EXCLUDED_NAME_PARTS.some((part) => name.includes(part))) return false;
  const coordinates = coordinatesFor(feature);
  if (coordinates.length < 2) return false;
  if (name === "SAN PABLO AVE") return true;
  const [longitude, latitude] = pointAlongLine(coordinates);
  const easternEdge = sanPabloLongitudeAt(latitude, sanPabloLines);
  return easternEdge !== null && longitude <= easternEdge + 0.0002;
}

function buildAreas(features) {
  const berkeleySanPabloLines = features
    .filter((feature) => feature.properties?.FULLNAME === "SAN PABLO AVE")
    .filter((feature) => feature.properties?.MUNILEFT === "Berkeley" || feature.properties?.MUNIRIGHT === "Berkeley")
    .map(coordinatesFor)
    .filter((coordinates) => coordinates.length >= 2);
  if (!berkeleySanPabloLines.length) throw new Error("City source did not contain Berkeley San Pablo Avenue geometry");

  const groups = new Map();
  for (const feature of features.filter((candidate) => isEligible(candidate, berkeleySanPabloLines))) {
    const properties = feature.properties;
    const addresses = positiveAddresses(properties);
    const addressBucket = Math.floor(Math.min(...addresses) / 100) * 100;
    const key = `${properties.FULLNAME}|${addressBucket}`;
    const group = groups.get(key) ?? {
      officialStreetName: properties.FULLNAME,
      addressBucket,
      addresses: [],
      sourceCenterlineIds: [],
      sourceUpdatedValues: [],
      lineMap: new Map()
    };
    const line = normalizeLine(coordinatesFor(feature));
    group.addresses.push(...addresses);
    group.sourceCenterlineIds.push(String(properties.CENTERLINEID));
    if (Number.isFinite(Number(properties.LASTUPDATE))) group.sourceUpdatedValues.push(Number(properties.LASTUPDATE));
    group.lineMap.set(canonicalLineKey(line), line);
    groups.set(key, group);
  }

  const provisional = [...groups.values()].map((group) => {
    const lines = [...group.lineMap.values()];
    const longestLine = [...lines].sort((a, b) => lineLength(b) - lineLength(a))[0];
    const sourceCenterlineIds = [...new Set(group.sourceCenterlineIds)].sort((a, b) => Number(a) - Number(b));
    const legacyId = sourceCenterlineIds.map((id) => LEGACY_IDS.get(id)).find(Boolean);
    const streetName = displayStreetName(group.officialStreetName);
    return {
      id: legacyId ?? `cob-${sourceCenterlineIds.join("-")}`,
      addressRange: group.addressBucket > 0 ? String(group.addressBucket) : "1–99",
      addressMin: Math.min(...group.addresses),
      addressMax: Math.max(...group.addresses),
      streetName,
      officialStreetName: group.officialStreetName,
      aliases: [...new Set([
        officialTitle(group.officialStreetName),
        abbreviatedStreetName(streetName)
      ])].filter((alias) => alias !== streetName),
      center: normalizeLine([pointAlongLine(longestLine)])[0],
      sourceCenterlineIds,
      sourceUpdatedAt: group.sourceUpdatedValues.length
        ? new Date(Math.max(...group.sourceUpdatedValues)).toISOString()
        : null,
      lines
    };
  });

  const areas = provisional.map((area) => {
    const [startStreet = "", endStreet = ""] = deriveCrossStreets(area, provisional);
    return {
      id: area.id,
      addressRange: area.addressRange,
      addressMin: area.addressMin,
      addressMax: area.addressMax,
      streetName: area.streetName,
      officialStreetName: area.officialStreetName,
      aliases: area.aliases,
      startStreet,
      endStreet,
      center: area.center,
      sourceCenterlineIds: area.sourceCenterlineIds,
      sourceUpdatedAt: area.sourceUpdatedAt,
      geometry: area.lines.length === 1
        ? { type: "LineString", coordinates: area.lines[0] }
        : { type: "MultiLineString", coordinates: area.lines }
    };
  });

  return areas.sort((a, b) => (
    a.streetName.localeCompare(b.streetName, "en", { numeric: true })
      || Number.parseInt(a.addressRange, 10) - Number.parseInt(b.addressRange, 10)
      || a.id.localeCompare(b.id)
  ));
}

function serializeRegistry(areas) {
  const latestSourceUpdate = areas.map(({ sourceUpdatedAt }) => sourceUpdatedAt).filter(Boolean).sort().at(-1) ?? null;
  const metadata = {
    sourceName: "City of Berkeley Block Numbers",
    sourceUrl: SOURCE_URL,
    coverageDefinition: "Addressable Berkeley centerlines on or west of San Pablo Avenue",
    excludedRoadClasses: [...EXCLUDED_ROAD_CLASSES],
    areaCount: areas.length,
    streetCount: new Set(areas.map(({ streetName }) => streetName)).size,
    latestSourceUpdate
  };
  const registry = areas.map(({ geometry: _geometry, ...area }) => area);
  return `// Generated by scripts/generate-service-areas.mjs. Do not edit by hand.\n\nexport const SERVICE_AREA_METADATA = Object.freeze(${JSON.stringify(metadata, null, 2)});\n\nexport const SERVICE_AREAS = Object.freeze(${JSON.stringify(registry, null, 2)});\n\nconst SERVICE_AREA_BY_ID = new Map(SERVICE_AREAS.map((area) => [area.id, area]));\n\nexport function getServiceArea(id) {\n  return SERVICE_AREA_BY_ID.get(id) ?? null;\n}\n`;
}

function serializeGeometries(areas) {
  const geometries = Object.fromEntries(areas.map(({ id, geometry }) => [id, geometry]));
  return `// Generated by scripts/generate-service-areas.mjs. Do not edit by hand.\n\nexport const SERVICE_AREA_GEOMETRIES = Object.freeze(${JSON.stringify(geometries, null, 2)});\n`;
}

const features = await fetchSourceFeatures();
const areas = buildAreas(features);
if (areas.length < 200) throw new Error(`Refusing to write unexpectedly small registry (${areas.length} areas)`);
for (const id of LEGACY_IDS.values()) {
  if (!areas.some((area) => area.id === id)) throw new Error(`Missing legacy area ${id}`);
}
await Promise.all([
  writeFile(REGISTRY_OUTPUT_URL, serializeRegistry(areas), "utf8"),
  writeFile(GEOMETRY_OUTPUT_URL, serializeGeometries(areas), "utf8")
]);
console.log(`Generated ${areas.length} ranges across ${new Set(areas.map(({ streetName }) => streetName)).size} streets.`);
