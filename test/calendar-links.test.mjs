import test from "node:test";
import assert from "node:assert/strict";
import {
  calendarEventDateLabel,
  googleCalendarUrl,
  nextDate,
  outlookCalendarUrl
} from "../src/calendar-links.mjs";

const event = {
  title: "Trash pickup - 2100 9th Street",
  startDate: new Date("2026-09-08T00:00:00.000Z"),
  endDate: new Date("2026-09-09T00:00:00.000Z"),
  description: "Unofficial community reminder.",
  location: "2100 9th Street, Berkeley, CA"
};

test("builds an encoded Google Calendar event template", () => {
  const url = new URL(googleCalendarUrl(event));
  assert.equal(url.origin, "https://calendar.google.com");
  assert.equal(url.pathname, "/calendar/r/eventedit");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), event.title);
  assert.equal(url.searchParams.get("dates"), "20260908/20260909");
  assert.equal(url.searchParams.get("location"), event.location);
});

test("builds an encoded Outlook all-day event composer", () => {
  const url = new URL(outlookCalendarUrl(event));
  assert.equal(url.origin, "https://outlook.office.com");
  assert.equal(url.searchParams.get("subject"), event.title);
  assert.equal(url.searchParams.get("startdt"), "2026-09-08");
  assert.equal(url.searchParams.get("enddt"), "2026-09-09");
  assert.equal(url.searchParams.get("allday"), "true");
});

test("formats provider dates without local-time drift", () => {
  assert.equal(nextDate(event.startDate).toISOString(), "2026-09-09T00:00:00.000Z");
  assert.equal(calendarEventDateLabel(event), "Tuesday, Sep 8, 2026");
});
