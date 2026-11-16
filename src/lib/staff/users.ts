import "server-only";

import { newAuditEntry, NOT_SIGNED_IN, recordAudit, type Actor } from "@/lib/audit";
import { getDb } from "@/lib/firebase/admin";
import { COLLECTIONS, type StaffRole, type StaffUserRecord } from "@/lib/firebase/collections";
import {
  generateTemporaryPassword,
  hashPassword,
  verifyAgainstNothing,
  verifyPassword,
} from "@/lib/staff/passwords";

/** This many wrong passwords in a row lock an account. */
export const MAX_FAILED_SIGN_INS = 5;
export const LOCK_MINUTES = 15;

export type StaffUserSummary = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  mustChangePassword: boolean;
  lastSignInAt: string | null;
};

export type NewStaffUser = { name: string; email: string; role: StaffRole };

function users() {
  return getDb().collection(COLLECTIONS.staffUsers);
}

function newRecord(input: NewStaffUser, passwordHash: string, mustChangePassword: boolean): StaffUserRecord {
  return {
    name: input.name,
    email: input.email,
    role: input.role,
    active: true,
    passwordHash,
    mustChangePassword,
    failedSignIns: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    lastSignInAt: null,
  };
}

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 ? email : null;
}

export async function hasStaffUsers(): Promise<boolean> {
  return !(await users().limit(1).get()).empty;
}

/** Creates the first admin. Returns their id, or null if a staff user already exists. */
export async function createFirstAdmin(name: string, email: string, password: string): Promise<string | null> {
  const passwordHash = await hashPassword(password);
  const ref = users().doc();

  return getDb().runTransaction(async (tx) => {
    if (!(await tx.get(users().limit(1))).empty) return null;
    tx.create(ref, newRecord({ name, email, role: "admin" }, passwordHash, false));
    const audit = newAuditEntry({ id: ref.id, name }, "user.first_admin_created", { targetUserId: ref.id });
    tx.create(audit.ref, audit.data);
    return ref.id;
  });
}

/** Checks an email and password. Returns the staff member's id and name, or null. */
export async function authenticate(email: string, password: string): Promise<Actor | null> {
  const found = await users().where("email", "==", email).limit(1).get();
  const doc = found.docs[0];
  if (!doc) {
    await verifyAgainstNothing(password);
    await recordAudit(NOT_SIGNED_IN, "auth.sign_in_failed", { detail: `No staff user with the email ${email}` });
    return null;
  }

  const user = doc.data() as StaffUserRecord;
  const blocked = !user.active
    ? "The account is deactivated"
    : user.lockedUntil && Date.parse(user.lockedUntil) > Date.now()
      ? "The account is locked"
      : null;
  if (blocked) {
    await verifyAgainstNothing(password);
    await recordAudit(NOT_SIGNED_IN, "auth.sign_in_failed", {
      targetUserId: doc.id,
      detail: `${blocked}: ${user.name} (${email})`,
    });
    return null;
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    await getDb().runTransaction(async (tx) => {
      const current = (await tx.get(doc.ref)).data() as StaffUserRecord | undefined;
      if (!current) return;
      const failedSignIns = current.failedSignIns + 1;
      const locks = failedSignIns >= MAX_FAILED_SIGN_INS;
      tx.update(doc.ref, {
        failedSignIns: locks ? 0 : failedSignIns,
        ...(locks ? { lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() } : {}),
      });
      const audit = newAuditEntry(NOT_SIGNED_IN, "auth.sign_in_failed", {
        targetUserId: doc.id,
        detail: `Wrong password for ${user.name} (${email})${locks ? `. Locked for ${LOCK_MINUTES} minutes` : ""}`,
      });
      tx.create(audit.ref, audit.data);
    });
    return null;
  }

  const actor: Actor = { id: doc.id, name: user.name };
  const batch = getDb().batch();
  batch.update(doc.ref, { failedSignIns: 0, lockedUntil: null, lastSignInAt: new Date().toISOString() });
  const audit = newAuditEntry(actor, "auth.signed_in");
  batch.create(audit.ref, audit.data);
  await batch.commit();
  return actor;
}

