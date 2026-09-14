import { getStore } from "@netlify/blobs";
import { validateReport } from "../../src/reporting.mjs";
import { getServiceArea } from "../../src/service-areas.generated.mjs";
import {
  declaredBodyTooLarge,
  jsonResponse,
  rejectUnsafeWrite
} from "./_shared/http-security.mjs";

const MAX_BODY_BYTES = 2_000;

export function createSubmitReportHandler({
  getStoreImpl = getStore,
  now = () => new Date(),
  uuid = () => crypto.randomUUID()
} = {}) {
  return async function submitReportHandler(request) {
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "POST" } }
      );
    }

    const unsafeWrite = rejectUnsafeWrite(request);
    if (unsafeWrite) return unsafeWrite;

    if (declaredBodyTooLarge(request, MAX_BODY_BYTES)) {
      return jsonResponse({ error: "Submission is too large." }, { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return jsonResponse({ error: "Submission is too large." }, { status: 413 });
    }

    let input;
    try {
      input = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Invalid JSON." }, { status: 400 });
    }

    const validation = validateReport(input);
    if (!validation.ok) {
      return jsonResponse({ error: validation.errors[0] }, { status: 400 });
    }

    const area = getServiceArea(validation.value.block);
    const report = {
      ...validation.value,
      reportedAt: now().toISOString(),
      street: area.streetName,
      addressRange: area.addressRange,
      city: "Berkeley, CA",
      source: "community"
    };

    try {
      const store = getStoreImpl({ name: "collection-reports", consistency: "strong" });
      const key = `reports/${report.block}/${uuid()}`;
      await store.set(key, JSON.stringify(report));
      return jsonResponse({ ok: true }, { status: 201 });
    } catch (error) {
      console.error("submit report error", error);
      return jsonResponse(
        { error: "The report could not be saved. Please try again." },
        { status: 500 }
      );
    }
  };
}

export default createSubmitReportHandler();

export const config = {
  path: "/api/reports",
  rateLimit: {
    windowLimit: 3,
    windowSize: 600,
    aggregateBy: ["ip", "domain"]
  }
};
