import test from "node:test";
import assert from "node:assert/strict";
import {
  CORRIDOR,
  buildCorridorView,
  formatSummary,
  makeReportPayload
} from "../src/corridor.mjs";

test("defines the four consecutive blocks between their real cross streets", () => {
  assert.deepEqual(CORRIDOR, [
    { block: "2100", startStreet: "Addison Street", endStreet: "Allston Way" },
    { block: "2200", startStreet: "Allston Way", endStreet: "Bancroft Way" },
    { block: "2300", startStreet: "Bancroft Way", endStreet: "Channing Way" },
    { block: "2400", startStreet: "Channing Way", endStreet: "Dwight Way" }
  ]);
});

test("derives report totals and active stream signals from the loaded schedule", () => {
  const schedule = {
    blocks: {
      "2100": {
        trash: { total: 2 },
        recycling: { total: 0 },
        compost: { total: 1 }
      },
      "2200": {
        trash: { total: 0 },
        recycling: { total: 0 },
        compost: { total: 0 }
      }
    }
  };
  const view = buildCorridorView(schedule, "2100");

  assert.equal(view[0].totalReports, 3);
  assert.equal(view[0].coveredStreams, 2);
  assert.deepEqual(view[0].activeStreams, {
    trash: true,
    recycling: false,
    compost: true
  });
  assert.equal(view[0].selected, true);
  assert.equal(view[1].totalReports, 0);
  assert.equal(view[1].coveredStreams, 0);
  assert.equal(view[1].selected, false);
});

test("distinguishes unavailable activity from a loaded empty block", () => {
  const unavailable = buildCorridorView(null, "2300", true);
  assert.equal(unavailable[2].totalReports, null);
  assert.equal(unavailable[2].coveredStreams, null);
  assert.equal(unavailable[2].activityText, "Community activity unavailable");

  const empty = buildCorridorView({ blocks: {} }, "2300");
  assert.equal(empty[2].totalReports, 0);
  assert.equal(empty[2].activityText, "0 recent community reports across 0 of 3 streams");
});

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
