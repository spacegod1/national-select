"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { normalizeAccountNumber, normalizeDateOfBirth } from "@/lib/billing/lookup";
import { FLASH_COOKIE, FLASH_PATH, FLASH_SECONDS, type FlashCode } from "@/lib/staff/flash";
import { passwordProblem } from "@/lib/staff/passwords";
import { addCharge, createPatientAccount, voidCharge } from "@/lib/staff/records";
import {
  endAllSessionsFor,
  endStaffSession,
  getCurrentStaff,
  isSetupKeyConfigured,
  isSetupKeyValid,
  requireAdmin,
  requireStaff,
  startStaffSession,
} from "@/lib/staff/session";
import {
  authenticate,
  changeOwnPassword,
  createFirstAdmin,
  createStaffUser,
  hasStaffUsers,
  isOwnPassword,
  LOCK_MINUTES,
  MAX_FAILED_SIGN_INS,
  normalizeEmail,
  resetStaffPassword,
  updateStaffUser,
} from "@/lib/staff/users";
import { voidReasonProblem, voidReasonText } from "@/lib/staff/void-reasons";

export type StaffFormState = { error: string | null };

/** A temporary password, shown to the admin once and never stored in readable form. */
export type IssuedPassword = { name: string; password: string };
export type IssuedPasswordState = { error: string | null; issued: IssuedPassword | null };

