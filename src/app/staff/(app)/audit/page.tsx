import Link from "next/link";
import { PeriodFilter } from "@/components/staff-period";
import { ART, DownloadLink, PageHead, StaffPage, plainLink, skin } from "@/components/staff-ui";
import { AUDIT_GROUPS, AUDIT_LABELS, AUDIT_LIST_LIMIT, listAudit, type AuditEntry } from "@/lib/audit";
import { activityFilter, activityParams, describeActivityQuery, readActivityQuery } from "@/lib/staff/activity";
import { clinicDate, formatDayHeading, formatTime } from "@/lib/staff/format";
import { requireAdmin } from "@/lib/staff/session";

type Day = { date: string; entries: AuditEntry[] };

const countOf = (entries: number) => (entries === 1 ? "1 entry" : `${entries} entries`);

/** Entries arrive newest first. This keeps that order and starts a new group at each clinic day. */
function byDay(entries: AuditEntry[]): Day[] {
  const days: Day[] = [];
  for (const entry of entries) {
    const date = clinicDate(new Date(entry.at));
    const last = days[days.length - 1];
    if (last?.date === date) last.entries.push(entry);
    else days.push({ date, entries: [entry] });
  }
  return days;
}

export default async function StaffAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const query = readActivityQuery(await searchParams);
  const badAccount = Boolean(query.typedAccount) && !query.accountNumber;
  const params = activityParams(query);
  const narrowed = Object.keys(params).length > 0;

  let entries: AuditEntry[] | null = null;
  if (!badAccount) {
    try {
      entries = await listAudit(activityFilter(query));
    } catch (error) {
      console.error("Staff: loading the activity log failed", error);
    }
  }

  // How many of the entries shown are of each kind, to jump to one kind.
  const kinds = AUDIT_GROUPS.map((group) => ({
    group,
    count: (entries ?? []).filter((entry) => (group.actions as readonly string[]).includes(entry.action)).length,
  })).filter((kind) => kind.count > 0);

  return (
    <StaffPage>
      <PageHead
        art={ART.activity}
        title="Activity"
        lead="Who signed in, which patient accounts they opened, and what they changed. Entries are never edited or deleted."
      />

      <div className="mt-6">
        <PeriodFilter
          path="/staff/audit"
          period={query.period}
          allDates
          keep={{
            ...(query.typedAccount ? { account: query.typedAccount } : {}),
            ...(query.group ? { kind: query.group.id } : {}),
          }}
          problem={query.problem}
        >
          <label className={`${skin.label} min-w-[190px] flex-1 sm:max-w-[230px]`}>
            One account
            <input
              type="search"
              name="account"
              defaultValue={query.typedAccount}
              placeholder="e.g. NS-630462"
              autoComplete="off"
              className={skin.input}
            />
          </label>
          <label className={`${skin.label} min-w-[190px] flex-1 sm:max-w-[230px]`}>
            Kind of activity
            <select name="kind" defaultValue={query.group?.id ?? ""} className={skin.input}>
              <option value="">Everything</option>
              {AUDIT_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </label>
        </PeriodFilter>
      </div>

      {badAccount ? (
        <p className={`${skin.card} mt-6 text-muted`}>“{query.typedAccount}” isn&apos;t an account number.</p>
      ) : entries === null ? (
        <p role="alert" className={`${skin.alert} mt-6`}>
          The staff database didn&apos;t respond, so activity can&apos;t be shown right now.
        </p>
      ) : (
        <>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 className="font-display text-[22px] font-extrabold leading-[1.15] tracking-[-.025em]">
                {entries.length === AUDIT_LIST_LIMIT ? `Newest ${AUDIT_LIST_LIMIT} entries` : countOf(entries.length)}
              </h2>
              <p className={skin.meta}>
                Showing {describeActivityQuery(query)}.{" "}
                {narrowed ? (
                  <Link href="/staff/audit" className="font-semibold">
                    Show everything
                  </Link>
                ) : null}
              </p>
            </div>
            {entries.length > 0 ? (
              <DownloadLink href={`/staff/export/activity?${new URLSearchParams(params)}`}>
                Download for Excel
              </DownloadLink>
            ) : null}
          </div>

          {entries.length === AUDIT_LIST_LIMIT ? (
            <p className={`${skin.meta} mt-3`}>
              There may be older entries that match. Choose fewer days to see them here, or download the Excel file,
              which has them all.
            </p>
          ) : null}

          {!query.group && kinds.length > 1 ? (
            <nav aria-label="Kinds of activity shown" className="mt-4 flex flex-wrap gap-1.5">
              {kinds.map(({ group, count }) => (
                <Link
                  key={group.id}
                  href={`/staff/audit?${new URLSearchParams({ ...params, kind: group.id })}`}
                  className={`rounded-full bg-panel px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-slate-chip hover:text-ink max-md:py-2 ${plainLink}`}
                >
                  {group.label} <span className="font-normal text-muted">{count}</span>
                </Link>
              ))}
            </nav>
          ) : null}

          {entries.length === 0 ? (
            <p className={`${skin.card} mt-5 text-muted`}>
              {narrowed ? "No activity matches these filters." : "No activity recorded yet."}
            </p>
          ) : (
            byDay(entries).map((day) => (
              <section key={day.date} className="mt-6">
                <h3 className="flex items-baseline justify-between gap-4">
                  <span className={skin.heading}>{formatDayHeading(day.date)}</span>
                  <span className={skin.meta}>{countOf(day.entries.length)}</span>
                </h3>
                <ul className={`${skin.list} mt-2`}>
                  {day.entries.map((entry) => (
                    <li
                      key={entry.id}
                      className={`${skin.row} grid gap-x-4 gap-y-0.5 md:grid-cols-[78px_minmax(0,1fr)_auto] md:items-baseline`}
                    >
                      <span className={`${skin.meta} tabular-nums`}>{formatTime(entry.at)}</span>
                      <span className="min-w-0">
                        <span className="font-semibold">{entry.actorName}</span>{" "}
                        <span className="text-muted">·</span> {AUDIT_LABELS[entry.action] ?? entry.action}
                        {entry.detail ? <span className={`${skin.meta} block break-words`}>{entry.detail}</span> : null}
                      </span>
                      {entry.accountNumber ? (
                        // No prefetch: loading an account page logs it as opened.
                        <Link
                          href={`/staff/accounts/${entry.accountNumber}`}
                          prefetch={false}
                          className={`${skin.code} justify-self-start md:justify-self-end`}
                        >
                          {entry.accountNumber}
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </>
      )}
    </StaffPage>
  );
}
