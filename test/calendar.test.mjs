import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPickupCalendar,
  consensusCalendarStreams,
  pickupCalendarFilename
} from "../src/calendar.mjs";

test("exports only consensus streams as finite all-day weekly events", () => {
  const blockSchedule = {
    trash: { day: "Tuesday", total: 4, winningReports: 3, status: "Community consensus" },
    recycling: { day: "Tuesday", total: 2, winningReports: 2, status: "Developing" },
    compost: { day: "Thursday", total: 3, winningReports: 3, status: "Community consensus" }
  };

  const calendar = buildPickupCalendar({
    block: "2100",
    blockSchedule,
    referenceDate: new Date("2026-09-07T18:00:00Z")
  });

  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 2);
  assert.match(calendar, /DTSTART;VALUE=DATE:20260908/);
  assert.match(calendar, /DTSTART;VALUE=DATE:20260910/);
  assert.equal((calendar.match(/RRULE:FREQ=WEEKLY;COUNT=26/g) ?? []).length, 2);
  assert.match(calendar, /SUMMARY:Trash pickup - 2100 9th Street/);
  assert.match(calendar, /SUMMARY:Compost pickup - 2100 9th Street/);
  assert.doesNotMatch(calendar, /SUMMARY:Recycling pickup/);
  assert.match(calendar, /Unofficial community reminder/);
  assert.match(calendar, /Holiday changes may not appear/);
  assert.ok(calendar.endsWith("\r\n"));
});

test("supports multiple consensus streams on the same weekday", () => {
  const calendar = buildPickupCalendar({
    block: "2400",
    blockSchedule: {
      trash: { day: "Monday", total: 3, status: "Community consensus" },
      recycling: { day: "Monday", total: 5, status: "Community consensus" },
      compost: { day: "Monday", total: 1, status: "Developing" }
    },
    referenceDate: new Date("2026-09-07T18:00:00Z")
  });

  assert.equal((calendar.match(/DTSTART;VALUE=DATE:20260907/g) ?? []).length, 2);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 2);
});

test("does not generate a file without a valid consensus weekday", () => {
  assert.deepEqual(consensusCalendarStreams({
    trash: { day: "Tuesday", total: 2, status: "Developing" },
    recycling: { day: "Funday", total: 3, status: "Community consensus" }
  }), []);
  assert.equal(buildPickupCalendar({ block: "2100", blockSchedule: null }), null);
});

test("uses a stable readable calendar filename", () => {
  assert.equal(pickupCalendarFilename("2100"), "berkeley-trash-day-2100-9th-street.ics");
});
