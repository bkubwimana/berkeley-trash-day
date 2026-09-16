function pad(value) {
  return String(value).padStart(2, "0");
}

function formatCompactDate(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function formatIsoDate(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function nextDate(date) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + 1);
  return result;
}

export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatCompactDate(event.startDate)}/${formatCompactDate(event.endDate)}`,
    details: event.description,
    location: event.location
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params}`;
}

export function outlookCalendarUrl(event) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: formatIsoDate(event.startDate),
    enddt: formatIsoDate(event.endDate),
    allday: "true",
    body: event.description,
    location: event.location
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params}`;
}

export function calendarEventDateLabel(event) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(event.startDate);
}
