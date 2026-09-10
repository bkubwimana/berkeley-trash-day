import test from "node:test";
import assert from "node:assert/strict";
import { createScheduleHandler, config as scheduleConfig } from "../netlify/functions/schedule.mjs";
import {
  createSubmitReportHandler,
  config as submitConfig
} from "../netlify/functions/submit-report.mjs";

function createMemoryStore(initial = {}) {
  const records = new Map(Object.entries(initial));
  const store = {
    async list({ prefix }) {
      return {
        blobs: [...records.keys()]
          .filter((key) => key.startsWith(prefix))
          .map((key) => ({ key }))
      };
    },
    async get(key) {
      return records.get(key) ?? null;
    },
    async set(key, value) {
      records.set(key, value);
    }
  };

  return { records, getStoreImpl: () => store };
}

test("GET schedule matches the documented aggregate contract", async () => {
  const reportedAt = "2026-09-01T12:00:00.000Z";
  const { getStoreImpl } = createMemoryStore({
    "reports/2100/a": JSON.stringify({ block: "2100", stream: "trash", day: "Tuesday", reportedAt }),
    "reports/2100/b": "malformed"
  });
  const handler = createScheduleHandler({
    getStoreImpl,
    now: () => new Date("2026-09-07T12:00:00.000Z")
  });
  const response = await handler(new Request("https://example.test/api/schedule"));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.generatedAt, "2026-09-07T12:00:00.000Z");
  assert.equal(body.blocks["2100"].trash.day, "Tuesday");
  assert.equal(body.blocks["2100"].trash.total, 1);
  assert.deepEqual(body.methodology, {
    windowDays: 180,
    minimumReports: 3,
    agreementThreshold: 2 / 3
  });
});

test("schedule endpoint rejects unsupported methods", async () => {
  const handler = createScheduleHandler({ getStoreImpl: () => ({}) });
  const response = await handler(new Request("https://example.test/api/schedule", { method: "POST" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("POST report stores only the constrained application record", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({
    getStoreImpl: memory.getStoreImpl,
    now: () => new Date("2026-09-07T12:00:00.000Z"),
    uuid: () => "report-id"
  });
  const response = await handler(new Request("https://example.test/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ block: "2100", streams: ["trash", "recycling"], day: "Tuesday", website: "" })
  }));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(memory.records.size, 1);
  assert.deepEqual(JSON.parse(memory.records.get("reports/2100/report-id")), {
    block: "2100",
    streams: ["trash", "recycling"],
    day: "Tuesday",
    reportedAt: "2026-09-07T12:00:00.000Z",
    street: "9th Street",
    city: "Berkeley, CA",
    source: "community"
  });
});

test("report endpoint rejects malformed, unsupported, honeypot, and oversized input", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({ getStoreImpl: memory.getStoreImpl });
  const requests = [
    new Request("https://example.test/api/reports", { method: "POST", body: "{" }),
    new Request("https://example.test/api/reports", {
      method: "POST",
      body: JSON.stringify({ block: "9999", streams: ["trash"], day: "Tuesday" })
    }),
    new Request("https://example.test/api/reports", {
      method: "POST",
      body: JSON.stringify({ block: "2100", streams: ["trash"], day: "Tuesday", website: "bot" })
    }),
    new Request("https://example.test/api/reports", {
      method: "POST",
      body: JSON.stringify({ block: "2100", streams: ["trash"], day: "Tuesday", comment: "x".repeat(2100) })
    })
  ];

  const responses = await Promise.all(requests.map((request) => handler(request)));
  assert.deepEqual(responses.map((response) => response.status), [400, 400, 400, 413]);
  assert.equal(memory.records.size, 0);
});

test("report endpoint rejects unsupported methods and declares platform rate limits", async () => {
  const handler = createSubmitReportHandler({ getStoreImpl: () => ({}) });
  const response = await handler(new Request("https://example.test/api/reports"));

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.deepEqual(submitConfig.rateLimit, {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ["ip", "domain"]
  });
  assert.equal(scheduleConfig.rateLimit.windowLimit, 120);
});
