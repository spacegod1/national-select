import "server-only";

import { getDb } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type AccountRecord,
  type ChargeRecord,
  type PatientRecord,
  type PaymentRecord,
} from "@/lib/firebase/collections";
import { addDays, clinicDate, formatDay } from "@/lib/staff/format";
import type { Period } from "@/lib/staff/periods";
import type { StaffCharge, StaffPayment } from "@/lib/staff/records";

/** The reports page reads at most this many charges and this many payments for a period. */
export const REPORT_ROW_LIMIT = 5000;
/** A download holds at most this many rows of each kind. */
export const EXPORT_ROW_LIMIT = 20000;

/** Firestore reads this many documents by id in one request. */
const LOOKUP_CHUNK = 300;

export type ReportCharge = StaffCharge & { patientName: string };
export type ReportPayment = StaffPayment & { patientName: string };

export type PeriodReport = {
  /** Charges posted in the period, newest first. */
  charges: ReportCharge[];
  /** Payments received in the period, newest first. */
  payments: ReportPayment[];
  /** Patient accounts opened in the period. */
  newAccounts: number;
  /** True when the period holds more charges or payments than were read, so the figures are short. */
  cutOff: boolean;
};

export type ReportTotals = {
  /** Charges posted in the period that haven't been voided since. */
  chargeCount: number;
  chargedCents: number;
  /** Charges posted in the period that have been voided since. */
  voidCount: number;
  voidedCents: number;
  paymentCount: number;
  paidCents: number;
};

/** One bar of the chart: a day, a week or a month of the period. */
export type ReportBucket = { key: string; label: string; chargedCents: number; paidCents: number };

async function patientNames(accountNumbers: Iterable<string>): Promise<Map<string, string>> {
  const db = getDb();
  const accounts = db.collection(COLLECTIONS.accounts);
  const wanted = [...new Set(accountNumbers)];
  const names = new Map<string, string>();
  for (let start = 0; start < wanted.length; start += LOOKUP_CHUNK) {
    const refs = wanted.slice(start, start + LOOKUP_CHUNK).map((accountNumber) => accounts.doc(accountNumber));
    const snaps = await db.getAll(...refs, { fieldMask: ["patientName"] });
    for (const snap of snaps) {
      if (snap.exists) names.set(snap.id, String(snap.get("patientName") ?? ""));
    }
  }
  return names;
}

/** Everything posted and paid between two moments, with each patient's name. */
export async function getPeriodReport(
  period: Pick<Period, "startIso" | "endIso">,
  limit = REPORT_ROW_LIMIT,
): Promise<PeriodReport> {
  const db = getDb();
  const { startIso, endIso } = period;

  // One more than the limit is asked for, to tell a full period from one that was cut off.
  const [chargesSnap, paymentsSnap, accountsSnap] = await Promise.all([
    db
      .collection(COLLECTIONS.charges)
      .where("createdAt", ">=", startIso)
      .where("createdAt", "<", endIso)
      .orderBy("createdAt", "desc")
      .limit(limit + 1)
      .get(),
    db
      .collection(COLLECTIONS.payments)
      .where("paidAt", ">=", startIso)
      .where("paidAt", "<", endIso)
      .orderBy("paidAt", "desc")
      .limit(limit + 1)
      .get(),
    db.collection(COLLECTIONS.accounts).where("createdAt", ">=", startIso).where("createdAt", "<", endIso).count().get(),
  ]);

  const chargeDocs = chargesSnap.docs.slice(0, limit);
  const paymentDocs = paymentsSnap.docs.slice(0, limit);
  const names = await patientNames([
    ...chargeDocs.map((doc) => String(doc.get("accountId"))),
    ...paymentDocs.map((doc) => String(doc.get("accountId"))),
  ]);

  return {
    charges: chargeDocs.map((doc) => {
      const charge = doc.data() as ChargeRecord;
      return { id: doc.id, ...charge, patientName: names.get(charge.accountId) ?? "" };
    }),
    payments: paymentDocs.map((doc) => {
      const payment = doc.data() as PaymentRecord;
      return { id: doc.id, ...payment, patientName: names.get(payment.accountId) ?? "" };
    }),
    newAccounts: accountsSnap.data().count,
    cutOff: chargesSnap.size > limit || paymentsSnap.size > limit,
  };
}

