import "server-only";

import { randomInt } from "node:crypto";
import { AggregateField, FieldValue } from "firebase-admin/firestore";
import { newAuditEntry, type Actor } from "@/lib/audit";
import { getDb } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type AccountRecord,
  type ChargeRecord,
  type PatientRecord,
  type PaymentRecord,
} from "@/lib/firebase/collections";
import { clinicDayStart, clinicWeekStart, formatDollars } from "@/lib/staff/format";

const GRPC_ALREADY_EXISTS = 6;
const ACCOUNT_NUMBER_ATTEMPTS = 5;

/** The accounts list shows this many of the newest accounts. */
export const ACCOUNT_LIST_LIMIT = 200;

/** The accounts screen names this many of the accounts that have owed the longest. */
const OWING_LONGEST_COUNT = 4;
/** Enough of the oldest unpaid charges to find that many different accounts. */
const OWING_SCAN_LIMIT = 60;

export type NewPatient = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
};

export type StaffCharge = ChargeRecord & { id: string };

export type StaffPayment = PaymentRecord & { id: string };

export type StaffAccountDetail = {
  account: AccountRecord;
  patient: PatientRecord | null;
  charges: StaffCharge[];
  payments: StaffPayment[];
};

/** An account with an unpaid charge, and when its oldest unpaid charge was posted. */
export type OwingAccount = {
  accountNumber: string;
  patientName: string;
  balanceCents: number;
  since: string;
};

export type AccountsOverview = {
  /** The newest accounts, newest first, up to `ACCOUNT_LIST_LIMIT`. */
  accounts: AccountRecord[];
  totalAccounts: number;
  owingAccounts: number;
  outstandingCents: number;
  /** Paid online since `weekStart`, the most recent Monday at the clinic. */
  paidThisWeekCents: number;
  weekStart: string;
  /** Charges posted since midnight at the clinic, not counting voided ones. */
  chargesToday: number;
  /** The accounts that have owed the longest. Empty unless asked for. */
  owingLongest: OwingAccount[];
};

function isAlreadyExists(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === GRPC_ALREADY_EXISTS;
}

/** Registers a patient and opens their billing account. Returns the account number. */
export async function createPatientAccount(actor: Actor, input: NewPatient): Promise<string> {
  const db = getDb();
  const createdAt = new Date().toISOString();

  const patient: PatientRecord = {
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth,
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.email ? { email: input.email } : {}),
    createdAt,
  };

  for (let attempt = 0; attempt < ACCOUNT_NUMBER_ATTEMPTS; attempt++) {
    const accountNumber = `NS-${randomInt(100000, 1000000)}`;
    const patientRef = db.collection(COLLECTIONS.patients).doc();
    const account: AccountRecord = {
      patientId: patientRef.id,
      patientName: `${input.firstName} ${input.lastName}`,
      accountNumber,
      dateOfBirth: input.dateOfBirth,
      balanceCents: 0,
      status: "open",
      createdAt,
    };

    const batch = db.batch();
    batch.create(patientRef, patient);
    batch.create(db.collection(COLLECTIONS.accounts).doc(accountNumber), account);
    const audit = newAuditEntry(actor, "patient.created", { accountNumber });
    batch.create(audit.ref, audit.data);
    try {
      await batch.commit();
      return accountNumber;
    } catch (error) {
      // The random account number is taken. Nothing was written, so pick another.
      if (!isAlreadyExists(error)) throw error;
    }
  }

  throw new Error("Could not find an unused account number");
}

/**
 * What the accounts screen shows around the list. The totals cover every
 * account, not only the ones in the list.
 */
