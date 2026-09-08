import test from "node:test";
import assert from "node:assert/strict";
import { formatSummary, makeReportPayload } from "../public/app.js";

test("formats empty, developing, consensus, and unavailable schedule states", () => {
  assert.deepEqual(formatSummary(null), {
    day: "No reports yet",
    detail: "Be the first to share an observed day",
    tone: "empty"
  });
  assert.deepEqual(formatSummary({
    day: "Tuesday",
    winningReports: 1,
    total: 2,
    status: "Developing"
  }), {
    day: "Tuesday",
    detail: "1 of 2 recent reports agree · Developing",
    tone: "developing"
  });
  assert.equal(formatSummary({
    day: "Tuesday",
    winningReports: 3,
    total: 3,
    status: "Community consensus"
  }).tone, "consensus");
  assert.equal(formatSummary(null, true).day, "Unavailable");
});

test("builds only the constrained report payload", () => {
  const payload = makeReportPayload({
    block: "2200",
    stream: "compost",
    day: "Thursday",
    website: "",
    exactAddress: "must not pass through"
  });
  assert.deepEqual(payload, {
    block: "2200",
    stream: "compost",
    day: "Thursday",
    website: ""
  });
});
