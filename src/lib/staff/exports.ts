import "server-only";

import { AUDIT_LABELS, listAudit } from "@/lib/audit";
import { normalizeAccountNumber } from "@/lib/billing/lookup";
import type { ChargeRecord } from "@/lib/firebase/collections";
import { activityFilter, describeActivityQuery, readActivityQuery } from "@/lib/staff/activity";
import type { Cell, Sheet } from "@/lib/staff/excel";
import { clinicDate, clinicWallClock } from "@/lib/staff/format";
import { choosePeriod } from "@/lib/staff/periods";
import { getAccountDetail, type StaffCharge, type StaffPayment } from "@/lib/staff/records";
import {
  EXPORT_ROW_LIMIT,
  getPeriodReport,
  listAccountsForExport,
  reportTotals,
} from "@/lib/staff/reports";

/*
 * The Excel downloads: what goes in each file. The route at
 * /staff/export/[kind] turns the answer into a workbook and logs the download.
 */

export const EXPORT_KINDS = ["report", "accounts", "activity", "account"] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

export type ExportFile = {
  filename: string;
  /** What was downloaded, for the activity log. */
  summary: string;
  /** Set when the file is about one account, so the download shows in that account's activity. */
  accountNumber?: string;
  sheets: Sheet[];
};

/** A refusal the person can act on, such as dates that can't be read. */
export type ExportRefusal = { refused: string; status: 400 | 404 };

const STATUS_LABELS: Record<ChargeRecord["status"], string> = { unpaid: "Unpaid", paid: "Paid", void: "Void" };

const dollars = (cents: number): number => cents / 100;
const time = (isoTimestamp: string | undefined): Date | null => (isoTimestamp ? clinicWallClock(isoTimestamp) : null);
const money = (cents: number): Cell => ({ value: dollars(cents), kind: "money" });
const count = (value: number): Cell => ({ value, kind: "count" });

const CUT_OFF = `Only the newest ${EXPORT_ROW_LIMIT.toLocaleString("en-US")} rows of each kind are in this file. Choose a shorter period for the rest.`;

/** The first sheet of every file: what it holds, who downloaded it and when. */
function aboutSheet(contents: string, downloadedBy: string, lines: [string, Cell][], cutOff: boolean): Sheet {
  return {
    name: "About",
    sortable: false,
    columns: [
      { header: "About this file", width: 26 },
      { header: "", width: 64 },
    ],
    rows: [
      ["Contents", contents],
      ...lines,
      ["Downloaded", { value: clinicWallClock(new Date().toISOString()), kind: "time" }],
      ["Downloaded by", downloadedBy],
      ["Times", "Eastern Time, the clinic's clock."],
      ...(cutOff ? [["Incomplete", CUT_OFF] satisfies Cell[]] : []),
      ["Handling", "This file holds patient information. Keep and share it only as clinic policy allows."],
    ],
  };
}

function chargesSheet(charges: (StaffCharge & { patientName?: string })[], withPatient: boolean): Sheet {
  return {
    name: "Charges",
    columns: [
      { header: "Posted", kind: "time" },
      ...(withPatient ? [{ header: "Account", width: 14 }, { header: "Patient" }] : []),
      { header: "Description", width: 40 },
      { header: "Amount", kind: "money" },
      { header: "Status", width: 12 },
      { header: "Void reason", width: 40 },
      { header: "Voided by", width: 24 },
      { header: "Voided", kind: "time" },
    ],
    rows: charges.map((charge) => [
      time(charge.createdAt),
      ...(withPatient ? [charge.accountId, charge.patientName ?? ""] : []),
      charge.description,
      dollars(charge.amountCents),
      STATUS_LABELS[charge.status] ?? charge.status,
      charge.voidReason ?? "",
      charge.voidedBy ?? "",
      time(charge.voidedAt),
    ]),
  };
}

function paymentsSheet(payments: (StaffPayment & { patientName?: string })[], withPatient: boolean): Sheet {
  return {
    name: "Payments",
    totalLabel: "Total",
    columns: [
      { header: "Paid", kind: "time" },
      ...(withPatient ? [{ header: "Account", width: 14 }, { header: "Patient" }] : []),
      { header: "Amount", kind: "money" },
      { header: "Method", width: 12 },
      { header: "Reference", width: 34 },
    ],
    rows: payments.map((payment) => [
      time(payment.paidAt),
      ...(withPatient ? [payment.accountId, payment.patientName ?? ""] : []),
      dollars(payment.amountCents),
      "Online",
      payment.stripePaymentId,
    ]),
  };
}

type Params = Record<string, string>;

async function reportFile(params: Params, downloadedBy: string): Promise<ExportFile | ExportRefusal> {
  const { period, problem } = choosePeriod(params, "week");
  if (problem || !period) return { refused: problem ?? "Choose a period.", status: 400 };

  const report = await getPeriodReport(period, EXPORT_ROW_LIMIT);
  const totals = reportTotals(report);
  return {
    filename: `national-select-report-${period.from}-to-${period.to}.xlsx`,
    summary: `Charges and payments, ${period.dates}`,
    sheets: [
      aboutSheet(
        "Charges posted and payments received in one period.",
        downloadedBy,
        [
          ["Period", period.dates],
          ["Charges posted", count(totals.chargeCount)],
          ["Charged", money(totals.chargedCents)],
          ["Payments received", count(totals.paymentCount)],
          ["Paid", money(totals.paidCents)],
          ["Charges voided since", count(totals.voidCount)],
          ["Voided", money(totals.voidedCents)],
          ["New patient accounts", count(report.newAccounts)],
        ],
        report.cutOff,
      ),
      chargesSheet(report.charges, true),
      paymentsSheet(report.payments, true),
    ],
  };
}

