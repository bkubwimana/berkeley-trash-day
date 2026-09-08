import test from "node:test";
import assert from "node:assert/strict";
import {
  BLOCKS,
  DAYS,
  STREAMS,
  aggregateReports,
  validateReport
} from "../src/reporting.mjs";

const now = new Date("2026-09-07T12:00:00.000Z");
const reportedAt = "2026-09-01T12:00:00.000Z";

test("exposes only the four beta blocks and fixed civic enumerations", () => {
  assert.deepEqual(BLOCKS, ["2100", "2200", "2300", "2400"]);
  assert.deepEqual(STREAMS, ["trash", "recycling", "compost"]);
  assert.deepEqual(DAYS, [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ]);
});

test("accepts a supported anonymous report", () => {
  const result = validateReport({ block: "2100", stream: "trash", day: "Tuesday", website: "" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { block: "2100", stream: "trash", day: "Tuesday" });
});

test("rejects unsupported values and honeypot submissions", () => {
  const result = validateReport({ block: "9999", stream: "glass", day: "Tomorrow", website: "spam" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 4);
  assert.equal(result.value, null);
});

test("rejects arrays, missing values, and extra fields", () => {
  assert.equal(validateReport([]).ok, false);
  assert.equal(validateReport(null).ok, false);
  assert.equal(validateReport({
    block: "2100",
    stream: "trash",
    day: "Tuesday",
    exactAddress: "not allowed"
  }).ok, false);
});

test("returns a complete empty schedule without suggesting a weekday", () => {
  const blocks = aggregateReports([], now);
  assert.deepEqual(Object.keys(blocks), BLOCKS);
  assert.deepEqual(blocks["2100"].trash, {
    day: null,
    winningReports: 0,
    total: 0,
    agreementPercent: 0,
    status: "No reports"
  });
});

test("shows one observation as developing", () => {
  const blocks = aggregateReports([
    { block: "2100", stream: "trash", day: "Tuesday", reportedAt }
  ], now);
  assert.deepEqual(blocks["2100"].trash, {
    day: "Tuesday",
    winningReports: 1,
    total: 1,
    agreementPercent: 100,
    status: "Developing"
  });
});

test("publishes consensus only after three reports and two-thirds agreement", () => {
  const reports = [
    { block: "2100", stream: "trash", day: "Tuesday", reportedAt },
    { block: "2100", stream: "trash", day: "Tuesday", reportedAt },
    { block: "2100", stream: "trash", day: "Wednesday", reportedAt }
  ];
  const blocks = aggregateReports(reports, now);
  const trash = blocks["2100"].trash;
  assert.equal(trash.day, "Tuesday");
  assert.equal(trash.total, 3);
  assert.equal(trash.winningReports, 2);
  assert.equal(trash.agreementPercent, 67);
  assert.equal(trash.status, "Community consensus");
});

test("does not claim consensus when leading weekdays are tied", () => {
  const reports = [
    { block: "2300", stream: "recycling", day: "Monday", reportedAt },
    { block: "2300", stream: "recycling", day: "Monday", reportedAt },
    { block: "2300", stream: "recycling", day: "Tuesday", reportedAt },
    { block: "2300", stream: "recycling", day: "Tuesday", reportedAt }
  ];
  const summary = aggregateReports(reports, now)["2300"].recycling;
  assert.equal(summary.day, "Monday");
  assert.equal(summary.status, "Developing");
  assert.equal(summary.agreementPercent, 50);
});

test("excludes reports older than the 180-day window", () => {
  const reports = [{
    block: "2200",
    stream: "compost",
    day: "Friday",
    reportedAt: "2025-01-01T00:00:00.000Z"
  }];
  const blocks = aggregateReports(reports, now);
  assert.equal(blocks["2200"].compost.total, 0);
});

test("excludes future, malformed, and unsupported stored reports", () => {
  const reports = [
    { block: "2100", stream: "trash", day: "Tuesday", reportedAt: "2027-01-01T00:00:00.000Z" },
    { block: "2100", stream: "trash", day: "Tuesday", reportedAt: "invalid" },
    { block: "9999", stream: "trash", day: "Tuesday", reportedAt },
    { block: "2100", stream: "glass", day: "Tuesday", reportedAt },
    { block: "2100", stream: "trash", day: "Tomorrow", reportedAt }
  ];
  assert.equal(aggregateReports(reports, now)["2100"].trash.total, 0);
});
