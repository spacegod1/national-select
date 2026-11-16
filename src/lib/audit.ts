import "server-only";

import type { DocumentReference, Query } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/admin";
import { COLLECTIONS, type AuditAction, type AuditRecord } from "@/lib/firebase/collections";

/** The activity page shows this many of the newest entries. */
export const AUDIT_LIST_LIMIT = 200;

/** Who did something. `id` is null when nobody was signed in. */
export type Actor = { id: string | null; name: string };

export const NOT_SIGNED_IN: Actor = { id: null, name: "Not signed in" };
export const ONLINE_PAYMENT: Actor = { id: null, name: "Online payment" };

export type AuditDetails = { accountNumber?: string; targetUserId?: string; detail?: string };
export type AuditEntry = AuditRecord & { id: string };

export const AUDIT_LABELS: Record<AuditAction, string> = {
  "auth.signed_in": "Signed in",
  "auth.sign_in_failed": "Sign-in failed",
  "auth.signed_out": "Signed out",
  "auth.password_changed": "Changed own password",
  "user.first_admin_created": "Created the first admin",
  "user.created": "Created a staff user",
  "user.password_reset": "Reset a password",
  "user.deactivated": "Deactivated a staff user",
  "user.reactivated": "Reactivated a staff user",
  "user.role_changed": "Changed a role",
  "patient.created": "Created a patient account",
  "account.viewed": "Opened a patient account",
  "charge.posted": "Posted a charge",
  "charge.voided": "Voided a charge",
  "payment.recorded": "Payment recorded",
  "records.exported": "Downloaded records",
};

/** The kinds of activity the activity page can be narrowed to. */
export const AUDIT_GROUPS = [
  {
    id: "sign-ins",
    label: "Sign-ins and passwords",
    actions: ["auth.signed_in", "auth.sign_in_failed", "auth.signed_out", "auth.password_changed"],
  },
  { id: "patients", label: "Patient accounts", actions: ["patient.created", "account.viewed"] },
  { id: "billing", label: "Charges and payments", actions: ["charge.posted", "charge.voided", "payment.recorded"] },
  {
    id: "users",
    label: "Staff users",
    actions: [
      "user.first_admin_created",
      "user.created",
      "user.password_reset",
      "user.deactivated",
      "user.reactivated",
      "user.role_changed",
    ],
  },
  { id: "downloads", label: "Downloads", actions: ["records.exported"] },
] as const satisfies readonly { id: string; label: string; actions: readonly AuditAction[] }[];

export type AuditGroup = (typeof AUDIT_GROUPS)[number];

export type AuditFilter = {
  accountNumber?: string | null;
  /** Entries from `startIso` up to, but not including, `endIso`. */
  startIso?: string;
  endIso?: string;
  /** Only these kinds of entry. */
  actions?: readonly AuditAction[];
};

/**
 * Builds an entry without saving it, so a change and its entry can be written in
 * the same transaction or batch: `tx.create(entry.ref, entry.data)`.
 */
export function newAuditEntry(
  actor: Actor,
  action: AuditAction,
  details: AuditDetails = {},
): { ref: DocumentReference; data: AuditRecord } {
  const data: AuditRecord = {
    at: new Date().toISOString(),
    actorId: actor.id,
    actorName: actor.name,
    action,
    ...(details.accountNumber ? { accountNumber: details.accountNumber } : {}),
    ...(details.targetUserId ? { targetUserId: details.targetUserId } : {}),
    ...(details.detail ? { detail: details.detail } : {}),
  };
  return { ref: getDb().collection(COLLECTIONS.auditLog).doc(), data };
}

/** Saves an entry for an event that changes nothing else, such as a sign-in. */
export async function recordAudit(actor: Actor, action: AuditAction, details: AuditDetails = {}): Promise<void> {
  const entry = newAuditEntry(actor, action, details);
  await entry.ref.create(entry.data);
}

/** Newest entries first, narrowed to an account, a span of time, or kinds of entry. */
export async function listAudit(filter: AuditFilter = {}, limit = AUDIT_LIST_LIMIT): Promise<AuditEntry[]> {
  const { accountNumber, startIso, endIso, actions } = filter;
  const collection = getDb().collection(COLLECTIONS.auditLog);

  // One account's entries are few, so they are all read and narrowed here.
  if (accountNumber) {
    const snapshot = await collection.where("accountNumber", "==", accountNumber).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as AuditRecord) }))
      .filter(
        (entry) =>
          (!startIso || entry.at >= startIso) &&
          (!endIso || entry.at < endIso) &&
          (!actions || actions.includes(entry.action)),
      )
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
  }

  let query: Query = collection;
  if (actions) query = query.where("action", "in", [...actions]);
  if (startIso) query = query.where("at", ">=", startIso);
  if (endIso) query = query.where("at", "<", endIso);
  const snapshot = await query.orderBy("at", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AuditRecord) }));
}
