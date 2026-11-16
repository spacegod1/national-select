import Link from "next/link";
import type { ReactNode } from "react";
import { PeriodFilter } from "@/components/staff-period";
import { ART, CHARGE_STATUS, Chip, DownloadLink, PageHead, Stat, StaffPage, skin } from "@/components/staff-ui";
import { formatDollars, formatStamp } from "@/lib/staff/format";
import { choosePeriod, periodParams, presetPeriod } from "@/lib/staff/periods";
import {
  REPORT_ROW_LIMIT,
  getPeriodReport,
  reportBuckets,
  reportTotals,
  type PeriodReport,
  type ReportBucket,
} from "@/lib/staff/reports";
import { requireAdmin } from "@/lib/staff/session";

/** Each list on the page shows this many of its newest rows. The download has them all. */
const ROWS_SHOWN = 50;
/** About this many bars get a date under them, so the dates don't run into each other. */
const BAR_LABELS = 8;

const plural = (count: number, one: string, many: string) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;

export default async function StaffReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[]; from?: string | string[]; to?: string | string[] }>;
}) {
  await requireAdmin();

  const choice = choosePeriod(await searchParams, "week");
  const period = choice.period ?? presetPeriod("week");

  let report: PeriodReport | null = null;
  try {
    report = await getPeriodReport(period);
  } catch (error) {
    console.error("Staff: loading a report failed", error);
  }

  return (
    <StaffPage>
      <PageHead
        art={ART.reports}
        title="Reports"
        lead="What was charged and what was paid over any dates you choose, with a download for Excel."
      />

      <div className="mt-6">
        <PeriodFilter path="/staff/reports" period={period} problem={choice.problem} />
      </div>

      {report === null ? (
        <p role="alert" className={`${skin.alert} mt-6`}>
          The patient database didn&apos;t respond, so this report can&apos;t be shown right now.
        </p>
      ) : (
        <Report
          report={report}
          title={period.name}
          dates={`${period.dates} · ${plural(period.days, "day", "days")}`}
          download={`/staff/export/report?${new URLSearchParams(periodParams(period))}`}
          chart={reportBuckets(period, report)}
        />
      )}
    </StaffPage>
  );
}

