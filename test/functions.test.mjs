import test from "node:test";
import assert from "node:assert/strict";
import { createScheduleHandler, config as scheduleConfig } from "../netlify/functions/schedule.mjs";
import {
  createSubmitReportHandler,
  config as submitConfig
} from "../netlify/functions/submit-report.mjs";
import { SERVICE_AREAS } from "../src/map-data.mjs";
import { TERMS_VERSION } from "../src/terms.mjs";

const acceptedTerms = { termsAccepted: true, termsVersion: TERMS_VERSION };

function acceptedReport(body) {
  return { ...acceptedTerms, ...body };
}

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

function jsonRequest(url, body, headers = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
}

function assertApiSecurityHeaders(response) {
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
  assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(response.headers.get("permissions-policy"), "camera=(), microphone=(), geolocation=()");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
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
    minimumReports: 1,
    agreementThreshold: 2 / 3
  });
  assertApiSecurityHeaders(response);
  assert.equal(
    response.headers.get("netlify-cdn-cache-control"),
    "public, durable, s-maxage=15, stale-while-revalidate=30"
  );
});

test("schedule endpoint rejects unsupported methods", async () => {
  const handler = createScheduleHandler({ getStoreImpl: () => ({}) });
  const response = await handler(new Request("https://example.test/api/schedule", { method: "POST" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("schedule endpoint rejects cache-bypass query parameters before storage access", async () => {
  let storageAccessed = false;
  const handler = createScheduleHandler({
    getStoreImpl: () => {
      storageAccessed = true;
      return {};
    }
  });
  const response = await handler(new Request("https://example.test/api/schedule?nonce=random"));

  assert.equal(response.status, 400);
  assert.equal(storageAccessed, false);
  assertApiSecurityHeaders(response);
});

test("POST report stores only the constrained application record", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({
    getStoreImpl: memory.getStoreImpl,
    now: () => new Date("2026-09-07T12:00:00.000Z"),
    uuid: () => "report-id"
  });
  const response = await handler(jsonRequest(
    "https://example.test/api/reports",
    acceptedReport({ block: "2100", streams: ["trash", "recycling"], day: "Tuesday", website: "" })
  ));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assertApiSecurityHeaders(response);
  assert.equal(memory.records.size, 1);
  assert.deepEqual(JSON.parse(memory.records.get("reports/2100/report-id")), {
    block: "2100",
    streams: ["trash", "recycling"],
    day: "Tuesday",
    termsVersion: TERMS_VERSION,
    reportedAt: "2026-09-07T12:00:00.000Z",
    termsAcceptedAt: "2026-09-07T12:00:00.000Z",
    street: "9th Street",
    addressRange: "2100",
    city: "Berkeley, CA",
    source: "community"
  });
});

test("POST report stores the public label for a non-Ninth Street range", async () => {
  const area = SERVICE_AREAS.find(({ streetName }) => streetName === "Cedar Street");
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({
    getStoreImpl: memory.getStoreImpl,
    now: () => new Date("2026-09-07T12:00:00.000Z"),
    uuid: () => "cedar-report"
  });
  const response = await handler(jsonRequest(
    "https://example.test/api/reports",
    acceptedReport({ block: area.id, streams: ["compost"], day: "Thursday" })
  ));
  assert.equal(response.status, 201);
  const stored = JSON.parse(memory.records.get(`reports/${area.id}/cedar-report`));
  assert.equal(stored.street, "Cedar Street");
  assert.equal(stored.addressRange, area.addressRange);
});

test("report endpoint rejects malformed, unsupported, honeypot, and oversized input", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({ getStoreImpl: memory.getStoreImpl });
  const requests = [
    new Request("https://example.test/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    }),
    jsonRequest("https://example.test/api/reports", acceptedReport({
      block: "9999", streams: ["trash"], day: "Tuesday"
    })),
    jsonRequest("https://example.test/api/reports", acceptedReport({
      block: "2100", streams: ["trash"], day: "Tuesday", website: "bot"
    })),
    jsonRequest("https://example.test/api/reports", acceptedReport({
      block: "2100", streams: ["trash"], day: "Tuesday", comment: "x".repeat(2100)
    }))
  ];

  const responses = await Promise.all(requests.map((request) => handler(request)));
  assert.deepEqual(responses.map((response) => response.status), [400, 400, 400, 413]);
  assert.equal(memory.records.size, 0);
});

test("report endpoint rejects missing or stale Terms acceptance", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({ getStoreImpl: memory.getStoreImpl });
  const base = { block: "2100", streams: ["trash"], day: "Tuesday" };
  const responses = await Promise.all([
    handler(jsonRequest("https://example.test/api/reports", base)),
    handler(jsonRequest("https://example.test/api/reports", { ...base, termsAccepted: true, termsVersion: "outdated" })),
    handler(jsonRequest("https://example.test/api/reports", { ...base, termsAccepted: false, termsVersion: TERMS_VERSION }))
  ]);

  assert.deepEqual(responses.map((response) => response.status), [400, 400, 400]);
  assert.equal(memory.records.size, 0);
});

test("report endpoint rejects wrong media types and cross-site browser submissions", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({ getStoreImpl: memory.getStoreImpl });
  const body = acceptedReport({ block: "2100", streams: ["trash"], day: "Tuesday" });
  const requests = [
    new Request("https://example.test/api/reports", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify(body)
    }),
    jsonRequest("https://example.test/api/reports", body, {
      origin: "https://attacker.test"
    }),
    jsonRequest("https://example.test/api/reports", body, {
      "sec-fetch-site": "cross-site"
    }),
    jsonRequest("https://example.test/api/reports", body, {
      origin: "not a valid origin"
    })
  ];

  const responses = await Promise.all(requests.map((request) => handler(request)));
  assert.deepEqual(responses.map((response) => response.status), [415, 403, 403, 403]);
  responses.forEach(assertApiSecurityHeaders);
  assert.equal(memory.records.size, 0);
});

test("report endpoint accepts an explicit same-origin browser submission", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({ getStoreImpl: memory.getStoreImpl });
  const response = await handler(jsonRequest(
    "https://berkeleytrashday.org/api/reports",
    acceptedReport({ block: "2100", streams: ["trash"], day: "Tuesday" }),
    { origin: "https://berkeleytrashday.org", "sec-fetch-site": "same-origin" }
  ));

  assert.equal(response.status, 201);
  assert.equal(memory.records.size, 1);
});

test("report endpoint rejects an oversized declared body before reading it", async () => {
  const memory = createMemoryStore();
  const handler = createSubmitReportHandler({ getStoreImpl: memory.getStoreImpl });
  const response = await handler(jsonRequest(
    "https://example.test/api/reports",
    acceptedReport({ block: "2100", streams: ["trash"], day: "Tuesday" }),
    { "content-length": "2001" }
  ));

  assert.equal(response.status, 413);
  assert.equal(memory.records.size, 0);
});

test("report endpoint rejects unsupported methods and declares platform rate limits", async () => {
  const handler = createSubmitReportHandler({ getStoreImpl: () => ({}) });
  const response = await handler(new Request("https://example.test/api/reports"));

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.deepEqual(submitConfig.rateLimit, {
    windowLimit: 3,
    windowSize: 600,
    aggregateBy: ["ip", "domain"]
  });
  assert.equal(scheduleConfig.rateLimit.windowLimit, 120);
});