async function accountsFile(downloadedBy: string): Promise<ExportFile> {
  const { accounts, cutOff } = await listAccountsForExport();
  const owing = accounts.filter((account) => account.balanceCents > 0);
  return {
    filename: `national-select-accounts-${clinicDate()}.xlsx`,
    summary: "All patient accounts",
    sheets: [
      aboutSheet(
        "Every patient account and its balance.",
        downloadedBy,
        [
          ["Accounts", count(accounts.length)],
          ["Accounts with a balance", count(owing.length)],
          ["Outstanding", money(owing.reduce((total, account) => total + account.balanceCents, 0))],
        ],
        cutOff,
      ),
      {
        name: "Accounts",
        totalLabel: "Total",
        columns: [
          { header: "Account", width: 14 },
          { header: "Patient" },
          { header: "Date of birth", kind: "date" },
          { header: "Phone", width: 18 },
          { header: "Email", width: 30 },
          { header: "Balance", kind: "money" },
          { header: "Status", width: 10 },
          { header: "Opened", kind: "time" },
        ],
        rows: accounts.map((account) => [
          account.accountNumber,
          account.patientName,
          /^\d{4}-\d{2}-\d{2}$/.test(account.dateOfBirth) ? new Date(`${account.dateOfBirth}T00:00:00Z`) : null,
          account.phone,
          account.email,
          dollars(account.balanceCents),
          account.status === "closed" ? "Closed" : "Open",
          time(account.createdAt),
        ]),
      },
    ],
  };
}

async function activityFile(params: Params, downloadedBy: string): Promise<ExportFile | ExportRefusal> {
  const query = readActivityQuery(params);
  if (query.problem) return { refused: query.problem, status: 400 };
  if (query.typedAccount && !query.accountNumber) {
    return { refused: `“${query.typedAccount}” isn't an account number.`, status: 400 };
  }

  // One more than the limit is asked for, to tell a full log from one that was cut off.
  const found = await listAudit(activityFilter(query), EXPORT_ROW_LIMIT + 1);
  const entries = found.slice(0, EXPORT_ROW_LIMIT);
  const filters = describeActivityQuery(query);
  return {
    filename: `national-select-activity-${query.period ? `${query.period.from}-to-${query.period.to}` : clinicDate()}.xlsx`,
    summary: `Activity log, ${filters}`,
    sheets: [
      aboutSheet(
        "The activity log: who signed in, which accounts they opened and what they changed.",
        downloadedBy,
        [
          ["Showing", filters],
          ["Entries", count(entries.length)],
        ],
        found.length > EXPORT_ROW_LIMIT,
      ),
      {
        name: "Activity",
        columns: [
          { header: "When", kind: "time" },
          { header: "Who", width: 26 },
          { header: "What", width: 28 },
          { header: "Account", width: 14 },
          { header: "Details", width: 70 },
        ],
        rows: entries.map((entry) => [
          time(entry.at),
          entry.actorName,
          AUDIT_LABELS[entry.action] ?? entry.action,
          entry.accountNumber ?? "",
          entry.detail ?? "",
        ]),
      },
    ],
  };
}

async function accountFile(params: Params, downloadedBy: string): Promise<ExportFile | ExportRefusal> {
  const accountNumber = normalizeAccountNumber(params.account ?? "");
  const detail = accountNumber ? await getAccountDetail(accountNumber) : null;
  if (!accountNumber || !detail) return { refused: "There's no account with that number.", status: 404 };

  const { account, patient, charges, payments } = detail;
  return {
    filename: `national-select-${account.accountNumber}-${clinicDate()}.xlsx`,
    summary: "Account statement",
    accountNumber: account.accountNumber,
    sheets: [
      aboutSheet(
        "One patient account: its charges and payments.",
        downloadedBy,
        [
          ["Patient", account.patientName],
          ["Account", account.accountNumber],
          [
            "Date of birth",
            /^\d{4}-\d{2}-\d{2}$/.test(account.dateOfBirth)
              ? { value: new Date(`${account.dateOfBirth}T00:00:00Z`), kind: "date" }
              : account.dateOfBirth,
          ],
          ["Phone", patient?.phone ?? ""],
          ["Email", patient?.email ?? ""],
          ["Balance due", money(account.balanceCents)],
        ],
        false,
      ),
      chargesSheet(charges, false),
      paymentsSheet(payments, false),
    ],
  };
}

/** Gathers the rows for one download. Throws if the database doesn't answer. */
export async function gatherExport(
  kind: ExportKind,
  params: Params,
  downloadedBy: string,
): Promise<ExportFile | ExportRefusal> {
  switch (kind) {
    case "report":
      return reportFile(params, downloadedBy);
    case "accounts":
      return accountsFile(downloadedBy);
    case "activity":
      return activityFile(params, downloadedBy);
    case "account":
      return accountFile(params, downloadedBy);
  }
}