function Report({
  report,
  title,
  dates,
  download,
  chart,
}: {
  report: PeriodReport;
  title: string;
  dates: string;
  download: string;
  chart: { size: "day" | "week" | "month"; buckets: ReportBucket[] };
}) {
  const totals = reportTotals(report);
  const { charges, payments } = report;

  return (
    <>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="font-display text-[22px] font-extrabold leading-[1.15] tracking-[-.025em]">{title}</h2>
          <p className={skin.meta}>{dates}</p>
        </div>
        <DownloadLink href={download}>Download for Excel</DownloadLink>
      </div>

      {report.cutOff ? (
        <p role="alert" className={`${skin.alert} mt-4`}>
          These dates hold more than {REPORT_ROW_LIMIT.toLocaleString("en-US")} charges or payments, so the figures
          below only count the newest {REPORT_ROW_LIMIT.toLocaleString("en-US")} of each. Choose fewer days for
          complete figures.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon="receipt"
          tint="bg-pink text-brand-dark"
          label="Charged"
          value={formatDollars(totals.chargedCents)}
          note={`${plural(totals.chargeCount, "charge", "charges")} posted`}
        />
        <Stat
          icon="card"
          tint="bg-[#e2f1e7] text-[#22693a]"
          label="Paid online"
          value={formatDollars(totals.paidCents)}
          note={`${plural(totals.paymentCount, "payment", "payments")} received`}
        />
        <Stat
          icon="activity"
          tint="bg-line-soft text-muted"
          label="Voided"
          value={formatDollars(totals.voidedCents)}
          note={`${plural(totals.voidCount, "charge", "charges")} posted, then voided`}
        />
        <Stat
          icon="plus"
          tint="bg-panel text-ink"
          label="New patients"
          value={report.newAccounts.toLocaleString("en-US")}
          note="Accounts opened"
        />
      </div>

      <Chart size={chart.size} buckets={chart.buckets} />

      <Records
        heading="Charges posted"
        shown={Math.min(charges.length, ROWS_SHOWN)}
        total={charges.length}
        empty="No charges were posted on these dates."
      >
        {charges.slice(0, ROWS_SHOWN).map((charge) => (
          <li key={charge.id} className={`${skin.row} flex flex-wrap items-center gap-x-4 gap-y-1`}>
            <span className={`${skin.meta} w-[128px] tabular-nums`}>{formatStamp(charge.createdAt)}</span>
            <span className="min-w-0 flex-1 basis-[220px]">
              <span className="block break-words">{charge.description}</span>
              <Patient name={charge.patientName} accountNumber={charge.accountId} />
            </span>
            <Chip tone={CHARGE_STATUS[charge.status].chip}>{CHARGE_STATUS[charge.status].label}</Chip>
            <span
              className={`ml-auto w-[92px] text-right tabular-nums ${
                charge.status === "void" ? "text-muted line-through" : "font-semibold"
              }`}
            >
              {formatDollars(charge.amountCents)}
            </span>
          </li>
        ))}
      </Records>

      <Records
        heading="Payments received"
        shown={Math.min(payments.length, ROWS_SHOWN)}
        total={payments.length}
        empty="No payments were received on these dates."
      >
        {payments.slice(0, ROWS_SHOWN).map((payment) => (
          <li key={payment.id} className={`${skin.row} flex flex-wrap items-center gap-x-4 gap-y-1`}>
            <span className={`${skin.meta} w-[128px] tabular-nums`}>{formatStamp(payment.paidAt)}</span>
            <span className="min-w-0 flex-1 basis-[220px]">
              <span className="block">Paid online</span>
              <Patient name={payment.patientName} accountNumber={payment.accountId} />
            </span>
            <span className="ml-auto w-[92px] text-right font-semibold tabular-nums">
              {formatDollars(payment.amountCents)}
            </span>
          </li>
        ))}
      </Records>

      <section className="mt-8">
        <h2 className={skin.heading}>More downloads</h2>
        <div className={`${skin.card} mt-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3`}>
          <p className="min-w-0 flex-1 basis-[240px]">
            <span className="block font-semibold">All patient accounts</span>
            <span className={skin.meta}>
              Every account with its balance and contact details, whatever dates are chosen above.
            </span>
          </p>
          <DownloadLink href="/staff/export/accounts">Download for Excel</DownloadLink>
        </div>
        <p className={`${skin.meta} mt-3`}>
          Each download is written to the activity log under your name. The files hold patient information, so keep
          and share them only as clinic policy allows.
        </p>
      </section>
    </>
  );
}

function Patient({ name, accountNumber }: { name: string; accountNumber: string }) {
  return (
    <span className={`${skin.meta} block`}>
      {name || "Unknown patient"} <span aria-hidden="true">·</span>{" "}
      {/* No prefetch: loading an account page logs it as opened. */}
      <Link href={`/staff/accounts/${accountNumber}`} prefetch={false} className={skin.code}>
        {accountNumber}
      </Link>
    </span>
  );
}

function Records({
  heading,
  shown,
  total,
  empty,
  children,
}: {
  heading: string;
  shown: number;
  total: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className={skin.heading}>
        {heading} <span className="font-normal text-muted">({total.toLocaleString("en-US")})</span>
      </h2>
      {total === 0 ? (
        <p className={`${skin.card} mt-2.5 text-muted`}>{empty}</p>
      ) : (
        <ul className={`${skin.list} mt-2.5`}>{children}</ul>
      )}
      {total > shown ? (
        <p className={`${skin.meta} mt-3`}>
          Showing the newest {shown} of {total.toLocaleString("en-US")}. The Excel download has them all.
        </p>
      ) : null}
    </section>
  );
}

function Legend({ swatch, children }: { swatch: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-[3px] ${swatch}`} />
      {children}
    </span>
  );
}

/** Two bars for each day, week or month: what was charged, and what was paid. */
function Chart({ size, buckets }: { size: "day" | "week" | "month"; buckets: ReportBucket[] }) {
  const peak = Math.max(0, ...buckets.map((bucket) => Math.max(bucket.chargedCents, bucket.paidCents)));
  const heading = size === "day" ? "Day by day" : size === "week" ? "Week by week" : "Month by month";

  if (peak === 0) {
    return <p className={`${skin.card} mt-6 text-muted`}>Nothing was charged or paid on these dates.</p>;
  }

  const labelEvery = Math.ceil(buckets.length / BAR_LABELS);
  // A bar for a small amount is still tall enough to see.
  const height = (cents: number) => (cents === 0 ? "0%" : `${Math.max((cents / peak) * 100, 2)}%`);

  return (
    <figure className={`${skin.card} mt-6`}>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5">
        <span className={skin.heading}>{heading}</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted">
          <Legend swatch="bg-ink">Charged</Legend>
          <Legend swatch="bg-open">Paid</Legend>
          <span>Tallest bar: {formatDollars(peak)}</span>
        </span>
      </figcaption>

      {/* The bars are for the eye. The table underneath says the same thing to a screen reader. */}
      <div aria-hidden="true" className="mt-4">
        <div className="flex h-[168px] items-end gap-[3px] border-b border-line">
          {buckets.map((bucket) => (
            <div
              key={bucket.key}
              title={`${size === "week" ? "Week of " : ""}${bucket.label}: ${formatDollars(bucket.chargedCents)} charged, ${formatDollars(bucket.paidCents)} paid`}
              className="flex h-full min-w-0 flex-1 items-end justify-center gap-px"
            >
              <span className="w-1/2 max-w-[16px] rounded-t-[3px] bg-ink" style={{ height: height(bucket.chargedCents) }} />
              <span className="w-1/2 max-w-[16px] rounded-t-[3px] bg-open" style={{ height: height(bucket.paidCents) }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-[3px] text-[11px] text-muted">
          {buckets.map((bucket, index) => (
            <span key={bucket.key} className="flex min-w-0 flex-1 justify-center">
              <span className="whitespace-nowrap">{index % labelEvery === 0 ? bucket.label : ""}</span>
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>What was charged and paid, {heading.toLowerCase()}</caption>
        <thead>
          <tr>
            <th scope="col">{size === "day" ? "Day" : size === "week" ? "Week of" : "Month"}</th>
            <th scope="col">Charged</th>
            <th scope="col">Paid</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr key={bucket.key}>
              <th scope="row">{bucket.label}</th>
              <td>{formatDollars(bucket.chargedCents)}</td>
              <td>{formatDollars(bucket.paidCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