export async function getAccountsOverview(options: { owingLongest?: boolean } = {}): Promise<AccountsOverview> {
  const db = getDb();
  const accountsRef = db.collection(COLLECTIONS.accounts);
  const chargesRef = db.collection(COLLECTIONS.charges);
  const now = new Date();
  const weekStart = clinicWeekStart(now);

  const [listSnap, totalsSnap, owingSnap, paidSnap, todaySnap, unpaidSnap] = await Promise.all([
    accountsRef.orderBy("createdAt", "desc").limit(ACCOUNT_LIST_LIMIT).get(),
    accountsRef.aggregate({ outstanding: AggregateField.sum("balanceCents"), total: AggregateField.count() }).get(),
    accountsRef.where("balanceCents", ">", 0).count().get(),
    db
      .collection(COLLECTIONS.payments)
      .where("paidAt", ">=", weekStart.toISOString())
      .aggregate({ paid: AggregateField.sum("amountCents") })
      .get(),
    chargesRef.where("createdAt", ">=", clinicDayStart(now).toISOString()).get(),
    options.owingLongest
      ? chargesRef
          .where("status", "==", "unpaid")
          .orderBy("createdAt")
          .limit(OWING_SCAN_LIMIT)
          .select("accountId", "createdAt")
          .get()
      : null,
  ]);

  const accounts = listSnap.docs.map((doc) => doc.data() as AccountRecord);

  // The oldest unpaid charge on each account, oldest account first.
  const oldestUnpaid = new Map<string, string>();
  for (const doc of unpaidSnap?.docs ?? []) {
    const accountId = String(doc.get("accountId"));
    if (!oldestUnpaid.has(accountId)) oldestUnpaid.set(accountId, String(doc.get("createdAt")));
  }
  const longest = [...oldestUnpaid].slice(0, OWING_LONGEST_COUNT);

  // An account that has owed for a long time may be older than the newest page of the list.
  const listed = new Map(accounts.map((account) => [account.accountNumber, account]));
  const unlisted = longest.filter(([accountNumber]) => !listed.has(accountNumber));
  if (unlisted.length > 0) {
    const snaps = await db.getAll(...unlisted.map(([accountNumber]) => accountsRef.doc(accountNumber)));
    for (const snap of snaps) {
      if (snap.exists) listed.set(snap.id, snap.data() as AccountRecord);
    }
  }

  return {
    accounts,
    totalAccounts: totalsSnap.data().total,
    owingAccounts: owingSnap.data().count,
    // This database answers null, not zero, when there is nothing to add up.
    outstandingCents: Number(totalsSnap.data().outstanding) || 0,
    paidThisWeekCents: Number(paidSnap.data().paid) || 0,
    weekStart: weekStart.toISOString(),
    chargesToday: todaySnap.docs.filter((doc) => doc.get("status") !== "void").length,
    owingLongest: longest.flatMap(([accountNumber, since]) => {
      const account = listed.get(accountNumber);
      return account && account.balanceCents > 0
        ? [{ accountNumber, patientName: account.patientName, balanceCents: account.balanceCents, since }]
        : [];
    }),
  };
}

export async function getAccountDetail(accountNumber: string): Promise<StaffAccountDetail | null> {
  const db = getDb();
  const accountSnap = await db.collection(COLLECTIONS.accounts).doc(accountNumber).get();
  if (!accountSnap.exists) return null;
  const account = accountSnap.data() as AccountRecord;

  const [patientSnap, chargesSnap, paymentsSnap] = await Promise.all([
    db.collection(COLLECTIONS.patients).doc(account.patientId).get(),
    db.collection(COLLECTIONS.charges).where("accountId", "==", accountNumber).get(),
    db.collection(COLLECTIONS.payments).where("accountId", "==", accountNumber).get(),
  ]);

  const charges = chargesSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as ChargeRecord) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const payments = paymentsSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as PaymentRecord) }))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  return {
    account,
    patient: patientSnap.exists ? (patientSnap.data() as PatientRecord) : null,
    charges,
    payments,
  };
}

/** Posts a charge and raises the account balance. Returns false if the account is missing. */
export async function addCharge(
  actor: Actor,
  accountNumber: string,
  description: string,
  amountCents: number,
): Promise<boolean> {
  const db = getDb();
  const accountRef = db.collection(COLLECTIONS.accounts).doc(accountNumber);
  const chargeRef = db.collection(COLLECTIONS.charges).doc();
  const charge: ChargeRecord = {
    accountId: accountNumber,
    description,
    amountCents,
    status: "unpaid",
    createdAt: new Date().toISOString(),
  };

  return db.runTransaction(async (tx) => {
    const accountSnap = await tx.get(accountRef);
    if (!accountSnap.exists) return false;
    tx.create(chargeRef, charge);
    tx.update(accountRef, { balanceCents: FieldValue.increment(amountCents) });
    const audit = newAuditEntry(actor, "charge.posted", {
      accountNumber,
      detail: `${description}, ${formatDollars(amountCents)}`,
    });
    tx.create(audit.ref, audit.data);
    return true;
  });
}

/**
 * Voids an unpaid charge and lowers the balance. The reason is kept on the charge
 * and in the activity log. Returns false if nothing changed.
 */
export async function voidCharge(
  actor: Actor,
  accountNumber: string,
  chargeId: string,
  reason: string,
): Promise<boolean> {
  const db = getDb();
  const accountRef = db.collection(COLLECTIONS.accounts).doc(accountNumber);
  const chargeRef = db.collection(COLLECTIONS.charges).doc(chargeId);

  return db.runTransaction(async (tx) => {
    const chargeSnap = await tx.get(chargeRef);
    const charge = chargeSnap.data() as ChargeRecord | undefined;
    if (!charge || charge.accountId !== accountNumber || charge.status !== "unpaid") return false;
    tx.update(chargeRef, {
      status: "void",
      voidReason: reason,
      voidedAt: new Date().toISOString(),
      voidedBy: actor.name,
    });
    tx.update(accountRef, { balanceCents: FieldValue.increment(-charge.amountCents) });
    const audit = newAuditEntry(actor, "charge.voided", {
      accountNumber,
      detail: `${charge.description}, ${formatDollars(charge.amountCents)}. Reason: ${reason}`,
    });
    tx.create(audit.ref, audit.data);
    return true;
  });
}
