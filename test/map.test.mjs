import test from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_AREAS,
  SERVICE_AREA_METADATA,
  getServiceArea,
  searchServiceAreas,
  serviceAreaFeatureCollection,
  serviceAreaLabelCollection
} from "../src/map-data.mjs";

test("service-area registry covers addressable West Berkeley with unique sourced IDs", () => {
  assert.ok(SERVICE_AREAS.length > 200);
  assert.equal(SERVICE_AREA_METADATA.areaCount, SERVICE_AREAS.length);
  assert.ok(SERVICE_AREA_METADATA.streetCount > 30);
  assert.match(SERVICE_AREA_METADATA.sourceUrl, /cityofberkeley.*Portal_CommSvcs.*MapServer\/1/i);
  assert.equal(new Set(SERVICE_AREAS.map(({ id }) => id)).size, SERVICE_AREAS.length);
  for (const area of SERVICE_AREAS) {
    assert.ok(["LineString", "MultiLineString"].includes(area.geometry.type));
    assert.ok(area.geometry.coordinates.length >= 1);
    assert.equal(area.center.length, 2);
    assert.ok(area.addressMin > 0);
    assert.ok(area.addressMax >= area.addressMin);
    assert.ok(area.sourceCenterlineIds.length >= 1);
  }
  assert.deepEqual(["2100", "2200", "2300", "2400"].map((id) => getServiceArea(id)?.id), ["2100", "2200", "2300", "2400"]);
  assert.ok(SERVICE_AREAS.some(({ streetName }) => streetName === "Cedar Street"));
  assert.ok(SERVICE_AREAS.some(({ streetName }) => streetName === "4th Street"));
  assert.ok(SERVICE_AREAS.some(({ streetName }) => streetName === "San Pablo Avenue"));
});

test("local search matches exact addresses, ranges, ordinal aliases, and cross streets", () => {
  assert.deepEqual(searchServiceAreas("2100 9th").map(({ id }) => id), ["2100"]);
  assert.deepEqual(searchServiceAreas("2127 9th St").map(({ id }) => id), ["2100"]);
  assert.deepEqual(searchServiceAreas("2300 ninth street").map(({ id }) => id), ["2300"]);
  assert.ok(searchServiceAreas("Allston").some(({ id }) => id === "2100"));
  assert.ok(searchServiceAreas("San Pablo Avenue").length > 5);
  assert.ok(searchServiceAreas("Fourth St").length > 5);
});

test("blank local search returns all supported ranges", () => {
  assert.equal(searchServiceAreas(" ").length, SERVICE_AREAS.length);
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
