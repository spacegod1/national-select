import type { ReactNode } from "react";
import { AccountBook, AccountColumn, type AccountRow } from "@/components/staff-accounts";
import { ART, Photo, bleed, gutter } from "@/components/staff-ui";
import { formatDollars, formatToday } from "@/lib/staff/format";
import { ACCOUNT_LIST_LIMIT, type AccountsOverview } from "@/lib/staff/records";

/**
 * The accounts screen, with or without an account open.
 *
 * Tablets and larger screens get the list as a column with `pane` beside it.
 * Phones get the list as the page, with `sheet` under the open account's line.
 * The two are different enough to be drawn separately; only one is ever shown.
 */
export function AccountsWorkspace({
  overview,
  open,
  pane,
  sheet,
}: {
  overview: AccountsOverview;
  /** The account that is open, if one is. */
  open?: AccountRow;
  pane: ReactNode;
  sheet?: ReactNode;
}) {
  const rows: AccountRow[] = overview.accounts.map(({ accountNumber, patientName, balanceCents }) => ({
    accountNumber,
    patientName,
    balanceCents,
  }));
  // An account too old for the list is still listed while it is open.
  if (open && !rows.some((row) => row.accountNumber === open.accountNumber)) rows.unshift(open);

  return (
    <>
      <div className="hidden min-h-0 flex-1 md:flex">
        <section
          aria-label="Patient accounts"
          className="flex min-h-0 w-[300px] flex-none flex-col border-r border-line lg:w-[340px]"
        >
          <AccountColumn
            rows={rows}
            selected={open?.accountNumber ?? null}
            outstandingCents={overview.outstandingCents}
            owingAccounts={overview.owingAccounts}
            totalAccounts={overview.totalAccounts}
            listLimit={ACCOUNT_LIST_LIMIT}
          />
        </section>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-mist">{pane}</main>
      </div>

      <main className={`pb-12 md:hidden ${gutter}`}>
        <BookHero overview={overview} />
        <AccountBook rows={rows} expanded={open?.accountNumber ?? null} listLimit={ACCOUNT_LIST_LIMIT}>
          {sheet}
        </AccountBook>
      </main>
    </>
  );
}

/** The top of the phone's accounts page: the number that matters, over the front desk. */
function BookHero({ overview }: { overview: AccountsOverview }) {
  const { totalAccounts, owingAccounts, chargesToday } = overview;
  const settled = totalAccounts - owingAccounts;

  return (
    <div className={`relative isolate overflow-hidden bg-ink text-white ${bleed}`}>
      <div className="absolute inset-x-0 top-0 -z-20 h-[176px]">
        <Photo src={ART.home.src} position={ART.home.position} sizes="100vw" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(27,42,74,.34)_0px,rgba(27,42,74,.82)_96px,#1b2a4a_176px)]"
      />
      <div className="px-[clamp(16px,4vw,40px)] pb-6 pt-[104px]">
        <div className="font-mono text-[11.5px] uppercase tracking-[.12em] text-coral">Ledger · {formatToday()}</div>
        <h1 className="mt-2.5 font-display text-[clamp(30px,8.4vw,44px)] font-extrabold leading-[1.02] tracking-[-.04em]">
          {totalAccounts === 0 ? (
            "No patient accounts yet."
          ) : owingAccounts === 0 ? (
            "Every account is settled."
          ) : (
            <>
              <span className="tabular-nums text-coral">{formatDollars(overview.outstandingCents)}</span> outstanding
              across {owingAccounts === 1 ? "1 account" : `${owingAccounts} accounts`}.
            </>
          )}
        </h1>
        <p className="mt-3 text-[15px] leading-[1.5] text-cloud">
          {formatDollars(overview.paidThisWeekCents)} paid online this week ·{" "}
          {chargesToday === 1 ? "1 charge" : `${chargesToday} charges`} posted today
        </p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
          <div
            className="h-full rounded-full bg-open"
            style={{ width: `${totalAccounts ? (settled / totalAccounts) * 100 : 0}%` }}
          />
        </div>
        <div className="mt-2 font-mono text-[11.5px] uppercase tracking-[.08em] text-cloud-soft">
          {settled} of {totalAccounts} accounts settled
        </div>
      </div>
    </div>
  );
}
