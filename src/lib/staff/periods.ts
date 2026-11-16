import { addDays, clinicDate, clinicMidnight, daysBetween, formatDayRange } from "@/lib/staff/format";

/*
 * The spans of clinic days that Reports and Activity can be narrowed to.
 * A page's address carries either `?period=week` or `?from=2026-11-01&to=2026-11-15`.
 */

export const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "This week" },
  { id: "last-week", label: "Last week" },
  { id: "month", label: "This month" },
  { id: "last-month", label: "Last month" },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"];

/** The longest span someone can choose, so one page never reads years of records. */
export const MAX_PERIOD_DAYS = 366;

export type Period = {
  /** Null when the person chose the dates themselves. */
  preset: PresetId | null;
  /** The first and last clinic dates, both included, as `YYYY-MM-DD`. */
  from: string;
  to: string;
  /** The same span as moments: from `startIso` up to, but not including, `endIso`. */
  startIso: string;
  endIso: string;
  /** `This week`, or `Chosen dates`. */
  name: string;
  /** `Nov 9 to Nov 15, 2026`. */
  dates: string;
  days: number;
};

export type PeriodChoice = {
  /** Null means all time. */
  period: Period | null;
  /** What was wrong with the dates in the address, if they couldn't be used. */
  problem: string | null;
};

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function span(preset: PresetId | null, name: string, from: string, to: string): Period {
  return {
    preset,
    from,
    to,
    startIso: clinicMidnight(from).toISOString(),
    endIso: clinicMidnight(addDays(to, 1)).toISOString(),
    name,
    dates: formatDayRange(from, to),
    days: daysBetween(from, to) + 1,
  };
}

/** The clinic dates a preset covers. Spans that include today end today. */
export function presetPeriod(id: PresetId, now: Date = new Date()): Period {
  const today = clinicDate(now);
  const daysAfterMonday = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const monday = addDays(today, -daysAfterMonday);
  const firstOfMonth = `${today.slice(0, 8)}01`;
  const name = PRESETS.find((preset) => preset.id === id)?.label ?? id;

  switch (id) {
    case "today":
      return span(id, name, today, today);
    case "yesterday":
      return span(id, name, addDays(today, -1), addDays(today, -1));
    case "week":
      return span(id, name, monday, today);
    case "last-week":
      return span(id, name, addDays(monday, -7), addDays(monday, -1));
    case "month":
      return span(id, name, firstOfMonth, today);
    case "last-month": {
      const lastOfPrevious = addDays(firstOfMonth, -1);
      return span(id, name, `${lastOfPrevious.slice(0, 8)}01`, lastOfPrevious);
    }
  }
}

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * Reads the period from a page's search params. Chosen dates win over a preset.
 * With neither, or with dates that can't be used, the answer is `fallback`:
 * a preset, or null for all time.
 */
export function choosePeriod(
  params: { period?: unknown; from?: unknown; to?: unknown },
  fallback: PresetId | null,
  now: Date = new Date(),
): PeriodChoice {
  const usual = fallback ? presetPeriod(fallback, now) : null;
  const today = clinicDate(now);
  const typedFrom = text(params.from);
  const typedTo = text(params.to);

  if (typedFrom || typedTo) {
    // One date alone means that day onwards, or that single day.
    const from = typedFrom || typedTo;
    const to = typedTo || (typedFrom > today ? typedFrom : today);
    if (!isRealDate(from) || !isRealDate(to)) return { period: usual, problem: "Those dates can't be read." };
    if (from > to) return { period: usual, problem: "The first date is after the last date." };
    if (daysBetween(from, to) + 1 > MAX_PERIOD_DAYS) {
      return { period: usual, problem: `Choose ${MAX_PERIOD_DAYS} days or fewer.` };
    }
    return { period: span(null, "Chosen dates", from, to), problem: null };
  }

  const preset = PRESETS.find((item) => item.id === text(params.period));
  return { period: preset ? presetPeriod(preset.id, now) : usual, problem: null };
}

/** The search params that lead back to a period. All time has none. */
export function periodParams(period: Period | null): Record<string, string> {
  if (!period) return {};
  return period.preset ? { period: period.preset } : { from: period.from, to: period.to };
}
