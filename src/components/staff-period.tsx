import Link from "next/link";
import type { ReactNode } from "react";
import { plainLink, skin } from "@/components/staff-ui";
import { clinicDate } from "@/lib/staff/format";
import { PRESETS, type Period } from "@/lib/staff/periods";

/*
 * The date filter on Reports and Activity: a row of ready-made periods, then a
 * form for choosing dates. It needs no script. The period travels in the
 * page's address, so a filtered page can be bookmarked or sent to someone.
 */

const pill = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150 ease-out max-md:py-2 ${plainLink} ${
    active
      ? "border-ink bg-ink text-white hover:text-white"
      : "border-line bg-white text-ink hover:border-field hover:text-ink"
  }`;

export function PeriodFilter({
  path,
  period,
  allDates = false,
  keep = {},
  problem,
  children,
}: {
  /** The page the filter is on, such as `/staff/reports`. */
  path: string;
  /** The period being shown. Null means all dates. */
  period: Period | null;
  /** Offer "All dates" as the first choice. */
  allDates?: boolean;
  /** The page's other filters, kept when a ready-made period is picked. */
  keep?: Record<string, string>;
  /** What was wrong with the dates last chosen, if they couldn't be used. */
  problem: string | null;
  /** More fields for the form, such as the activity page's account box. */
  children?: ReactNode;
}) {
  const today = clinicDate();
  const chosen = period && !period.preset ? period : null;
  const href = (params: Record<string, string>) => {
    const query = new URLSearchParams({ ...keep, ...params }).toString();
    return query ? `${path}?${query}` : path;
  };

  return (
    <div>
      <nav aria-label="Period" className="flex flex-wrap gap-1.5">
        {allDates ? (
          <Link href={href({})} aria-current={period ? undefined : "true"} className={pill(!period)}>
            All dates
          </Link>
        ) : null}
        {PRESETS.map((preset) => {
          const active = period?.preset === preset.id;
          return (
            <Link
              key={preset.id}
              href={href({ period: preset.id })}
              aria-current={active ? "true" : undefined}
              className={pill(active)}
            >
              {preset.label}
            </Link>
          );
        })}
      </nav>

      {/* The key gives the boxes their new starting values when the filters change. */}
      <form
        key={JSON.stringify([period?.from, period?.to, keep])}
        action={path}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        {/* Dates typed below win over this. Without them, the ready-made period stays. */}
        {period?.preset ? <input type="hidden" name="period" value={period.preset} /> : null}
        <label className={`${skin.label} w-[calc(50%-6px)] sm:w-[158px]`}>
          {chosen ? "From" : "Or from"}
          <input type="date" name="from" defaultValue={chosen?.from ?? ""} max={today} className={skin.input} />
        </label>
        <label className={`${skin.label} w-[calc(50%-6px)] sm:w-[158px]`}>
          To
          <input type="date" name="to" defaultValue={chosen?.to ?? ""} max={today} className={skin.input} />
        </label>
        {children}
        <button type="submit" className={skin.primary}>
          Show
        </button>
      </form>

      {problem ? (
        <p role="alert" className="mt-3 text-[14px] font-semibold text-brand-dark">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