/** Checks a signed-in staff member's own password without changing anything. */
export async function isOwnPassword(userId: string, password: string): Promise<boolean> {
  const user = (await users().doc(userId).get()).data() as StaffUserRecord | undefined;
  return user !== undefined && (await verifyPassword(password, user.passwordHash));
}

/** Replaces a staff member's own password. Returns false if the current password is wrong. */
export async function changeOwnPassword(actor: Actor & { id: string }, current: string, next: string): Promise<boolean> {
  const ref = users().doc(actor.id);
  const user = (await ref.get()).data() as StaffUserRecord | undefined;
  if (!user || !(await verifyPassword(current, user.passwordHash))) return false;

  const batch = getDb().batch();
  batch.update(ref, { passwordHash: await hashPassword(next), mustChangePassword: false });
  const audit = newAuditEntry(actor, "auth.password_changed");
  batch.create(audit.ref, audit.data);
  await batch.commit();
  return true;
}

export async function listStaffUsers(): Promise<StaffUserSummary[]> {
  const snapshot = await users().get();
  return snapshot.docs
    .map((doc) => {
      const user = doc.data() as StaffUserRecord;
      return {
        id: doc.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        mustChangePassword: user.mustChangePassword,
        lastSignInAt: user.lastSignInAt,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Adds a staff user. Returns their temporary password, or null if the email is already in use. */
export async function createStaffUser(actor: Actor, input: NewStaffUser): Promise<string | null> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const ref = users().doc();

  const created = await getDb().runTransaction(async (tx) => {
    if (!(await tx.get(users().where("email", "==", input.email).limit(1))).empty) return false;
    tx.create(ref, newRecord(input, passwordHash, true));
    const audit = newAuditEntry(actor, "user.created", {
      targetUserId: ref.id,
      detail: `${input.name} (${input.email}), ${input.role}`,
    });
    tx.create(audit.ref, audit.data);
    return true;
  });
  return created ? temporaryPassword : null;
}

/** Issues a new temporary password and unlocks the account. Returns null if the user is missing. */
export async function resetStaffPassword(actor: Actor, userId: string): Promise<{ name: string; temporaryPassword: string } | null> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const ref = users().doc(userId);

  const name = await getDb().runTransaction(async (tx) => {
    const user = (await tx.get(ref)).data() as StaffUserRecord | undefined;
    if (!user) return null;
    tx.update(ref, { passwordHash, mustChangePassword: true, failedSignIns: 0, lockedUntil: null });
    const audit = newAuditEntry(actor, "user.password_reset", {
      targetUserId: userId,
      detail: `${user.name} (${user.email})`,
    });
    tx.create(audit.ref, audit.data);
    return user.name;
  });
  return name ? { name, temporaryPassword } : null;
}

/**
 * Changes whether a staff user can sign in, or their role. Returns false if nothing
 * changed, including when the change would leave the clinic with no active admin.
 */
export async function updateStaffUser(
  actor: Actor,
  userId: string,
  change: { active: boolean } | { role: StaffRole },
): Promise<boolean> {
  return getDb().runTransaction(async (tx) => {
    const everyone = await tx.get(users());
    const doc = everyone.docs.find((candidate) => candidate.id === userId);
    if (!doc) return false;
    const user = doc.data() as StaffUserRecord;
    const updated = { ...user, ...change };
    if (updated.active === user.active && updated.role === user.role) return false;

    const adminsLeft = everyone.docs.filter((candidate) => {
      const record = candidate.id === userId ? updated : (candidate.data() as StaffUserRecord);
      return record.active && record.role === "admin";
    });
    if (adminsLeft.length === 0) return false;

    tx.update(doc.ref, change);
    const who = `${user.name} (${user.email})`;
    const audit =
      "role" in change
        ? newAuditEntry(actor, "user.role_changed", { targetUserId: userId, detail: `${who}: ${user.role} to ${change.role}` })
        : newAuditEntry(actor, change.active ? "user.reactivated" : "user.deactivated", { targetUserId: userId, detail: who });
    tx.create(audit.ref, audit.data);
    return true;
  });
}
