import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type StaffRole,
  type StaffSessionRecord,
  type StaffUserRecord,
} from "@/lib/firebase/collections";

const COOKIE_NAME = "staff_session";
const COOKIE_PATH = "/staff";

/** A session ends this long after sign-in, however active it is. */
const SESSION_SECONDS = 60 * 60 * 8;
/** A session also ends after this long with no activity. */
const IDLE_MS = 30 * 60 * 1000;
/** Activity is written to the session at most this often. */
const TOUCH_MS = 5 * 60 * 1000;

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  mustChangePassword: boolean;
};

/** Only the hash of the cookie token is stored, so a database reader can't reuse a session. */
function sessionDocId(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessions() {
  return getDb().collection(COLLECTIONS.staffSessions);
}

function isLive(session: StaffSessionRecord, now: number): boolean {
  return Date.parse(session.expiresAt) > now && now - Date.parse(session.lastSeenAt) <= IDLE_MS;
}

function setupKey(): string | null {
  return process.env.STAFF_PASSCODE?.trim() || null;
}

/** The setup key is `STAFF_PASSCODE`. It is only used to create the first admin. */
export function isSetupKeyConfigured(): boolean {
  return setupKey() !== null;
}

export function isSetupKeyValid(input: string): boolean {
  const expected = setupKey();
  if (!expected) return false;
  // Hashing first gives both sides the same length, which timingSafeEqual needs.
  const left = createHash("sha256").update(input.trim()).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

/** Signs a staff member in on this browser. Call from a server action. */
export async function startStaffSession(userId: string): Promise<void> {
  const now = Date.now();
  const token = randomBytes(32).toString("base64url");
  const session: StaffSessionRecord = {
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_SECONDS * 1000).toISOString(),
    lastSeenAt: new Date(now).toISOString(),
  };

  // Clear out this person's sessions that have already ended.
  const existing = await sessions().where("userId", "==", userId).get();
  const batch = getDb().batch();
  for (const doc of existing.docs) {
    if (!isLive(doc.data() as StaffSessionRecord, now)) batch.delete(doc.ref);
  }
  batch.create(sessions().doc(sessionDocId(token)), session);
  await batch.commit();

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_SECONDS,
  });
}

/** Signs this browser out. Call from a server action. */
export async function endStaffSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  store.set(COOKIE_NAME, "", { httpOnly: true, path: COOKIE_PATH, maxAge: 0 });
  if (token) await sessions().doc(sessionDocId(token)).delete();
}

/** Ends every session a staff member has, on every browser. */
export async function endAllSessionsFor(userId: string): Promise<void> {
  const existing = await sessions().where("userId", "==", userId).get();
  if (existing.empty) return;
  const batch = getDb().batch();
  for (const doc of existing.docs) batch.delete(doc.ref);
  await batch.commit();
}

/** The signed-in staff member, or null. Looked up once per request. */
export const getCurrentStaff = cache(async (): Promise<StaffUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;

  const sessionRef = sessions().doc(sessionDocId(token));
  const session = (await sessionRef.get()).data() as StaffSessionRecord | undefined;
  if (!session) return null;

  const now = Date.now();
  if (!isLive(session, now)) {
    await sessionRef.delete();
    return null;
  }

  const userSnap = await getDb().collection(COLLECTIONS.staffUsers).doc(session.userId).get();
  const user = userSnap.data() as StaffUserRecord | undefined;
  if (!user || !user.active) {
    await sessionRef.delete();
    return null;
  }

  if (now - Date.parse(session.lastSeenAt) > TOUCH_MS) {
    await sessionRef.update({ lastSeenAt: new Date(now).toISOString() });
  }

  return {
    id: userSnap.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
});

/**
 * Call at the top of every staff page and every staff action.
 * Someone still on an admin-issued password is sent to choose their own first.
 */
export async function requireStaff(options: { allowIssuedPassword?: boolean } = {}): Promise<StaffUser> {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (user.mustChangePassword && !options.allowIssuedPassword) redirect("/staff/password");
  return user;
}

/** Call at the top of every admin-only page and action. */
export async function requireAdmin(): Promise<StaffUser> {
  const user = await requireStaff();
  if (user.role !== "admin") redirect("/staff");
  return user;
}
