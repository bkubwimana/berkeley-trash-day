import test from "node:test";
import assert from "node:assert/strict";
import { SERVICE_AREAS } from "../src/service-areas.generated.mjs";
import { STREET_SWEEPING_METADATA, streetSweepingOptions } from "../src/street-sweeping.mjs";
import {
  buildSweepingCalendar,
  nextMonthlyOccurrence,
  sweepingCalendarFilename
} from "../src/sweeping-calendar.mjs";

function area(block, streetName) {
  return SERVICE_AREAS.find((item) => item.addressRange === block && item.streetName === streetName);
}

test("imports the complete published residential schedule tables", () => {
  assert.equal(STREET_SWEEPING_METADATA.rowCount, 722);
  assert.match(STREET_SWEEPING_METADATA.sourcePageUrl, /berkeleyca\.gov/);
  assert.equal(Object.keys(STREET_SWEEPING_METADATA.sourceDocuments).length, 3);
});

test("keeps opposite sides of 2100 9th Street separate", () => {
  const options = streetSweepingOptions(area("2100", "9th Street"));
  assert.deepEqual(options.map(({ side, addressParity, ordinalLabel, weekday, period }) => ({ side, addressParity, ordinalLabel, weekday, period })), [
    { side: "E", addressParity: "Odd addresses", ordinalLabel: "2nd", weekday: "Monday", period: "AM" },
    { side: "W", addressParity: "Even addresses", ordinalLabel: "1st", weekday: "Friday", period: "AM" }
  ]);
});

test("honors the published opt-out for west-side 2100 8th Street", () => {
  const options = streetSweepingOptions(area("2100", "8th Street"));
  assert.deepEqual(options.map(({ side }) => side), ["E"]);
});

test("returns no guessed schedule outside published residential coverage", () => {
  assert.deepEqual(streetSweepingOptions(area("1100", "2nd Street")), []);
});

test("calculates the next nth-weekday occurrence", () => {
  assert.equal(nextMonthlyOccurrence(2, "Monday", new Date("2026-09-07T18:00:00Z")).toISOString(), "2026-09-14T00:00:00.000Z");
  assert.equal(nextMonthlyOccurrence(1, "Friday", new Date("2026-09-14T18:00:00Z")).toISOString(), "2026-10-02T00:00:00.000Z");
});

test("exports a finite side-specific reminder with safety context", () => {
  const selectedArea = area("2100", "9th Street");
  const option = streetSweepingOptions(selectedArea).find(({ side }) => side === "W");
  const calendar = buildSweepingCalendar({
    area: selectedArea,
    option,
    referenceDate: new Date("2026-09-14T18:00:00Z")
  });

  assert.match(calendar, /DTSTART;VALUE=DATE:20261002/);
  assert.match(calendar, /RRULE:FREQ=MONTHLY;COUNT=24;BYDAY=FR;BYSETPOS=1/);
  assert.match(calendar, /West side/);
  assert.match(calendar, /even addresses/);
  assert.match(calendar, /posted signs/);
  assert.match(calendar, /avoid a ticket/);
  assert.match(calendar, /City holidays/);
  assert.match(calendar, /TRIGGER:-P1D/);
  assert.doesNotMatch(calendar, /DTSTART:\d+T\d{6}/);
  assert.equal(sweepingCalendarFilename("2100", "9th Street", "West side"), "berkeley-street-sweeping-2100-9th-street-west-side.ics");
});
