import test from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_AREAS,
  searchServiceAreas,
  serviceAreaFeatureCollection,
  serviceAreaLabelCollection
} from "../src/map-data.mjs";

test("service-area registry uses unique fixed report IDs and line geometry", () => {
  assert.deepEqual(SERVICE_AREAS.map(({ id }) => id), ["2100", "2200", "2300", "2400"]);
  assert.equal(new Set(SERVICE_AREAS.map(({ id }) => id)).size, SERVICE_AREAS.length);
  for (const area of SERVICE_AREAS) {
    assert.equal(area.geometry.type, "LineString");
    assert.ok(area.geometry.coordinates.length >= 2);
    assert.equal(area.center.length, 2);
    assert.match(area.source, /OpenStreetMap/);
  }
});

test("local search matches range, numeric and word street aliases, and cross streets", () => {
  assert.deepEqual(searchServiceAreas("2100 9th").map(({ id }) => id), ["2100"]);
  assert.deepEqual(searchServiceAreas("2300 ninth street").map(({ id }) => id), ["2300"]);
  assert.deepEqual(searchServiceAreas("Allston").map(({ id }) => id), ["2100", "2200"]);
  assert.deepEqual(searchServiceAreas("San Pablo Avenue"), []);
});

test("blank local search returns all supported ranges", () => {
  assert.deepEqual(searchServiceAreas(" ").map(({ id }) => id), ["2100", "2200", "2300", "2400"]);
});

test("map feature collections preserve selection without creating schedule data", () => {
  const lines = serviceAreaFeatureCollection("2300");
  const labels = serviceAreaLabelCollection("2300");

  assert.equal(lines.type, "FeatureCollection");
  assert.equal(labels.type, "FeatureCollection");
  assert.equal(lines.features.length, SERVICE_AREAS.length);
  assert.equal(labels.features.length, SERVICE_AREAS.length);
  assert.equal(lines.features.find(({ properties }) => properties.id === "2300").properties.selected, true);
  assert.equal(lines.features.find(({ properties }) => properties.id === "2100").properties.selected, false);
  assert.ok(lines.features.every(({ properties }) => !("day" in properties)));
});
