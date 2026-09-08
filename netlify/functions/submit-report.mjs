import { getStore } from "@netlify/blobs";
import { validateReport } from "../../src/reporting.mjs";

const MAX_BODY_BYTES = 2_000;

export function createSubmitReportHandler({
  getStoreImpl = getStore,
  now = () => new Date(),
  uuid = () => crypto.randomUUID()
} = {}) {
  return async function submitReportHandler(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "POST" } }
      );
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return Response.json({ error: "Submission is too large." }, { status: 413 });
    }

    let input;
    try {
      input = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const validation = validateReport(input);
    if (!validation.ok) {
      return Response.json({ error: validation.errors[0] }, { status: 400 });
    }

    const report = {
      ...validation.value,
      reportedAt: now().toISOString(),
      street: "9th Street",
      city: "Berkeley, CA",
      source: "community"
    };

    try {
      const store = getStoreImpl({ name: "collection-reports", consistency: "strong" });
      const key = `reports/${report.block}/${uuid()}`;
      await store.set(key, JSON.stringify(report));
      return Response.json({ ok: true }, { status: 201 });
    } catch (error) {
      console.error("submit report error", error);
      return Response.json(
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
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ["ip", "domain"]
  }
};
