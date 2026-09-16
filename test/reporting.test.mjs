import test from "node:test";
import assert from "node:assert/strict";
import {
  BLOCKS,
  DAYS,
  STREAMS,
  aggregateReports,
  validateReport
} from "../src/reporting.mjs";
import { TERMS_VERSION } from "../src/terms.mjs";

const now = new Date("2026-09-07T12:00:00.000Z");
const reportedAt = "2026-09-01T12:00:00.000Z";
const acceptedTerms = { termsAccepted: true, termsVersion: TERMS_VERSION };

test("exposes the West Berkeley registry and fixed civic enumerations", () => {
  assert.ok(BLOCKS.length > 200);
  assert.ok(["2100", "2200", "2300", "2400"].every((id) => BLOCKS.includes(id)));
  assert.deepEqual(STREAMS, ["trash", "recycling", "compost"]);
  assert.deepEqual(DAYS, [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ]);
});

test("accepts a supported anonymous multi-stream report", () => {
  const result = validateReport({
    ...acceptedTerms,
    block: "2100",
    streams: ["trash", "recycling", "compost"],
    day: "Tuesday",
    website: ""
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    block: "2100",
    streams: ["trash", "recycling", "compost"],
    day: "Tuesday",
    termsVersion: TERMS_VERSION
  });
});

test("rejects unsupported values and honeypot submissions", () => {
  const result = validateReport({ ...acceptedTerms, block: "9999", streams: ["glass"], day: "Tomorrow", website: "spam" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 4);
  assert.equal(result.value, null);
});

test("rejects empty, duplicate, and mixed stream selections", () => {
  assert.equal(validateReport({ ...acceptedTerms, block: "2100", streams: [], day: "Tuesday" }).ok, false);
  assert.equal(validateReport({ ...acceptedTerms, block: "2100", streams: ["trash", "trash"], day: "Tuesday" }).ok, false);
  assert.equal(validateReport({ ...acceptedTerms, block: "2100", stream: "trash", streams: ["trash"], day: "Tuesday" }).ok, false);
});

test("rejects arrays, missing values, and extra fields", () => {
  assert.equal(validateReport([]).ok, false);
  assert.equal(validateReport(null).ok, false);
  assert.equal(validateReport({
    ...acceptedTerms,
    block: "2100",
    stream: "trash",
    day: "Tuesday",
    exactAddress: "not allowed"
  }).ok, false);
});

test("requires affirmative acceptance of the current Terms version", () => {
  const base = { block: "2100", streams: ["trash"], day: "Tuesday" };
  assert.equal(validateReport(base).ok, false);
  assert.equal(validateReport({ ...base, termsAccepted: true, termsVersion: "outdated" }).ok, false);
  assert.equal(validateReport({ ...base, termsAccepted: false, termsVersion: TERMS_VERSION }).ok, false);
});

test("returns a complete empty schedule without suggesting a weekday", () => {
  const blocks = aggregateReports([], now);
  assert.deepEqual(new Set(Object.keys(blocks)), new Set(BLOCKS));
  assert.deepEqual(blocks["2100"].trash, {
    day: null,
    winningReports: 0,
    total: 0,
    agreementPercent: 0,
    status: "No reports"
  });
});

test("publishes one observation during the early-beta traction phase", () => {
  const blocks = aggregateReports([
    { block: "2100", stream: "trash", day: "Tuesday", reportedAt }
  ], now);
  assert.deepEqual(blocks["2100"].trash, {
    day: "Tuesday",
    winningReports: 1,
    total: 1,
    agreementPercent: 100,
    status: "Community consensus"
  });
});

test("accepts and aggregates a generated non-Ninth Street range", async () => {
  const { SERVICE_AREAS } = await import("../src/map-data.mjs");
  const area = SERVICE_AREAS.find(({ streetName }) => streetName === "Cedar Street");
  assert.ok(area);
  const validation = validateReport({ ...acceptedTerms, block: area.id, streams: ["compost"], day: "Thursday" });
  assert.equal(validation.ok, true);
  const blocks = aggregateReports([{ ...validation.value, reportedAt }], now);
  assert.equal(blocks[area.id].compost.day, "Thursday");
});

test("counts one multi-stream record on the same day for every selected stream", () => {
  const blocks = aggregateReports([{
    block: "2100",
    streams: ["trash", "recycling", "compost"],
    day: "Tuesday",
    reportedAt
  }], now);

  for (const stream of STREAMS) {
    assert.equal(blocks["2100"][stream].day, "Tuesday");
    assert.equal(blocks["2100"][stream].total, 1);
  }
});

test("keeps the two-thirds agreement rule as reports accumulate", () => {
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
