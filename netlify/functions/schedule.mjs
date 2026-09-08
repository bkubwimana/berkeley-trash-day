import { getStore } from "@netlify/blobs";
import {
  AGREEMENT_THRESHOLD,
  MINIMUM_REPORTS,
  REPORT_WINDOW_DAYS,
  aggregateReports
} from "../../src/reporting.mjs";

export function createScheduleHandler({ getStoreImpl = getStore, now = () => new Date() } = {}) {
  return async function scheduleHandler(request) {
    if (request.method !== "GET") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "GET" } }
      );
    }

    try {
      const store = getStoreImpl({ name: "collection-reports", consistency: "strong" });
      const { blobs } = await store.list({ prefix: "reports/" });
      const stored = await Promise.all(
        blobs.map((blob) => store.get(blob.key, { consistency: "strong" }))
      );
      const reports = stored.flatMap((value) => {
        if (!value) return [];
        try {
          return [typeof value === "string" ? JSON.parse(value) : value];
        } catch {
          return [];
        }
      });

      const generatedAt = now();
      return Response.json({
        generatedAt: generatedAt.toISOString(),
        blocks: aggregateReports(reports, generatedAt),
        methodology: {
          windowDays: REPORT_WINDOW_DAYS,
          minimumReports: MINIMUM_REPORTS,
          agreementThreshold: AGREEMENT_THRESHOLD
        }
      });
    } catch (error) {
      console.error("schedule error", error);
      return Response.json(
        { error: "Schedule data is temporarily unavailable." },
        { status: 500 }
      );
    }
  };
}

export default createScheduleHandler();

export const config = {
  path: "/api/schedule",
  rateLimit: {
    windowLimit: 120,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