export function reportTotals(report: Pick<PeriodReport, "charges" | "payments">): ReportTotals {
  const totals: ReportTotals = {
    chargeCount: 0,
    chargedCents: 0,
    voidCount: 0,
    voidedCents: 0,
    paymentCount: report.payments.length,
    paidCents: 0,
  };
  for (const charge of report.charges) {
    if (charge.status === "void") {
      totals.voidCount += 1;
      totals.voidedCents += charge.amountCents;
    } else {
      totals.chargeCount += 1;
      totals.chargedCents += charge.amountCents;
    }
  }
  for (const payment of report.payments) totals.paidCents += payment.amountCents;
  return totals;
}

/** A day for each bar up to a month, a week for each bar up to half a year, then a month. */
function bucketSize(days: number): "day" | "week" | "month" {
  if (days <= 31) return "day";
  return days <= 184 ? "week" : "month";
}

/**
 * What was charged and what was paid across the period, cut into bars for the
 * chart. Voided charges are left out. Every day, week or month in the period
 * gets a bar, including the ones where nothing happened.
 */
export function reportBuckets(
  period: Pick<Period, "from" | "to" | "days">,
  report: Pick<PeriodReport, "charges" | "payments">,
): { size: "day" | "week" | "month"; buckets: ReportBucket[] } {
  const size = bucketSize(period.days);

  // The key of the bar a clinic date falls in: the date itself, its Monday, or its month.
  const keyOf = (date: string): string => {
    if (size === "day") return date;
    if (size === "month") return date.slice(0, 7);
    const daysAfterMonday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
    return addDays(date, -daysAfterMonday);
  };
  const labelOf = (key: string): string => {
    if (size !== "month") return formatDay(key, false);
    // "Nov 1, 2026" becomes "Nov 2026".
    const [month, , year] = formatDay(`${key}-01`).split(" ");
    return `${month} ${year}`;
  };

  const buckets = new Map<string, ReportBucket>();
  for (let date = period.from; date <= period.to; date = addDays(date, 1)) {
    const key = keyOf(date);
    if (!buckets.has(key)) buckets.set(key, { key, label: labelOf(key), chargedCents: 0, paidCents: 0 });
  }

  for (const charge of report.charges) {
    if (charge.status === "void") continue;
    const bucket = buckets.get(keyOf(clinicDate(new Date(charge.createdAt))));
    if (bucket) bucket.chargedCents += charge.amountCents;
  }
  for (const payment of report.payments) {
    const bucket = buckets.get(keyOf(clinicDate(new Date(payment.paidAt))));
    if (bucket) bucket.paidCents += payment.amountCents;
  }

  return { size, buckets: [...buckets.values()] };
}

export type ExportAccount = AccountRecord & { phone: string; email: string };

/** Every patient account with its contact details, newest first, for a download. */
export async function listAccountsForExport(
  limit = EXPORT_ROW_LIMIT,
): Promise<{ accounts: ExportAccount[]; cutOff: boolean }> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.accounts)
    .orderBy("createdAt", "desc")
    .limit(limit + 1)
    .get();
  const accounts = snapshot.docs.slice(0, limit).map((doc) => doc.data() as AccountRecord);

  const patients = db.collection(COLLECTIONS.patients);
  const contacts = new Map<string, Pick<PatientRecord, "phone" | "email">>();
  for (let start = 0; start < accounts.length; start += LOOKUP_CHUNK) {
    const refs = accounts.slice(start, start + LOOKUP_CHUNK).map((account) => patients.doc(account.patientId));
    const snaps = await db.getAll(...refs, { fieldMask: ["phone", "email"] });
    for (const snap of snaps) {
      if (snap.exists) contacts.set(snap.id, snap.data() as Pick<PatientRecord, "phone" | "email">);
    }
  }

  return {
    accounts: accounts.map((account) => ({
      ...account,
      phone: contacts.get(account.patientId)?.phone ?? "",
      email: contacts.get(account.patientId)?.email ?? "",
    })),
    cutOff: snapshot.size > limit,
  };
}
