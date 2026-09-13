import { SERVICE_AREAS } from "./service-areas.generated.mjs";

export const CORRIDOR = SERVICE_AREAS;

export const STREAMS = [
  { id: "trash", label: "Trash" },
  { id: "recycling", label: "Recycling" },
  { id: "compost", label: "Compost" }
];

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export function buildCorridorView(schedule, selectedBlock, loadFailed = false) {
  return CORRIDOR.map((area) => {
    const blockSchedule = schedule?.blocks?.[area.id];
    const loading = !schedule && !loadFailed;
    const activeStreams = Object.fromEntries(STREAMS.map(({ id }) => [
      id,
      !loadFailed && (blockSchedule?.[id]?.total ?? 0) > 0
    ]));
    const totalReports = loading || loadFailed
      ? null
      : STREAMS.reduce((total, { id }) => total + (blockSchedule?.[id]?.total ?? 0), 0);
    const coveredStreams = loading || loadFailed
      ? null
      : Object.values(activeStreams).filter(Boolean).length;
    const activityText = loadFailed
      ? "Community activity unavailable"
      : loading
        ? "Loading community activity"
        : `${totalReports} recent community ${totalReports === 1 ? "report" : "reports"} across ${coveredStreams} of 3 streams`;

    return {
      ...area,
      activeStreams,
      totalReports,
      coveredStreams,
      activityText,
      selected: area.id === selectedBlock
    };
  });
}

export function formatSummary(summary, loadFailed = false) {
  if (loadFailed) {
    return {
      day: "Unavailable",
      detail: "Community data could not be loaded. Try again shortly.",
      tone: "error"
    };
  }

  if (!summary || summary.total === 0) {
    return {
      day: "No reports yet",
      detail: "Be the first to share an observed day",
      tone: "empty"
    };
  }

  return {
    day: summary.day,
    detail: `${summary.winningReports} of ${summary.total} recent reports agree · ${summary.status}`,
    tone: summary.status === "Community consensus" ? "consensus" : "developing"
  };
}

export function buildWeeklyCalendar(blockSchedule, loadFailed = false) {
  const streamsByDay = new Map(WEEKDAYS.map((day) => [day, []]));

  if (!loadFailed) {
    for (const { id, label } of STREAMS) {
      const summary = blockSchedule?.[id];
      if (!summary?.day || !summary.total || !streamsByDay.has(summary.day)) continue;
      streamsByDay.get(summary.day).push({
        id,
        label,
        status: summary.status,
        total: summary.total
      });
    }
  }

  return {
    unavailable: loadFailed,
    days: WEEKDAYS.map((day) => ({ day, streams: streamsByDay.get(day) }))
  };
}

export function makeReportPayload(values) {
  return {
    block: values.block,
    streams: Array.isArray(values.streams) ? [...values.streams] : [],
    day: values.day,
    website: values.website || ""
  };
}
