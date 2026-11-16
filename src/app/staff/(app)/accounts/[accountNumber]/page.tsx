import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountWorkbench, ChargeForm, VoidCharge, type RecordTab } from "@/components/staff-forms";
import { AccountsWorkspace } from "@/components/staff-workspace";
import { CHARGE_STATUS, Avatar, Chip, DownloadLink, Icon, StaffAlertPage, gutter, skin } from "@/components/staff-ui";
import { AUDIT_LABELS, listAudit, recordAudit, type AuditEntry } from "@/lib/audit";
import { normalizeAccountNumber } from "@/lib/billing/lookup";
import { formatDate, formatDollars, formatShortDate, formatStamp } from "@/lib/staff/format";
import {
  getAccountDetail,
  getAccountsOverview,
  type AccountsOverview,
  type StaffAccountDetail,
  type StaffCharge,
} from "@/lib/staff/records";
import { requireStaff } from "@/lib/staff/session";

/** Who voided a charge and why, for charges voided since reasons were asked for. */
function voidNote(charge: StaffCharge): string | null {
  if (charge.status !== "void" || !charge.voidReason) return null;
  return `Voided${charge.voidedBy ? ` by ${charge.voidedBy}` : ""}: ${charge.voidReason}`;
}

export default async function StaffAccountPage({ params }: { params: Promise<{ accountNumber: string }> }) {
  const user = await requireStaff();
  const admin = user.role === "admin";

  const accountNumber = normalizeAccountNumber((await params).accountNumber);
  if (!accountNumber) notFound();

  let detail: StaffAccountDetail | null;
  let overview: AccountsOverview;
  // Only admins read the activity log.
  let entries: AuditEntry[] | null = null;
  try {
    [detail, overview] = await Promise.all([getAccountDetail(accountNumber), getAccountsOverview()]);
    if (detail) {
      // Inside the try on purpose: an account that can't be logged as opened isn't shown.
      await recordAudit(user, "account.viewed", { accountNumber });
      if (admin) entries = await listAudit({ accountNumber });
    }
  } catch (error) {
    console.error("Staff: loading an account failed", error);
    return (
      <StaffAlertPage>
        The patient database didn&apos;t respond, so this account can&apos;t be shown right now.
      </StaffAlertPage>
    );
  }
  if (!detail) notFound();

  const { account } = detail;

  return (
    <AccountsWorkspace
      overview={overview}
      open={{
        accountNumber: account.accountNumber,
        patientName: account.patientName,
        balanceCents: account.balanceCents,
      }}
      pane={<Detail key={account.accountNumber} detail={detail} entries={entries} />}
      sheet={<Sheet detail={detail} admin={admin} />}
    />
  );
}

/* ------------------------------------------------------------------
   Tablets and larger: the account beside the list
   ------------------------------------------------------------------ */

