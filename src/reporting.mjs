import { SERVICE_AREAS } from "./service-areas.generated.mjs";

export const BLOCKS = SERVICE_AREAS.map(({ id }) => id);
export const STREAMS = ["trash", "recycling", "compost"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const REPORT_WINDOW_DAYS = 180;
export const MINIMUM_REPORTS = 3;
export const AGREEMENT_THRESHOLD = 2 / 3;

const INPUT_FIELDS = new Set(["block", "stream", "streams", "day", "website"]);

function normalizeInputStreams(input) {
  const hasLegacyStream = Object.hasOwn(input, "stream");
  const hasStreams = Object.hasOwn(input, "streams");
  if (hasLegacyStream && hasStreams) return { valid: false, streams: [] };

  const values = hasStreams ? input.streams : hasLegacyStream ? [input.stream] : [];
  if (!Array.isArray(values) || values.length === 0 || values.length > STREAMS.length) {
    return { valid: false, streams: [] };
  }

  const streams = values.map((value) => typeof value === "string" ? value.trim() : "");
  const unique = new Set(streams);
  return {
    valid: streams.every((stream) => STREAMS.includes(stream)) && unique.size === streams.length,
    streams
  };
}

function normalizeStoredStreams(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) return [];
  const hasLegacyStream = Object.hasOwn(report, "stream");
  const hasStreams = Object.hasOwn(report, "streams");
  if (hasLegacyStream === hasStreams) return [];

  const values = hasStreams ? report.streams : [report.stream];
  if (!Array.isArray(values) || values.length === 0 || values.length > STREAMS.length) return [];
  if (!values.every((stream) => typeof stream === "string" && STREAMS.includes(stream))) return [];
  if (new Set(values).size !== values.length) return [];
  return values;
}

export function validateReport(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["Submit one collection-day report."], value: null };
  }

  const unsupportedFields = Object.keys(input).filter((field) => !INPUT_FIELDS.has(field));
  const block = typeof input?.block === "string" ? input.block.trim() : "";
  const streamSelection = normalizeInputStreams(input);
  const day = typeof input?.day === "string" ? input.day.trim() : "";

  if (unsupportedFields.length > 0) errors.push("Submission contains unsupported fields.");
  if (!BLOCKS.includes(block)) errors.push("Choose a supported West Berkeley street range.");
  if (!streamSelection.valid) errors.push("Choose one or more collection types.");
  if (!DAYS.includes(day)) errors.push("Choose a valid collection day.");
  if (input?.website) errors.push("Submission rejected.");

  return {
    ok: errors.length === 0,
    errors,
    value: errors.length === 0 ? { block, streams: streamSelection.streams, day } : null
  };
}

export function aggregateReports(reports, now = new Date()) {
  const cutoff = now.getTime() - REPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = reports.flatMap((report) => {
    const timestamp = new Date(report.reportedAt).getTime();
    const streams = normalizeStoredStreams(report);
    const valid = Number.isFinite(timestamp)
      && timestamp >= cutoff
      && timestamp <= now.getTime()
      && BLOCKS.includes(report.block)
      && streams.length > 0
      && DAYS.includes(report.day);
    return valid ? [{ ...report, streams }] : [];
  });

  const countsByBlock = new Map();
  for (const report of recent) {
    const blockCounts = countsByBlock.get(report.block) ?? new Map();
    for (const stream of report.streams) {
      const counts = blockCounts.get(stream) ?? new Map(DAYS.map((day) => [day, 0]));
      counts.set(report.day, counts.get(report.day) + 1);
      blockCounts.set(stream, counts);
    }
    countsByBlock.set(report.block, blockCounts);
  }

  return Object.fromEntries(BLOCKS.map((block) => {
    const blockSchedule = Object.fromEntries(STREAMS.map((stream) => {
      const counts = countsByBlock.get(block)?.get(stream) ?? new Map(DAYS.map((day) => [day, 0]));
      const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || DAYS.indexOf(a[0]) - DAYS.indexOf(b[0]));
      const [day, winningReports] = ranked[0];
      const agreementPercent = total === 0 ? 0 : Math.round((winningReports / total) * 100);
      const tied = total > 0 && ranked[1][1] === winningReports;
      const consensus = total >= MINIMUM_REPORTS
        && !tied
        && winningReports / total >= AGREEMENT_THRESHOLD;

      return [stream, {
        day: total === 0 ? null : day,
        winningReports,
        total,
        agreementPercent,
        status: total === 0 ? "No reports" : consensus ? "Community consensus" : "Developing"
      }];
    }));

    return [block, blockSchedule];
  }));
}
