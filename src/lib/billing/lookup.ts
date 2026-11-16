import "server-only";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getDb, isFirebaseConfigured } from "@/lib/firebase/admin";

export type BillLookup =
  | { status: "unconfigured" }
  | { status: "invalid" }
  | { status: "not_found" }
  | { status: "found"; accountNumber: string; dateOfBirth: string; balanceCents: number };

export function normalizeAccountNumber(value: string): string | null {
  const accountNumber = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9-]{4,32}$/.test(accountNumber)) return null;
  return accountNumber;
}

export function normalizeDateOfBirth(value: string): string | null {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const us = /^(\d{1,2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*(\d{4})$/.exec(trimmed);

  let year: number;
  let month: number;
  let day: number;

  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else if (us) {
    month = Number(us[1]);
    day = Number(us[2]);
    year = Number(us[3]);
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const monthText = String(month).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

export async function lookupBalance(accountNumberRaw: string, dateOfBirthRaw: string): Promise<BillLookup> {
  const accountNumber = normalizeAccountNumber(accountNumberRaw);
  const dateOfBirth = normalizeDateOfBirth(dateOfBirthRaw);
  if (!accountNumber || !dateOfBirth) return { status: "invalid" };
  if (!isFirebaseConfigured()) return { status: "unconfigured" };

  const snapshot = await getDb().collection(COLLECTIONS.accounts).doc(accountNumber).get();
  if (!snapshot.exists) return { status: "not_found" };

  const account = snapshot.data();
  const balanceCents = account?.balanceCents;
  if (
    !account ||
    account.dateOfBirth !== dateOfBirth ||
    account.status === "closed" ||
    typeof balanceCents !== "number"
  ) {
    return { status: "not_found" };
  }

  return { status: "found", accountNumber, dateOfBirth, balanceCents };
}