function Detail({ detail, entries }: { detail: StaffAccountDetail; entries: AuditEntry[] | null }) {
  const { account, patient, charges, payments } = detail;
  const owes = account.balanceCents > 0;
  const fact = "inline-flex items-center gap-1.5";

  const tabs: RecordTab[] = [
    {
      id: "charges",
      label: "Charges",
      count: charges.length,
      panel: <ChargeRows accountNumber={account.accountNumber} charges={charges} />,
    },
    {
      id: "payments",
      label: "Payments",
      count: payments.length,
      panel:
        payments.length === 0 ? (
          <p className={`${skin.card} text-muted`}>No online payments on this account yet.</p>
        ) : (
          <ul className={`@container ${skin.list}`}>
            {payments.map((payment) => (
              <li key={payment.id} className={`${skin.row} flex flex-wrap items-center gap-x-4 gap-y-1`}>
                <span className="min-w-0 flex-1 @max-md:basis-full">
                  <span className="block">Paid online</span>
                  <span className={skin.meta}>{formatStamp(payment.paidAt)}</span>
                </span>
                <span className={`${skin.code} min-w-0 truncate text-muted`}>{payment.stripePaymentId}</span>
                <span className="ml-auto w-[88px] text-right font-semibold tabular-nums">
                  {formatDollars(payment.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        ),
    },
  ];
  if (entries) {
    tabs.push({
      id: "activity",
      label: "Activity",
      count: entries.length,
      panel: (
        <ul className={skin.list}>
          {entries.map((entry) => (
            <li key={entry.id} className={`${skin.row} flex flex-wrap items-baseline gap-x-3 gap-y-0.5`}>
              <span className={`${skin.meta} w-[124px] tabular-nums`}>{formatStamp(entry.at)}</span>
              <span className="min-w-0 flex-1 basis-[200px]">
                <span className="font-semibold">{entry.actorName}</span> <span className="text-muted">·</span>{" "}
                {AUDIT_LABELS[entry.action] ?? entry.action}
                {entry.detail ? <span className={`${skin.meta} block break-words`}>{entry.detail}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <div className="staff-slide">
      <div className={`sticky top-0 z-10 isolate overflow-hidden border-b border-line bg-white py-4 ${gutter}`}>
        <span aria-hidden="true" className="staff-pluses pointer-events-none absolute inset-y-0 right-0 -z-10 w-[60%]" />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar name={account.patientName} className="h-12 w-12 text-[16px]" />
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(22px,2.6vw,28px)] font-extrabold leading-[1.1] tracking-[-.025em]">
                {account.patientName}
              </h1>
              <div className="mt-1 flex flex-wrap gap-x-3.5 gap-y-0.5 text-[13px] text-muted">
                <span className="font-mono">{account.accountNumber}</span>
                <span className={fact}>
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  Born {formatDate(account.dateOfBirth)}
                </span>
                <span className={fact}>
                  <Icon name="phone" className="h-3.5 w-3.5" />
                  {patient?.phone ?? "No phone on file"}
                </span>
                <span className={`${fact} break-all`}>
                  <Icon name="mail" className="h-3.5 w-3.5" />
                  {patient?.email ?? "No email on file"}
                </span>
                {entries ? (
                  // Downloads are for admins, the same people who see the activity tab.
                  <DownloadLink
                    href={`/staff/export/account?account=${account.accountNumber}`}
                    className={`${fact} font-semibold`}
                  >
                    Download for Excel
                  </DownloadLink>
                ) : null}
              </div>
            </div>
          </div>
          <div
            className={`rounded-[12px] border px-3.5 py-2 ${
              owes ? "border-pink-line bg-pink text-pink-ink" : "border-[#cfe6d7] bg-[#e2f1e7] text-[#22693a]"
            }`}
          >
            <div className="text-[11.5px] font-semibold uppercase tracking-[.07em]">{owes ? "Balance due" : "Paid up"}</div>
            <div className="mt-0.5 font-display text-[26px] font-extrabold leading-none tracking-[-.03em] tabular-nums">
              {formatDollars(account.balanceCents)}
            </div>
          </div>
        </div>
      </div>

      <div className={`pb-10 pt-4 ${gutter}`}>
        <AccountWorkbench accountNumber={account.accountNumber} tabs={tabs} />
      </div>
    </div>
  );
}

function ChargeRows({ accountNumber, charges }: { accountNumber: string; charges: StaffCharge[] }) {
  if (charges.length === 0) {
    return <p className={`${skin.card} text-muted`}>No charges posted to this account yet.</p>;
  }
  return (
    <ul className={`@container ${skin.list}`}>
      {charges.map((charge) => {
        const note = voidNote(charge);
        return (
          <li key={charge.id} className={`${skin.row} flex flex-wrap items-center gap-x-4 gap-y-1.5`}>
            <div className="min-w-0 flex-1 @max-md:basis-full">
              <div>{charge.description}</div>
              <div className={skin.meta}>{formatStamp(charge.createdAt)}</div>
              {note ? <div className={`${skin.meta} break-words`}>{note}</div> : null}
            </div>
            <Chip tone={CHARGE_STATUS[charge.status].chip}>{CHARGE_STATUS[charge.status].label}</Chip>
            <div
              className={`ml-auto w-[88px] text-right tabular-nums ${
                charge.status === "void" ? "text-muted line-through" : "font-semibold"
              }`}
            >
              {formatDollars(charge.amountCents)}
            </div>
            <div className="w-[38px] text-right">
              {charge.status === "unpaid" ? (
                <VoidCharge
                  accountNumber={accountNumber}
                  chargeId={charge.id}
                  description={charge.description}
                  amount={formatDollars(charge.amountCents)}
                  className={skin.quiet}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------
   Phones: the account under its line in the list
   ------------------------------------------------------------------ */

const sheetLabel = "font-mono text-[11.5px] uppercase tracking-[.08em] text-muted";
const sheetLine = "flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-line py-2 text-[14.5px]";

function Sheet({ detail, admin }: { detail: StaffAccountDetail; admin: boolean }) {
  const { account, patient, charges, payments } = detail;

  return (
    <div className={`staff-entry-fade bg-mist pb-6 pt-1 ${gutter}`}>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[14.5px]">
        <dt className={sheetLabel}>Born</dt>
        <dd className="m-0">{formatDate(account.dateOfBirth)}</dd>
        <dt className={sheetLabel}>Phone</dt>
        <dd className="m-0">{patient?.phone ?? "Not on file"}</dd>
        <dt className={sheetLabel}>Email</dt>
        <dd className="m-0 break-all">{patient?.email ?? "Not on file"}</dd>
      </dl>
      {admin ? (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <Link href={`/staff/audit?account=${account.accountNumber}`} className={skin.quiet}>
            Activity on this account
          </Link>
          <DownloadLink
            href={`/staff/export/account?account=${account.accountNumber}`}
            className={`${skin.quiet} inline-flex items-center gap-1.5`}
          >
            Download for Excel
          </DownloadLink>
        </div>
      ) : null}

      <h3 className={`${skin.heading} mt-6`}>Charges</h3>
      {charges.length === 0 ? (
        <p className="mt-2 text-[14.5px] text-muted">No charges posted yet.</p>
      ) : (
        <ul className="mt-2 border-t border-line">
          {charges.map((charge) => {
            const note = voidNote(charge);
            return (
              <li key={charge.id} className={sheetLine}>
                <span className="w-[52px] font-mono text-[12.5px] text-muted">{formatShortDate(charge.createdAt)}</span>
                <div className="min-w-0 flex-1 basis-[150px]">
                  <div className={charge.status === "void" ? "text-muted line-through" : ""}>{charge.description}</div>
                  {note ? <div className="break-words text-[13px] text-muted">{note}</div> : null}
                </div>
                <span className={`font-mono text-[11.5px] uppercase tracking-[.06em] ${CHARGE_STATUS[charge.status].ink}`}>
                  {CHARGE_STATUS[charge.status].label}
                </span>
                <span className="ml-auto w-[84px] text-right font-mono tabular-nums">
                  {formatDollars(charge.amountCents)}
                </span>
                <div className="w-[34px] text-right">
                  {charge.status === "unpaid" ? (
                    <VoidCharge
                      accountNumber={account.accountNumber}
                      chargeId={charge.id}
                      description={charge.description}
                      amount={formatDollars(charge.amountCents)}
                      className="relative text-[13px] font-semibold text-brand after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-[''] hover:text-brand-dark"
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
          <li className="flex items-baseline justify-between py-2.5 text-[15px] font-semibold">
            <span>Balance due</span>
            <span className="mr-[46px] font-mono tabular-nums">{formatDollars(account.balanceCents)}</span>
          </li>
        </ul>
      )}

      {payments.length > 0 ? (
        <>
          <h3 className={`${skin.heading} mt-4`}>Payments</h3>
          <ul className="mt-2 border-t border-line">
            {payments.map((payment) => (
              <li key={payment.id} className={sheetLine}>
                <span className="w-[52px] font-mono text-[12.5px] text-muted">{formatShortDate(payment.paidAt)}</span>
                <span className="min-w-0 flex-1 basis-[150px] truncate">
                  Paid online <span className="font-mono text-[12px] text-muted">{payment.stripePaymentId}</span>
                </span>
                <span className="ml-auto mr-[46px] w-[84px] text-right font-mono tabular-nums">
                  {formatDollars(payment.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 className={`${skin.heading} mt-6`}>Post a charge</h3>
      <ChargeForm accountNumber={account.accountNumber} className="mt-2" />
    </div>
  );
}
