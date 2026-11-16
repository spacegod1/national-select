const CLINIC_TIME_ZONE = "America/New_York";
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

/** Turns a stored `YYYY-MM-DD` date into `MM/DD/YYYY`. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  if (!year || !month || !day) return isoDate;
  return `${month}/${day}/${year}`;
}

/** Turns a stored timestamp into clinic time, such as `11/15/2026, 2:41 PM ET`. */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  const text = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${text} ET`;
}

// A report puts thousands of timestamps on the clinic's calendar, so each formatter is built once.
const formatters = new Map<string, Intl.DateTimeFormat>();

function clinicParts(at: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const key = JSON.stringify(options);
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone: CLINIC_TIME_ZONE, ...options });
    formatters.set(key, formatter);
  }
  return Object.fromEntries(formatter.formatToParts(at).map((part) => [part.type, part.value]));
}

/** The clinic's calendar date at a moment, as `YYYY-MM-DD`. */
export function clinicDate(at: Date = new Date()): string {
  const { year, month, day } = clinicParts(at, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${year}-${month}-${day}`;
}

/** The calendar date a number of days after (or, with a negative number, before) a `YYYY-MM-DD` date. */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from one `YYYY-MM-DD` date to another. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS);
}

/** Parts of a `YYYY-MM-DD` date, which is a calendar date and not a moment, so no time zone applies. */
function dateParts(date: string, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).formatToParts(
    new Date(`${date}T12:00:00Z`),
  );
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

/** A `YYYY-MM-DD` date as `Nov 9, 2026`, or `Nov 9` without the year. */
export function formatDay(date: string, withYear = true): string {
  const { month, day, year } = dateParts(date, { month: "short", day: "numeric", year: "numeric" });
  return withYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

/** Two `YYYY-MM-DD` dates as `Nov 9 to Nov 15, 2026`. One day reads `Nov 15, 2026`. */
export function formatDayRange(from: string, to: string): string {
  if (from === to) return formatDay(to);
  return `${formatDay(from, from.slice(0, 4) !== to.slice(0, 4))} to ${formatDay(to)}`;
}

/** A `YYYY-MM-DD` date as a heading: `Today`, `Yesterday`, or `Saturday, Nov 14`. Other years show the year. */
export function formatDayHeading(date: string, now: Date = new Date()): string {
  const today = clinicDate(now);
  if (date === today) return "Today";
  if (date === addDays(today, -1)) return "Yesterday";
  const { weekday, month, day, year } = dateParts(date, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${weekday}, ${month} ${day}${year === today.slice(0, 4) ? "" : `, ${year}`}`;
}

/** A timestamp as `8:30 AM` in clinic time. */
export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  const { hour, minute, dayPeriod } = clinicParts(date, { hour: "numeric", minute: "2-digit" });
  return `${hour}:${minute} ${dayPeriod}`;
}

/**
 * A timestamp as the time on the clinic's clock, for a spreadsheet. Spreadsheets
 * have no time zones and read a date's UTC fields, so the clinic's time is put there.
 */
export function clinicWallClock(isoTimestamp: string): Date | null {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return null;
  const { year, month, day, hour, minute, second } = clinicParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
}

/** A timestamp as `Nov 14` in clinic time. */
export function formatShortDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  const { month, day } = clinicParts(date, { month: "short", day: "numeric" });
  return `${month} ${day}`;
}

/** A timestamp as `Today, 8:30 AM` or `Nov 14, 9:40 AM` in clinic time. Other years show the year. */
export function formatStamp(isoTimestamp: string, now: Date = new Date()): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  const { hour, minute, dayPeriod } = clinicParts(date, { hour: "numeric", minute: "2-digit" });
  const day = clinicDate(date);
  const today = clinicDate(now);
  const label =
    day === today
      ? "Today"
      : day.slice(0, 4) === today.slice(0, 4)
        ? formatShortDate(isoTimestamp)
        : `${formatShortDate(isoTimestamp)}, ${day.slice(0, 4)}`;
  return `${label}, ${hour}:${minute} ${dayPeriod}`;
}

/** Today in clinic time, as `Sunday, Nov 15`. */
export function formatToday(now: Date = new Date()): string {
  const { weekday, month, day } = clinicParts(now, { weekday: "long", month: "short", day: "numeric" });
  return `${weekday}, ${month} ${day}`;
}

/** Whole clinic calendar days from a timestamp until now. */
export function daysSince(isoTimestamp: string, now: Date = new Date()): number {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.round((Date.parse(clinicDate(now)) - Date.parse(clinicDate(date))) / DAY_MS);
}

/** The moment a clinic calendar date (`YYYY-MM-DD`) begins. */
export function clinicMidnight(date: string): Date {
  // Midnight Eastern is 05:00 UTC in winter and 04:00 UTC in summer.
  const winter = new Date(`${date}T05:00:00Z`);
  const { hour } = clinicParts(winter, { hour: "2-digit", hourCycle: "h23" });
  return Number(hour) === 1 ? new Date(winter.getTime() - HOUR_MS) : winter;
}

/** When today began at the clinic. */
export function clinicDayStart(now: Date = new Date()): Date {
  return clinicMidnight(clinicDate(now));
}

/** When this week began at the clinic: the most recent Monday at midnight. */
export function clinicWeekStart(now: Date = new Date()): Date {
  const noon = new Date(`${clinicDate(now)}T12:00:00Z`);
  const daysAfterMonday = (noon.getUTCDay() + 6) % 7;
  return clinicMidnight(new Date(noon.getTime() - daysAfterMonday * DAY_MS).toISOString().slice(0, 10));
}