const DATABASE_ERROR = "That couldn't be saved. The patient database didn't respond.";
const STAFF_DATABASE_ERROR = "That didn't work. The staff database didn't respond.";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/** Passwords are read as typed, including any spaces at either end. */
function secret(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

/**
 * Leaves a message for the page this action is about to send the person to, which
 * shows it as a toast. Only the message's code is stored, and the browser has to be
 * able to read it, so it is not an httpOnly cookie.
 */
async function flash(code: FlashCode): Promise<void> {
  (await cookies()).set(FLASH_COOKIE, code, {
    path: FLASH_PATH,
    maxAge: FLASH_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Reads an amount such as `149`, `149.5`, or `$1,249.00` as whole cents. */
function parseDollarsToCents(value: string): number | null {
  const match = /^\$?(\d{1,6})(?:\.(\d{1,2}))?$/.exec(value.replace(/,/g, ""));
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 ? cents : null;
}

const SETUP_KEY_MISSING = "Setup needs STAFF_PASSCODE in the server's environment. It is the setup key.";
const SETUP_KEY_WRONG = "That setup key isn't right.";
const SETUP_DONE = "Setup is already done. Sign in, or ask an admin to add you.";

function wrongOwnPassword(user: { mustChangePassword: boolean }): string {
  return user.mustChangePassword ? "That temporary password isn't right." : "Your current password isn't right.";
}

/** The first step of setup. The key is checked again when the admin is created. */
export async function checkSetupKey(setupKey: string): Promise<StaffFormState> {
  if (!isSetupKeyConfigured()) return { error: SETUP_KEY_MISSING };
  try {
    // Once setup is done this stops answering, so it can't be used to guess the key.
    if (await hasStaffUsers()) return { error: SETUP_DONE };
  } catch (error) {
    console.error("Staff: checking the setup key failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
  return { error: typeof setupKey === "string" && isSetupKeyValid(setupKey) ? null : SETUP_KEY_WRONG };
}

export async function setUpFirstAdmin(_previous: StaffFormState, formData: FormData): Promise<StaffFormState> {
  if (!isSetupKeyConfigured()) return { error: SETUP_KEY_MISSING };

  const name = field(formData, "name");
  const email = normalizeEmail(field(formData, "email"));
  const password = secret(formData, "password");

  if (!isSetupKeyValid(field(formData, "setupKey"))) return { error: SETUP_KEY_WRONG };
  if (!name || name.length > 80) return { error: "Enter your name." };
  if (!email) return { error: "That email address doesn't look right." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== secret(formData, "confirmPassword")) return { error: "The two passwords don't match." };

  let userId: string | null;
  try {
    userId = await createFirstAdmin(name, email, password);
    if (userId) await startStaffSession(userId);
  } catch (error) {
    console.error("Staff: creating the first admin failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
  if (!userId) return { error: SETUP_DONE };
  await flash("admin-created");
  redirect("/staff");
}

export async function signIn(_previous: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const email = normalizeEmail(field(formData, "email"));
  const password = secret(formData, "password");
  const wrong = {
    error: `That email or password isn't right. ${MAX_FAILED_SIGN_INS} wrong passwords in a row lock an account for ${LOCK_MINUTES} minutes.`,
  };
  if (!email || !password || password.length > 128) return wrong;

  try {
    const user = await authenticate(email, password);
    if (!user?.id) return wrong;
    await startStaffSession(user.id);
  } catch (error) {
    console.error("Staff: signing in failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
  await flash("signed-in");
  redirect("/staff");
}

export async function signOut(): Promise<void> {
  const user = await getCurrentStaff();
  await endStaffSession();
  if (user) await recordAudit(user, "auth.signed_out");
  await flash("signed-out");
  redirect("/staff/login");
}

/** The first step of changing a password. The password is checked again when the new one is saved. */
export async function checkOwnPassword(password: string): Promise<StaffFormState> {
  const user = await requireStaff({ allowIssuedPassword: true });
  if (typeof password !== "string" || !password || password.length > 128) return { error: wrongOwnPassword(user) };

  try {
    return { error: (await isOwnPassword(user.id, password)) ? null : wrongOwnPassword(user) };
  } catch (error) {
    console.error("Staff: checking a password failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
}

export async function changePassword(_previous: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const user = await requireStaff({ allowIssuedPassword: true });

  const next = secret(formData, "newPassword");
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (next !== secret(formData, "confirmPassword")) return { error: "The two new passwords don't match." };
  if (next === secret(formData, "currentPassword")) return { error: "Choose a password you haven't been using." };

  try {
    if (!(await changeOwnPassword(user, secret(formData, "currentPassword"), next))) {
      return { error: wrongOwnPassword(user) };
    }
    // Sign out every browser that knew the old password, then sign this one back in.
    await endAllSessionsFor(user.id);
    await startStaffSession(user.id);
  } catch (error) {
    console.error("Staff: changing a password failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
  await flash("password-saved");
  redirect("/staff");
}

export async function addStaffUser(_previous: IssuedPasswordState, formData: FormData): Promise<IssuedPasswordState> {
  const admin = await requireAdmin();

  const name = field(formData, "name");
  const email = normalizeEmail(field(formData, "email"));
  const role = field(formData, "role");

  if (!name || name.length > 80) return { error: "Enter the staff member's name.", issued: null };
  if (!email) return { error: "That email address doesn't look right.", issued: null };
  if (role !== "admin" && role !== "staff") return { error: "Choose a role.", issued: null };

  let password: string | null;
  try {
    password = await createStaffUser(admin, { name, email, role });
  } catch (error) {
    console.error("Staff: adding a staff user failed", error);
    return { error: STAFF_DATABASE_ERROR, issued: null };
  }
  if (!password) return { error: "A staff user with that email already exists.", issued: null };

  revalidatePath("/staff/users");
  return { error: null, issued: { name, password } };
}

export async function resetPassword(_previous: IssuedPasswordState, formData: FormData): Promise<IssuedPasswordState> {
  const admin = await requireAdmin();

  const userId = field(formData, "userId");
  if (!userId || userId === admin.id) {
    return { error: "Use Change password to change your own password.", issued: null };
  }

  try {
    const reset = await resetStaffPassword(admin, userId);
    if (!reset) return { error: "That staff user no longer exists.", issued: null };
    await endAllSessionsFor(userId);
    revalidatePath("/staff/users");
    return { error: null, issued: { name: reset.name, password: reset.temporaryPassword } };
  } catch (error) {
    console.error("Staff: resetting a password failed", error);
    return { error: STAFF_DATABASE_ERROR, issued: null };
  }
}

const OWN_ACCOUNT = "You can't change your own account here. Another admin can.";
/** Why a change to a staff user didn't happen, when the database says nothing changed. */
const NOTHING_CHANGED = "Nothing was changed. They may already be set that way, or they are the only active admin.";

/** Admins change other people. Nobody deactivates or demotes themselves. */
export async function setUserActive(formData: FormData): Promise<StaffFormState> {
  const admin = await requireAdmin();

  const userId = field(formData, "userId");
  const active = field(formData, "active") === "true";
  if (!userId || userId === admin.id) return { error: OWN_ACCOUNT };

  let changed: boolean;
  try {
    changed = await updateStaffUser(admin, userId, { active });
    if (changed && !active) await endAllSessionsFor(userId);
  } catch (error) {
    console.error("Staff: changing whether a staff user is active failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
  revalidatePath("/staff/users");
  return { error: changed ? null : NOTHING_CHANGED };
}

export async function setUserRole(formData: FormData): Promise<StaffFormState> {
  const admin = await requireAdmin();

  const userId = field(formData, "userId");
  const role = field(formData, "role");
  if (!userId || userId === admin.id) return { error: OWN_ACCOUNT };
  if (role !== "admin" && role !== "staff") return { error: "Choose a role." };

  let changed: boolean;
  try {
    changed = await updateStaffUser(admin, userId, { role });
  } catch (error) {
    console.error("Staff: changing a staff user's role failed", error);
    return { error: STAFF_DATABASE_ERROR };
  }
  revalidatePath("/staff/users");
  return { error: changed ? null : NOTHING_CHANGED };
}

export async function createPatient(_previous: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const user = await requireStaff();

  const firstName = field(formData, "firstName");
  const lastName = field(formData, "lastName");
  const dateOfBirth = normalizeDateOfBirth(field(formData, "dateOfBirth"));
  const phone = field(formData, "phone");
  const email = field(formData, "email");

  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80) {
    return { error: "Enter the patient's first and last name." };
  }
  if (!dateOfBirth || dateOfBirth > new Date().toISOString().slice(0, 10)) {
    return { error: "Enter a valid date of birth." };
  }
  if (phone.length > 30) {
    return { error: "That phone number is too long." };
  }
  if (email && (!email.includes("@") || email.length > 200)) {
    return { error: "That email address doesn't look right." };
  }

  let accountNumber: string;
  try {
    accountNumber = await createPatientAccount(user, { firstName, lastName, dateOfBirth, phone, email });
  } catch (error) {
    console.error("Staff: creating a patient account failed", error);
    return { error: DATABASE_ERROR };
  }
  await flash("patient-created");
  redirect(`/staff/accounts/${accountNumber}`);
}

export async function postCharge(_previous: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const user = await requireStaff();

  const accountNumber = normalizeAccountNumber(field(formData, "accountNumber"));
  const description = field(formData, "description");
  const amountCents = parseDollarsToCents(field(formData, "amount"));

  if (!accountNumber) return { error: "This account number isn't valid." };
  if (!description || description.length > 200) return { error: "Describe the charge." };
  if (amountCents === null) return { error: "Enter an amount greater than zero, such as 149.00." };

  let posted: boolean;
  try {
    posted = await addCharge(user, accountNumber, description, amountCents);
  } catch (error) {
    console.error("Staff: posting a charge failed", error);
    return { error: DATABASE_ERROR };
  }
  if (!posted) return { error: "This account no longer exists." };

  revalidatePath(`/staff/accounts/${accountNumber}`);
  return { error: null };
}

/** Voids an unpaid charge. Staff say why, and the reason is kept with the charge and in the activity log. */
export async function removeCharge(_previous: StaffFormState, formData: FormData): Promise<StaffFormState> {
  const user = await requireStaff();

  const accountNumber = normalizeAccountNumber(field(formData, "accountNumber"));
  const chargeId = field(formData, "chargeId");
  const reasonId = field(formData, "reason");
  const note = field(formData, "note");

  if (!accountNumber || !/^[A-Za-z0-9]{1,64}$/.test(chargeId)) return { error: "This charge can't be found." };
  const problem = voidReasonProblem(reasonId, note);
  if (problem) return { error: problem };

  let voided: boolean;
  try {
    voided = await voidCharge(user, accountNumber, chargeId, voidReasonText(reasonId, note));
  } catch (error) {
    console.error("Staff: voiding a charge failed", error);
    return { error: DATABASE_ERROR };
  }

  revalidatePath(`/staff/accounts/${accountNumber}`);
  return { error: voided ? null : "This charge has already been paid or voided." };
}
