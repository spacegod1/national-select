import Link from "next/link";
import { AccountsWorkspace } from "@/components/staff-workspace";
import { ART, Avatar, Photo, Stat, StaffAlertPage, gutter, plainLink, skin } from "@/components/staff-ui";
import { AUDIT_LABELS, listAudit, type AuditEntry } from "@/lib/audit";
import { daysSince, formatDollars, formatShortDate, formatStamp, formatToday } from "@/lib/staff/format";
import { getAccountsOverview, type AccountsOverview } from "@/lib/staff/records";
import { requireStaff } from "@/lib/staff/session";

/** The welcome pane shows this many of the newest activity entries. */
const LATEST_ACTIVITY_COUNT = 5;

export default async function StaffAccountsPage() {
  const user = await requireStaff();
  const admin = user.role === "admin";

  let overview: AccountsOverview;
  // Only admins read the activity log.
  let latest: AuditEntry[] | null = null;
  try {
    [overview, latest] = await Promise.all([
      getAccountsOverview({ owingLongest: true }),
      admin ? listAudit({}, LATEST_ACTIVITY_COUNT) : null,
    ]);
  } catch (error) {
    console.error("Staff: loading the accounts screen failed", error);
    return (
      <StaffAlertPage>
        The patient database didn&apos;t respond, so accounts can&apos;t be shown right now.
      </StaffAlertPage>
    );
  }

  return (
    <AccountsWorkspace
      overview={overview}
      pane={<Welcome firstName={user.name.trim().split(/\s+/)[0]} overview={overview} latest={latest} />}
    />
  );
}

function owingFor(days: number): string {
  if (days <= 0) return "Posted today";
  return days === 1 ? "Since yesterday" : `Owing for ${days} days`;
}

/** What the pane beside the list shows until a patient is picked. Tablets and larger only. */
function Welcome({
  firstName,
  overview,
  latest,
}: {
  firstName: string;
  overview: AccountsOverview;
  /** The newest activity, or null for someone who doesn't read the activity log. */
  latest: AuditEntry[] | null;
}) {
  const nameOf = (accountNumber: string) =>
    overview.accounts.find((account) => account.accountNumber === accountNumber)?.patientName ?? accountNumber;
  const heading = "font-display text-[17px] font-extrabold tracking-[-.02em]";

  return (
    <div className="staff-entry-rise @container pb-10">
      <div className="relative isolate overflow-hidden bg-ink text-white">
        <Photo
          src={ART.home.src}
          sizes="(min-width: 1024px) 75vw, 60vw"
          className="-z-20 object-[50%_72%] @2xl:object-[50%_55%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(27,42,74,.97)_0%,rgba(27,42,74,.86)_42%,rgba(27,42,74,.38)_100%)]"
        />
        <div className={`pb-[72px] pt-9 @2xl:pt-12 ${gutter}`}>
          <div className="font-mono text-[11.5px] uppercase tracking-[.12em] text-coral">{formatToday()}</div>
          <h2 className="mt-2 font-display text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.05] tracking-[-.035em]">
            Welcome back, {firstName}.
          </h2>
          <p className="mt-2 max-w-[400px] text-[15px] leading-[1.5] text-cloud">
            Pick a patient on the left to post a charge or check a balance.
          </p>
        </div>
      </div>

      <div className={`relative -mt-11 grid gap-3 @2xl:grid-cols-3 ${gutter}`}>
        <Stat
          icon="receipt"
          tint="bg-pink text-brand-dark"
          label="Outstanding"
          value={formatDollars(overview.outstandingCents)}
          note={`Across ${overview.owingAccounts} of ${overview.totalAccounts} accounts`}
        />
        <Stat
          icon="card"
          tint="bg-[#e2f1e7] text-[#22693a]"
          label="Paid online this week"
          value={formatDollars(overview.paidThisWeekCents)}
          note={`Since Monday, ${formatShortDate(overview.weekStart)}`}
        />
        <Stat
          icon="activity"
          tint="bg-panel text-ink"
          label="Charges posted today"
          value={overview.chargesToday}
          note="Voided charges aren't counted"
        />
      </div>
      {latest ? (
        <p className={`mt-3 text-right ${gutter}`}>
          <Link href="/staff/reports" className={skin.quiet}>
            See other dates in Reports
          </Link>
        </p>
      ) : null}

      <div className={`mt-7 grid gap-x-8 gap-y-7 @3xl:grid-cols-2 ${gutter}`}>
        <section>
          <h3 className={heading}>Owing the longest</h3>
          {overview.owingLongest.length === 0 ? (
            <p className="mt-2 text-muted">
              {overview.totalAccounts === 0 ? "No patient accounts yet." : "Every account is paid up."}
            </p>
          ) : (
            <ul className={`${skin.list} mt-2.5`}>
              {overview.owingLongest.map((account) => {
                const days = daysSince(account.since);
                return (
                  <li key={account.accountNumber} className="border-b border-line-soft last:border-0">
                    {/* No prefetch: loading an account page logs it as opened. */}
                    <Link
                      href={`/staff/accounts/${account.accountNumber}`}
                      prefetch={false}
                      className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-ink transition-colors duration-150 ease-out hover:bg-mist/60 hover:text-ink ${plainLink}`}
                    >
                      <Avatar name={account.patientName} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{account.patientName}</span>
                        <span
                          className={`block text-[12.5px] ${days >= 14 ? "font-semibold text-brand-dark" : "text-muted"}`}
                        >
                          {owingFor(days)}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">{formatDollars(account.balanceCents)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {latest ? (
          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className={heading}>Latest activity</h3>
              <Link href="/staff/audit" className={skin.quiet}>
                See all
              </Link>
            </div>
            {latest.length === 0 ? (
              <p className="mt-2 text-muted">No activity recorded yet.</p>
            ) : (
              <ul className="mt-2.5">
                {latest.map((entry) => (
                  <li key={entry.id} className="group relative flex gap-3 pb-3.5 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[3.5px] top-[14px] w-px bg-line group-last:hidden"
                    />
                    <span
                      aria-hidden="true"
                      className="relative mt-[6px] h-2 w-2 flex-none rounded-full bg-coral ring-[3px] ring-mist"
                    />
                    <span className="min-w-0">
                      <span className="block">
                        <span className="font-semibold">
                          {/* A first name for staff. "Online payment" and "Not signed in" stay whole. */}
                          {entry.actorId ? entry.actorName.trim().split(/\s+/)[0] : entry.actorName}
                        </span>{" "}
                        <span className="text-muted">·</span> {AUDIT_LABELS[entry.action] ?? entry.action}
                      </span>
                      <span className="block text-[12.5px] text-muted">
                        {formatStamp(entry.at)}
                        {entry.accountNumber ? ` · ${nameOf(entry.accountNumber)}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
