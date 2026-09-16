import { nextDate } from "./calendar-links.mjs";

const WEEKDAY_CODE = Object.freeze({ Sunday: "SU", Monday: "MO", Tuesday: "TU", Wednesday: "WE", Thursday: "TH", Friday: "FR", Saturday: "SA" });
const WEEKDAY_INDEX = Object.freeze({ Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 });

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatCalendarDate(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function formatTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeCalendarText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function nextMonthlyOccurrence(ordinal, weekday, referenceDate = new Date()) {
  const reference = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()));
  for (let monthOffset = 0; monthOffset < 14; monthOffset += 1) {
    const first = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + monthOffset, 1));
    const delta = (WEEKDAY_INDEX[weekday] - first.getUTCDay() + 7) % 7;
    const occurrence = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1 + delta + (ordinal - 1) * 7));
    if (occurrence >= reference) return occurrence;
  }
  throw new Error("Unable to calculate the next street-sweeping date.");
}

export function sweepingCalendarFilename(block, streetName, side) {
  return `berkeley-street-sweeping-${block}-${slug(streetName)}-${slug(side)}.ics`;
}

export function sweepingCalendarEvent({ area, option, referenceDate = new Date() }) {
  if (!area || !option || !WEEKDAY_CODE[option.weekday]) return null;
  const startDate = nextMonthlyOccurrence(option.ordinal, option.weekday, referenceDate);
  const schedule = `${option.ordinalLabel} ${option.weekday} · ${option.period}`;
  const description = [
    `City-published residential schedule: ${schedule}.`,
    `${option.sideLabel}; ${option.addressParity.toLowerCase()}.`,
    "Check and follow posted signs for the exact restriction. Move your car before the posted time to avoid a ticket.",
    "Berkeley does not sweep on City holidays; the next regularly scheduled date applies."
  ].join(" ");

  return {
    id: option.id,
    title: `Check/move car — street sweeping (${option.sideLabel})`,
    startDate,
    endDate: nextDate(startDate),
    description,
    location: `${area.addressRange} ${area.streetName}, Berkeley, CA`,
    recurrenceLabel: `${option.ordinalLabel} ${option.weekday} monthly for 24 months`
  };
}

export function buildSweepingCalendar({ area, option, referenceDate = new Date() }) {
  const event = sweepingCalendarEvent({ area, option, referenceDate });
  if (!event) return null;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Berkeley Trash Day//Street Sweeping Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeCalendarText(`${area.addressRange} ${area.streetName} street sweeping`)}`,
    "BEGIN:VEVENT",
    `UID:${area.id}-${slug(option.side)}-sweeping@berkeleytrashday.org`,
    `DTSTAMP:${formatTimestamp(referenceDate)}`,
    `DTSTART;VALUE=DATE:${formatCalendarDate(event.startDate)}`,
    "DURATION:P1D",
    `RRULE:FREQ=MONTHLY;COUNT=24;BYDAY=${WEEKDAY_CODE[option.weekday]};BYSETPOS=${option.ordinal}`,
    `SUMMARY:${escapeCalendarText(event.title)}`,
    `DESCRIPTION:${escapeCalendarText(event.description)}`,
    `LOCATION:${escapeCalendarText(event.location)}`,
    `URL:${option.sourceUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Check signs and move your car for street sweeping",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}
