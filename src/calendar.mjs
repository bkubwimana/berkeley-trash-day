import { STREAMS, WEEKDAYS } from "./corridor.mjs";

const CONSENSUS_STATUS = "Community consensus";
const WEEKDAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

export function consensusCalendarStreams(blockSchedule) {
  return STREAMS.flatMap(({ id, label }) => {
    const summary = blockSchedule?.[id];
    if (summary?.status !== CONSENSUS_STATUS || !WEEKDAYS.includes(summary.day)) return [];
    return [{ id, label, day: summary.day }];
  });
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatCalendarDate(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function formatTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function nextWeekdayDate(day, referenceDate) {
  const localDay = referenceDate.getDay();
  const date = new Date(Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  ));
  const daysAhead = (WEEKDAY_INDEX[day] - localDay + 7) % 7;
  date.setUTCDate(date.getUTCDate() + daysAhead);
  return date;
}

function escapeCalendarText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function pickupCalendarFilename(block, streetName = "9th Street") {
  return `berkeley-trash-day-${block}-${slug(streetName)}.ics`;
}

export function buildPickupCalendar({
  block,
  streetName = "9th Street",
  serviceAreaId = block,
  blockSchedule,
  referenceDate = new Date()
}) {
  const streams = consensusCalendarStreams(blockSchedule);
  if (!streams.length) return null;

  const generatedAt = formatTimestamp(referenceDate);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Berkeley Trash Day//Community Pickup Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeCalendarText(`${block} ${streetName} pickup`)}`
  ];

  for (const stream of streams) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${serviceAreaId}-${stream.id}@berkeleytrashday.netlify.app`,
      `DTSTAMP:${generatedAt}`,
      `DTSTART;VALUE=DATE:${formatCalendarDate(nextWeekdayDate(stream.day, referenceDate))}`,
      "DURATION:P1D",
      "RRULE:FREQ=WEEKLY;COUNT=26",
      `SUMMARY:${escapeCalendarText(`${stream.label} pickup - ${block} ${streetName}`)}`,
      `DESCRIPTION:${escapeCalendarText("Unofficial community reminder. Holiday changes may not appear. Verify changes with Berkeley Zero Waste.")}`,
      "URL:https://berkeleytrashday.netlify.app/",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
