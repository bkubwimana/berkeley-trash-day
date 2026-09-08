export const BLOCKS = ["2100", "2200", "2300", "2400"];
export const STREAMS = ["trash", "recycling", "compost"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const REPORT_WINDOW_DAYS = 180;
export const MINIMUM_REPORTS = 3;
export const AGREEMENT_THRESHOLD = 2 / 3;

const INPUT_FIELDS = new Set(["block", "stream", "day", "website"]);

export function validateReport(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["Submit one collection-day report."], value: null };
  }

  const unsupportedFields = Object.keys(input).filter((field) => !INPUT_FIELDS.has(field));
  const block = typeof input?.block === "string" ? input.block.trim() : "";
  const stream = typeof input?.stream === "string" ? input.stream.trim() : "";
  const day = typeof input?.day === "string" ? input.day.trim() : "";

  if (unsupportedFields.length > 0) errors.push("Submission contains unsupported fields.");
  if (!BLOCKS.includes(block)) errors.push("Choose a supported 9th Street block.");
  if (!STREAMS.includes(stream)) errors.push("Choose trash, recycling, or compost.");
  if (!DAYS.includes(day)) errors.push("Choose a valid collection day.");
  if (input?.website) errors.push("Submission rejected.");

  return {
    ok: errors.length === 0,
    errors,
    value: errors.length === 0 ? { block, stream, day } : null
  };
}

export function aggregateReports(reports, now = new Date()) {
  const cutoff = now.getTime() - REPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = reports.filter((report) => {
    const timestamp = new Date(report.reportedAt).getTime();
    return Number.isFinite(timestamp)
      && timestamp >= cutoff
      && timestamp <= now.getTime()
      && BLOCKS.includes(report.block)
      && STREAMS.includes(report.stream)
      && DAYS.includes(report.day);
  });

  return Object.fromEntries(BLOCKS.map((block) => {
    const blockSchedule = Object.fromEntries(STREAMS.map((stream) => {
      const matching = recent.filter((report) => report.block === block && report.stream === stream);
      const counts = new Map(DAYS.map((day) => [day, 0]));

      for (const report of matching) {
        counts.set(report.day, counts.get(report.day) + 1);
      }

      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || DAYS.indexOf(a[0]) - DAYS.indexOf(b[0]));
      const [day, winningReports] = ranked[0];
      const total = matching.length;
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
