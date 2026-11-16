/** Firestore collections for the clinic record. Amounts are integer cents. */
export const COLLECTIONS = {
  patients: "patients",
  accounts: "accounts",
  charges: "charges",
  payments: "payments",
  staffUsers: "staffUsers",
  staffSessions: "staffSessions",
  auditLog: "auditLog",
} as const;

export type PatientRecord = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  createdAt: string;
};

/** The document id is the account number printed on the statement. */
export type AccountRecord = {
  patientId: string;
  patientName: string;
  accountNumber: string;
  dateOfBirth: string;
  balanceCents: number;
  status: "open" | "closed";
  createdAt: string;
};

export type ChargeRecord = {
  accountId: string;
  description: string;
  amountCents: number;
  status: "unpaid" | "paid" | "void";
  createdAt: string;
  /** Set when the charge is voided. Charges voided before reasons were asked for have none. */
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
};

export type PaymentRecord = {
  accountId: string;
  amountCents: number;
  stripePaymentId: string;
  paidAt: string;
};

/** Admins manage staff users and read the audit log. Staff work with patients and charges. */
export type StaffRole = "admin" | "staff";

export type StaffUserRecord = {
  name: string;
  /** Lowercase. Staff sign in with it. */
  email: string;
  role: StaffRole;
  active: boolean;
  passwordHash: string;
  /** True while the password is one an admin issued. */
  mustChangePassword: boolean;
  failedSignIns: number;
  lockedUntil: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

/** The document id is the SHA-256 of the token in the staff member's cookie. */
export type StaffSessionRecord = {
  userId: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
};

export type AuditAction =
  | "auth.signed_in"
  | "auth.sign_in_failed"
  | "auth.signed_out"
  | "auth.password_changed"
  | "user.first_admin_created"
  | "user.created"
  | "user.password_reset"
  | "user.deactivated"
  | "user.reactivated"
  | "user.role_changed"
  | "patient.created"
  | "account.viewed"
  | "charge.posted"
  | "charge.voided"
  | "payment.recorded"
  | "records.exported";

/** One entry per event. The app only ever adds entries. */
export type AuditRecord = {
  at: string;
  /** Null when nobody was signed in, such as a failed sign-in or an online payment. */
  actorId: string | null;
  actorName: string;
  action: AuditAction;
  accountNumber?: string;
  targetUserId?: string;
  detail?: string;
};
