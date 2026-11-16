"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

/* ------------------------------------------------------------------
   Made-up clinic data. No real patients, staff or payments.
   Times are clinic-local strings so the server and browser print the same thing.
   ------------------------------------------------------------------ */

export const TODAY = "2026-11-15";
export const TODAY_LABEL = "Sunday, Nov 15";
export const ME = { id: "me", name: "Michael Asiedu Johnson", first: "Michael", role: "Admin" };

export type ChargeStatus = "unpaid" | "paid" | "void";
export type Charge = { id: string; at: string; description: string; amountCents: number; status: ChargeStatus };
export type Payment = { id: string; at: string; amountCents: number; reference: string };
export type Account = {
  accountNumber: string;
  patientName: string;
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
  charges: Charge[];
  payments: Payment[];
};
export type StaffStatus = "active" | "temporary" | "deactivated";
export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  status: StaffStatus;
  lastSignIn: string | null;
};
export type Entry = { id: string; at: string; who: string; what: string; accountNumber?: string; detail?: string };

const SEED_ACCOUNTS: Account[] = [
  {
    accountNumber: "NS-861355",
    patientName: "Thomas Whitfield",
    dateOfBirth: "1961-01-30",
    phone: "(301) 555-0188",
    email: "t.whitfield@example.com",
    charges: [
      { id: "c1", at: "2026-11-15T08:31", description: "Tetanus booster", amountCents: 5500, status: "void" },
      { id: "c2", at: "2026-11-15T08:30", description: "Laceration repair, simple", amountCents: 22000, status: "unpaid" },
      { id: "c3", at: "2026-11-15T08:05", description: "Urgent care visit", amountCents: 14900, status: "unpaid" },
    ],
    payments: [],
  },
  {
    accountNumber: "NS-346091",
    patientName: "Hannah Kowalczyk",
    dateOfBirth: "1996-12-03",
    phone: "(240) 555-0131",
    email: null,
    charges: [{ id: "c4", at: "2026-11-15T10:47", description: "DOT physical", amountCents: 9500, status: "unpaid" }],
    payments: [],
  },
  {
    accountNumber: "NS-418207",
    patientName: "Amara Okafor",
    dateOfBirth: "1988-03-22",
    phone: "(301) 555-0117",
    email: "amara.okafor@example.com",
    charges: [
      { id: "c5", at: "2026-11-14T09:40", description: "Rapid strep test", amountCents: 3500, status: "unpaid" },
      { id: "c6", at: "2026-11-14T09:12", description: "Urgent care visit", amountCents: 14900, status: "unpaid" },
    ],
    payments: [],
  },
  {
    accountNumber: "NS-195723",
    patientName: "Grace Mensah",
    dateOfBirth: "2001-09-08",
    phone: null,
    email: "grace.mensah@example.com",
    charges: [{ id: "c7", at: "2026-11-12T15:20", description: "Lab panel, basic metabolic", amountCents: 4800, status: "paid" }],
    payments: [{ id: "p1", at: "2026-11-13T07:58", amountCents: 4800, reference: "pi_3QK8mT2eZvKYlo2C" }],
  },
  {
    accountNumber: "NS-274610",
    patientName: "Priya Natarajan",
    dateOfBirth: "1992-07-15",
    phone: "(301) 555-0164",
    email: "priya.n@example.com",
    charges: [
      { id: "c8", at: "2026-11-10T11:32", description: "X-ray, wrist, 2 views", amountCents: 9500, status: "unpaid" },
      { id: "c9", at: "2026-11-10T11:05", description: "Urgent care visit", amountCents: 14900, status: "unpaid" },
      { id: "c10", at: "2026-10-02T16:10", description: "Flu vaccine", amountCents: 4000, status: "paid" },
    ],
    payments: [{ id: "p2", at: "2026-10-04T20:15", amountCents: 4000, reference: "pi_3QB1xR2eZvKYlo2C" }],
  },
  {
    accountNumber: "NS-659812",
    patientName: "Samuel Addo",
    dateOfBirth: "1970-04-11",
    phone: "(240) 555-0109",
    email: "samuel.addo@example.com",
    charges: [
      { id: "c11", at: "2026-11-08T13:48", description: "EKG", amountCents: 7500, status: "paid" },
      { id: "c12", at: "2026-11-08T13:20", description: "Urgent care visit", amountCents: 14900, status: "paid" },
    ],
    payments: [{ id: "p3", at: "2026-11-09T18:41", amountCents: 22400, reference: "pi_3QJ4dU2eZvKYlo2C" }],
  },
  {
    accountNumber: "NS-530944",
    patientName: "Daniel Reyes",
    dateOfBirth: "1975-11-02",
    phone: "(301) 555-0172",
    email: null,
    charges: [{ id: "c13", at: "2026-11-03T10:15", description: "Sports physical", amountCents: 6500, status: "paid" }],
    payments: [{ id: "p4", at: "2026-11-05T19:22", amountCents: 6500, reference: "pi_3QH7aP2eZvKYlo2C" }],
  },
  {
    accountNumber: "NS-702468",
    patientName: "Luis Ortega",
    dateOfBirth: "1983-05-19",
    phone: "(240) 555-0153",
    email: "luis.ortega@example.com",
    charges: [{ id: "c14", at: "2026-10-21T14:02", description: "Urgent care visit", amountCents: 14900, status: "unpaid" }],
    payments: [],
  },
];

const SEED_STAFF: StaffMember[] = [
  { id: "me", name: ME.name, email: "michael@nationalselect.example", role: "admin", status: "active", lastSignIn: "2026-11-15T17:02" },
  { id: "s2", name: "Abena Darko", email: "abena.darko@nationalselect.example", role: "staff", status: "active", lastSignIn: "2026-11-15T07:48" },
  { id: "s3", name: "Kevin Liu", email: "kevin.liu@nationalselect.example", role: "admin", status: "active", lastSignIn: "2026-11-14T16:20" },
  { id: "s4", name: "Rosa Jimenez", email: "rosa.jimenez@nationalselect.example", role: "staff", status: "temporary", lastSignIn: null },
  { id: "s5", name: "Brian Halloran", email: "brian.halloran@nationalselect.example", role: "staff", status: "deactivated", lastSignIn: "2026-09-30T18:05" },
];

const SEED_LOG: Entry[] = [
  { id: "e1", at: "2026-11-15T17:02", who: ME.name, what: "Signed in" },
  { id: "e2", at: "2026-11-15T10:47", who: "Abena Darko", what: "Posted a charge", accountNumber: "NS-346091", detail: "DOT physical, $95.00" },
  { id: "e3", at: "2026-11-15T10:45", who: "Abena Darko", what: "Opened a patient account", accountNumber: "NS-346091" },
  { id: "e4", at: "2026-11-15T08:33", who: "Abena Darko", what: "Voided a charge", accountNumber: "NS-861355", detail: "Tetanus booster, $55.00" },
  { id: "e5", at: "2026-11-15T08:30", who: "Abena Darko", what: "Posted a charge", accountNumber: "NS-861355", detail: "Laceration repair, simple, $220.00" },
  { id: "e6", at: "2026-11-15T08:05", who: "Abena Darko", what: "Posted a charge", accountNumber: "NS-861355", detail: "Urgent care visit, $149.00" },
  { id: "e7", at: "2026-11-15T07:48", who: "Abena Darko", what: "Signed in" },
  { id: "e8", at: "2026-11-14T16:31", who: "Kevin Liu", what: "Added a staff user", detail: "Rosa Jimenez (rosa.jimenez@nationalselect.example), staff" },
  { id: "e9", at: "2026-11-14T09:40", who: "Kevin Liu", what: "Posted a charge", accountNumber: "NS-418207", detail: "Rapid strep test, $35.00" },
  { id: "e10", at: "2026-11-13T07:58", who: "Online payment", what: "Recorded a payment", accountNumber: "NS-195723", detail: "$48.00" },
  { id: "e11", at: "2026-11-12T21:14", who: "Not signed in", what: "Sign-in failed", detail: "Wrong password for Brian Halloran" },
];

/* ------------------------------------------------------------------
   Formatting and sums
   ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** `1988-03-22` as `03/22/1988`. */
export function fullDate(iso: string): string {
  return `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`;
}

/** `2026-11-14T09:40` as `Nov 14`. */
export function shortDate(iso: string): string {
  return `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;
}

export function clock(iso: string): string {
  const hour = Number(iso.slice(11, 13));
  return `${hour % 12 || 12}:${iso.slice(14, 16)} ${hour < 12 ? "AM" : "PM"}`;
}

/** `Today, 8:30 AM` or `Nov 14, 9:40 AM`. */
export function stamp(iso: string): string {
  return `${iso.slice(0, 10) === TODAY ? "Today" : shortDate(iso)}, ${clock(iso)}`;
}

export function daysAgo(iso: string): number {
  return Math.round((Date.parse(TODAY) - Date.parse(iso.slice(0, 10))) / 86_400_000);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function balanceOf(account: Account): number {
  return account.charges.reduce((sum, charge) => (charge.status === "unpaid" ? sum + charge.amountCents : sum), 0);
}

/** When the oldest unpaid charge was posted, or null if nothing is owed. */
export function owingSince(account: Account): string | null {
  const unpaid = account.charges.filter((charge) => charge.status === "unpaid").map((charge) => charge.at);
  return unpaid.length > 0 ? unpaid.sort()[0] : null;
}

export function lastActivity(account: Account): string | null {
  const times = [...account.charges.map((charge) => charge.at), ...account.payments.map((payment) => payment.at)];
  return times.length > 0 ? times.sort()[times.length - 1] : null;
}

export function matches(account: Account, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    account.patientName.toLowerCase().includes(q) ||
    account.accountNumber.toLowerCase().replace("-", "").includes(q.replace(/[-\s]/g, ""))
  );
}

export function statsOf(accounts: Account[]) {
  const weekStart = "2026-11-09";
  let outstandingCents = 0;
  let owing = 0;
  let paidThisWeekCents = 0;
  let chargesToday = 0;
  for (const account of accounts) {
    const balance = balanceOf(account);
    outstandingCents += balance;
    if (balance > 0) owing += 1;
    for (const payment of account.payments) {
      if (payment.at.slice(0, 10) >= weekStart) paidThisWeekCents += payment.amountCents;
    }
    for (const charge of account.charges) {
      if (charge.at.slice(0, 10) === TODAY && charge.status !== "void") chargesToday += 1;
    }
  }
  return { outstandingCents, owing, total: accounts.length, paidThisWeekCents, chargesToday };
}

/** Reads `149`, `149.5` or `$1,249.00` as whole cents. */
function parseAmount(value: string): number | null {
  const match = /^\$?(\d{1,6})(?:\.(\d{1,2}))?$/.exec(value.trim().replace(/,/g, ""));
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 ? cents : null;
}

/* ------------------------------------------------------------------
   Stand-in for the server. Everything is held in memory and resets on reload.
   ------------------------------------------------------------------ */

export type NewPatient = { firstName: string; lastName: string; dateOfBirth: string; phone: string; email: string };

function usePortal() {
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS);
  const [staff, setStaff] = useState(SEED_STAFF);
  const [log, setLog] = useState(SEED_LOG);
  const counter = useRef(0);

  /** A pretend clock: each thing done in the prototype happens a minute after the last. */
  function next(): { id: string; at: string } {
    counter.current += 1;
    const minute = Math.min(2 + counter.current, 59);
    return { id: `n${counter.current}`, at: `${TODAY}T17:${String(minute).padStart(2, "0")}` };
  }

  function record(id: string, at: string, what: string, extra: { accountNumber?: string; detail?: string } = {}) {
    setLog((entries) => [{ id: `e-${id}`, at, who: ME.name, what, ...extra }, ...entries]);
  }

  return {
    accounts,
    staff,
    log,
    stats: statsOf(accounts),

    openAccount(accountNumber: string) {
      const { id, at } = next();
      record(id, at, "Opened a patient account", { accountNumber });
    },

    postCharge(accountNumber: string, description: string, amountCents: number) {
      const { id, at } = next();
      const charge: Charge = { id: `c-${id}`, at, description, amountCents, status: "unpaid" };
      setAccounts((all) =>
        all.map((account) =>
          account.accountNumber === accountNumber ? { ...account, charges: [charge, ...account.charges] } : account,
        ),
      );
      record(id, at, "Posted a charge", { accountNumber, detail: `${description}, ${dollars(amountCents)}` });
    },

    voidCharge(accountNumber: string, charge: Charge) {
      const { id, at } = next();
      setAccounts((all) =>
        all.map((account) =>
          account.accountNumber === accountNumber
            ? {
                ...account,
                charges: account.charges.map((item) => (item.id === charge.id ? { ...item, status: "void" as const } : item)),
              }
            : account,
        ),
      );
      record(id, at, "Voided a charge", { accountNumber, detail: `${charge.description}, ${dollars(charge.amountCents)}` });
    },

    addPatient(input: NewPatient): string {
      const { id, at } = next();
      const accountNumber = `NS-${Math.floor(100000 + Math.random() * 900000)}`;
      const account: Account = {
        accountNumber,
        patientName: `${input.firstName} ${input.lastName}`,
        dateOfBirth: input.dateOfBirth,
        phone: input.phone || null,
        email: input.email || null,
        charges: [],
        payments: [],
      };
      setAccounts((all) => [account, ...all]);
      record(id, at, "Created a patient account", { accountNumber });
      return accountNumber;
    },

    /** Returns the temporary password to hand over. */
    addStaff(name: string, email: string, role: "admin" | "staff"): string {
      const { id, at } = next();
      setStaff((all) => [...all, { id: `s-${id}`, name, email, role, status: "temporary", lastSignIn: null }]);
      record(id, at, "Added a staff user", { detail: `${name} (${email}), ${role}` });
      return temporaryPassword();
    },

    resetStaffPassword(member: StaffMember): string {
      const { id, at } = next();
      // A reset doesn't let a deactivated person back in.
      setStaff((all) =>
        all.map((item) =>
          item.id === member.id && item.status !== "deactivated" ? { ...item, status: "temporary" as const } : item,
        ),
      );
      record(id, at, "Reset a password", { detail: `${member.name} (${member.email})` });
      return temporaryPassword();
    },

    toggleStaffRole(member: StaffMember) {
      const { id, at } = next();
      const role = member.role === "admin" ? ("staff" as const) : ("admin" as const);
      setStaff((all) => all.map((item) => (item.id === member.id ? { ...item, role } : item)));
      record(id, at, "Changed a role", { detail: `${member.name}: ${member.role} to ${role}` });
    },

    toggleStaffActive(member: StaffMember) {
      const { id, at } = next();
      const status = member.status === "deactivated" ? ("active" as const) : ("deactivated" as const);
      setStaff((all) => all.map((item) => (item.id === member.id ? { ...item, status } : item)));
      record(id, at, status === "active" ? "Reactivated a staff user" : "Deactivated a staff user", {
        detail: `${member.name} (${member.email})`,
      });
    },
  };
}

export type Portal = ReturnType<typeof usePortal>;

function temporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const group = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return [group(), group(), group(), group()].join("-");
}

/* ------------------------------------------------------------------
   Where the person is in the portal
   ------------------------------------------------------------------ */

export type View =
  | { name: "accounts" }
  | { name: "account"; accountNumber: string }
  | { name: "new" }
  | { name: "users" }
  | { name: "activity"; accountNumber?: string }
  | { name: "password" }
  | { name: "signedOut" };

export type Section = "accounts" | "new" | "users" | "activity";

export const NAV: { id: Section; label: string; icon: IconName }[] = [
  { id: "accounts", label: "Accounts", icon: "accounts" },
  { id: "new", label: "New patient", icon: "plus" },
  { id: "users", label: "Users", icon: "users" },
  { id: "activity", label: "Activity", icon: "activity" },
];

export type Go = (view: View) => void;

/**
 * `inline` is for a design that opens an account in place, so moving between
 * the list and an account doesn't send the page back to the top.
 */
export function usePortalView(options: { inline?: boolean } = {}) {
  const portal = usePortal();
  const [view, setView] = useState<View>({ name: "accounts" });
  const scroller = useRef<HTMLElement | null>(null);

  const go: Go = (target) => {
    const sameAccount = view.name === "account" && target.name === "account" && view.accountNumber === target.accountNumber;
    if (target.name === "account" && !sameAccount) portal.openAccount(target.accountNumber);
    const inAccounts = (candidate: View) => candidate.name === "accounts" || candidate.name === "account";
    if (!(options.inline && inAccounts(view) && inAccounts(target))) scroller.current?.scrollTo({ top: 0 });
    setView(target);
  };

  const account =
    view.name === "account" ? (portal.accounts.find((item) => item.accountNumber === view.accountNumber) ?? null) : null;
  const section: Section | null =
    view.name === "account" ? "accounts" : view.name === "password" || view.name === "signedOut" ? null : view.name;

  return {
    portal,
    view,
    go,
    account,
    section,
    /** Put on whichever element scrolls the page content. */
    scrollRef: (element: HTMLElement | null) => {
      scroller.current = element;
    },
  };
}

/* ------------------------------------------------------------------
   Small pieces every design uses
   ------------------------------------------------------------------ */

const ICONS = {
  accounts:
    "M3 6.5A1.5 1.5 0 014.5 5h3.2l1.6 1.8h6.2A1.5 1.5 0 0117 8.3v6.2a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5z",
  plus: "M10 4v12M4 10h12",
  users:
    "M7.5 9a2.75 2.75 0 100-5.5A2.75 2.75 0 007.5 9zM2.5 16.5c0-2.6 2.2-4.5 5-4.5s5 1.9 5 4.5M13.5 9.2a2.4 2.4 0 000-4.7M14.8 12.3c1.7.5 2.7 2 2.7 4.2",
  activity: "M2.5 10h3.2l2-5.5 4 11 2-5.5h3.8",
  search: "M9 15A6 6 0 109 3a6 6 0 000 12zM13.5 13.5L17 17",
  back: "M12 4.5L6.5 10l5.5 5.5",
  forward: "M8 4.5l5.5 5.5L8 15.5",
  out: "M8 4H5.5A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8M12.5 6.5L16 10l-3.5 3.5M16 10H8",
  lock: "M5.5 9h9v7.5h-9zM7.5 9V6.5a2.5 2.5 0 015 0V9",
  card: "M3 5.5h14v9H3zM3 8.75h14",
  receipt: "M6 3.5h8v13l-2-1.3-2 1.3-2-1.3-2 1.3zM8.3 7.5h3.4M8.3 10.5h3.4",
  menu: "M3.5 6h13M3.5 10h13M3.5 14h13",
  close: "M5 5l10 10M15 5L5 15",
  phone:
    "M6.2 3.5h2l1 3.2-1.6 1.1a8.2 8.2 0 004.6 4.6l1.1-1.6 3.2 1v2a1.6 1.6 0 01-1.7 1.6A12.3 12.3 0 014.6 5.2 1.6 1.6 0 016.2 3.5z",
  mail: "M3 5.5h14v9H3zM3.5 6l6.5 5 6.5-5",
  calendar: "M4 5.5h12v10.5H4zM4 8.8h12M7 3.5v3M13 3.5v3",
  check: "M4.5 10.5l3.5 3.5 7.5-8",
  down: "M5.5 8l4.5 4.5L14.5 8",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ light = false, className = "h-9 w-auto" }: { light?: boolean; className?: string }) {
  return (
    <Image
      src={light ? "/logo-light.png" : "/logo.png"}
      alt="National Select Urgent Care"
      width={106}
      height={46}
      className={className}
    />
  );
}

/* Photos the site already has, and where to crop each one when it sits in a
   wide band behind a heading. The front desk photo is cropped below the sign
   on its back wall, which names a different clinic. */
export type Art = { src: string; position: string; eyebrow: string };

export const ART = {
  home: { src: "/clinic_front_desk.png", position: "50% 70%", eyebrow: "Front desk" },
  new: { src: "/clinician_consultation.png", position: "50% 36%", eyebrow: "Front desk" },
  users: { src: "/doctors-meeting.jpg", position: "50% 32%", eyebrow: "Team" },
  activity: { src: "/doctor-writing-notes.jpg", position: "50% 55%", eyebrow: "Audit log" },
  password: { src: "/stethoscope_desk.png", position: "50% 38%", eyebrow: "Your account" },
} satisfies Record<string, Art>;

/** A decorative photo that fills its positioned parent. Pass `position`, or crop with a class. */
export function Photo({
  src,
  sizes,
  position,
  className = "",
}: {
  src: string;
  sizes: string;
  position?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}

const AVATAR_TINTS = [
  "bg-panel text-ink",
  "bg-pink text-pink-ink",
  "bg-[#e2f1e7] text-[#22693a]",
  "bg-[#fbf0dc] text-[#7a5310]",
  "bg-slate-chip text-ink",
];

/** Initials on a soft tint. The same name always gets the same tint. */
export function Avatar({ name, className = "h-9 w-9 text-[12.5px]" }: { name: string; className?: string }) {
  const sum = [...name].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center rounded-full font-bold ${AVATAR_TINTS[sum % AVATAR_TINTS.length]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

const CHIP_TONES = {
  due: "bg-pink text-pink-ink",
  ok: "bg-open/15 text-[#22693a]",
  off: "bg-line-soft text-muted",
  info: "bg-panel text-ink",
} as const;

export function Chip({ tone, children }: { tone: keyof typeof CHIP_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12.5px] font-semibold ${CHIP_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function ChargeChip({ status }: { status: ChargeStatus }) {
  if (status === "unpaid") return <Chip tone="due">Unpaid</Chip>;
  return status === "paid" ? <Chip tone="ok">Paid</Chip> : <Chip tone="off">Void</Chip>;
}

/** Class names a design hands to the shared forms and screens so they wear its look. */
export type Skin = {
  title: string;
  lead: string;
  card: string;
  heading: string;
  /** A `<label>` that stacks its text above its field. */
  label: string;
  input: string;
  primary: string;
  /** A text-only button. */
  quiet: string;
  /** The box around a list of rows. */
  list: string;
  row: string;
  meta: string;
  code: string;
  /** Replaces the plain title and intro at the top of New patient, Users and Activity. */
  head?: (info: { art: Art; title: string; lead: string }) => ReactNode;
};

function Head({ skin, art, title, lead }: { skin: Skin; art: Art; title: string; lead: string }) {
  if (skin.head) return <>{skin.head({ art, title, lead })}</>;
  return (
    <>
      <h1 className={skin.title}>{title}</h1>
      <p className={skin.lead}>{lead}</p>
    </>
  );
}

export function ChargeForm({
  skin,
  onPost,
  className = "",
}: {
  skin: Skin;
  onPost: (description: string, amountCents: number) => void;
  className?: string;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const amountCents = parseAmount(amount);
    if (!description.trim()) return setError("Describe the charge.");
    if (amountCents === null) return setError("Enter an amount greater than zero, such as 149.00.");
    onPost(description.trim(), amountCents);
    setDescription("");
    setAmount("");
    setError(null);
  }

  return (
    <form onSubmit={submit} className={`@container ${className}`} noValidate>
      {/* Laid out by the room the form has, not the window: it sits in panes of very different widths. */}
      <div className="grid gap-3 @lg:grid-cols-[minmax(0,1fr)_130px_auto] @lg:items-end">
        <label className={skin.label}>
          Charge
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Urgent care visit"
            maxLength={200}
            autoComplete="off"
            className={skin.input}
          />
        </label>
        <label className={skin.label}>
          Amount ($)
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="149.00"
            autoComplete="off"
            className={skin.input}
          />
        </label>
        <button type="submit" className={skin.primary}>
          Post charge
        </button>
      </div>
      {error ? (
        <p role="alert" className="portal-fade mt-2.5 text-[14px] text-brand-dark">
          {error}
        </p>
      ) : null}
    </form>
  );
}

/** Charges as plain rows. Designs that show charges another way don't use this. */
export function ChargeList({ skin, account, portal }: { skin: Skin; account: Account; portal: Portal }) {
  if (account.charges.length === 0) {
    return <p className={`${skin.card} text-muted`}>No charges posted to this account yet.</p>;
  }
  return (
    <ul className={`@container ${skin.list}`}>
      {account.charges.map((charge) => (
        <li key={charge.id} className={`${skin.row} flex flex-wrap items-center gap-x-4 gap-y-1.5`}>
          <span className="min-w-0 flex-1 @max-md:basis-full">
            <span className="block">{charge.description}</span>
            <span className={skin.meta}>{stamp(charge.at)}</span>
          </span>
          <ChargeChip status={charge.status} />
          <span
            className={`ml-auto w-[88px] text-right tabular-nums ${charge.status === "void" ? "text-muted line-through" : "font-semibold"}`}
          >
            {dollars(charge.amountCents)}
          </span>
          <span className="w-[38px] text-right">
            {charge.status === "unpaid" ? (
              <button type="button" className={skin.quiet} onClick={() => portal.voidCharge(account.accountNumber, charge)}>
                Void
              </button>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PaymentList({ skin, account }: { skin: Skin; account: Account }) {
  if (account.payments.length === 0) {
    return <p className={`${skin.card} text-muted`}>No online payments on this account yet.</p>;
  }
  return (
    <ul className={`@container ${skin.list}`}>
      {account.payments.map((payment) => (
        <li key={payment.id} className={`${skin.row} flex flex-wrap items-center gap-x-4 gap-y-1`}>
          <span className="min-w-0 flex-1 @max-md:basis-full">
            <span className="block">Paid online</span>
            <span className={skin.meta}>{stamp(payment.at)}</span>
          </span>
          <span className={`${skin.code} min-w-0 truncate text-muted`}>{payment.reference}</span>
          <span className="ml-auto w-[88px] text-right font-semibold tabular-nums">{dollars(payment.amountCents)}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------
   Screens every design shares: New patient, Users, Activity.
   Each design supplies the frame and the look; these supply the content.
   ------------------------------------------------------------------ */

export function SecondaryScreen({ view, skin, portal, go }: { view: View; skin: Skin; portal: Portal; go: Go }) {
  if (view.name === "new") return <NewPatientScreen skin={skin} portal={portal} go={go} />;
  if (view.name === "users") return <UsersScreen skin={skin} portal={portal} />;
  if (view.name === "activity") return <ActivityScreen skin={skin} portal={portal} go={go} accountNumber={view.accountNumber} />;
  if (view.name === "password") {
    return (
      <>
        <Head
          skin={skin}
          art={ART.password}
          title="Change password"
          lead="This keeps the step-by-step password screen the staff area already has. It isn't part of this redesign."
        />
        <button type="button" onClick={() => go({ name: "accounts" })} className={`${skin.primary} mt-6`}>
          Back to accounts
        </button>
      </>
    );
  }
  return null;
}

function NewPatientScreen({ skin, portal, go }: { skin: Skin; portal: Portal; go: Go }) {
  const [values, setValues] = useState<NewPatient>({ firstName: "", lastName: "", dateOfBirth: "", phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (name: keyof NewPatient) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [name]: event.target.value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const input = { ...values, firstName: values.firstName.trim(), lastName: values.lastName.trim() };
    if (!input.firstName || !input.lastName) return setError("Enter the patient's first and last name.");
    if (!input.dateOfBirth || input.dateOfBirth > TODAY) return setError("Enter a valid date of birth.");
    if (input.email && !input.email.includes("@")) return setError("That email address doesn't look right.");
    go({ name: "account", accountNumber: portal.addPatient(input) });
  }

  return (
    <>
      <Head
        skin={skin}
        art={ART.new}
        title="New patient"
        lead="Creates the patient and their billing account. They pay online with the account number and their date of birth."
      />
      <form onSubmit={submit} className={`${skin.card} mt-6 flex max-w-[640px] flex-col gap-4`} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={skin.label}>
            First name
            <input type="text" value={values.firstName} onChange={set("firstName")} autoComplete="off" maxLength={80} className={skin.input} />
          </label>
          <label className={skin.label}>
            Last name
            <input type="text" value={values.lastName} onChange={set("lastName")} autoComplete="off" maxLength={80} className={skin.input} />
          </label>
        </div>
        <label className={`${skin.label} sm:max-w-[260px]`}>
          Date of birth
          <input type="date" value={values.dateOfBirth} onChange={set("dateOfBirth")} max={TODAY} className={skin.input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={skin.label}>
            Phone (optional)
            <input type="tel" value={values.phone} onChange={set("phone")} autoComplete="off" maxLength={30} className={skin.input} />
          </label>
          <label className={skin.label}>
            Email (optional)
            <input type="email" value={values.email} onChange={set("email")} autoComplete="off" maxLength={200} className={skin.input} />
          </label>
        </div>
        {error ? (
          <p role="alert" className="portal-fade text-[14.5px] text-brand-dark">
            {error}
          </p>
        ) : null}
        <button type="submit" className={`${skin.primary} self-start`}>
          Create patient account
        </button>
      </form>
    </>
  );
}

const STAFF_STATUS: Record<StaffStatus, { label: string; tone: "ok" | "info" | "off" }> = {
  active: { label: "Active", tone: "ok" },
  temporary: { label: "Temporary password", tone: "info" },
  deactivated: { label: "Deactivated", tone: "off" },
};

/** The staff table's columns: person, role, status, last sign-in, menu. */
const USER_COLUMNS = "@3xl:grid-cols-[minmax(0,1fr)_84px_164px_132px_100px]";

type MenuItem = {
  label: string;
  onSelect: () => void;
  /** Shown in red: it takes something away. */
  danger?: boolean;
  /** Set apart from the items above it by a rule. */
  apart?: boolean;
};

/** One button per row that opens that person's actions, instead of a row of links. */
function ManageMenu({ name, items }: { name: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative justify-self-end">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-label={`Manage ${name}`}
        onClick={() => setOpen((value) => !value)}
        className={`portal-press inline-flex items-center gap-1 rounded-[9px] border bg-white py-2 pl-3 pr-2 text-[13.5px] font-semibold text-ink ${
          open ? "border-ink" : "border-line hover:border-field"
        }`}
      >
        Manage
        <Icon name="down" className={`h-4 w-4 text-muted transition-transform duration-150 ease-out ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul className="portal-fade absolute right-0 top-[calc(100%+6px)] z-20 w-[196px] rounded-[12px] border border-line bg-white p-1.5 text-left shadow-[0_18px_40px_-18px_rgba(27,42,74,.5)]">
          {items.map((item) => (
            <li key={item.label} className={item.apart ? "mt-1.5 border-t border-line-soft pt-1.5" : ""}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`block w-full rounded-[8px] px-3 py-2 text-left font-sans text-[14.5px] font-medium normal-case tracking-normal transition-colors duration-150 ease-out hover:bg-mist ${
                  item.danger ? "text-brand-dark" : "text-ink"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function UsersScreen({ skin, portal }: { skin: Skin; portal: Portal }) {
  const issuedRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ name: string; password: string } | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return setError("Enter the staff member's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("That email address doesn't look right.");
    if (portal.staff.some((member) => member.email === cleanEmail)) {
      return setError("A staff user with that email already exists.");
    }
    setIssued({ name: name.trim(), password: portal.addStaff(name.trim(), cleanEmail, role) });
    setName("");
    setEmail("");
    setRole("staff");
    setError(null);
  }

  return (
    <>
      <Head
        skin={skin}
        art={ART.users}
        title="Staff users"
        lead="Everyone signs in with their own email and password. Deactivate someone when they leave: it signs them out and keeps their history."
      />

      <form onSubmit={submit} className={`${skin.card} mt-6`} noValidate>
        <h2 className={`${skin.heading} mb-4`}>Add a staff user</h2>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_130px_auto] md:items-end">
          <label className={skin.label}>
            Name
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" maxLength={80} className={skin.input} />
          </label>
          <label className={skin.label}>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" maxLength={200} className={skin.input} />
          </label>
          <label className={skin.label}>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "staff")} className={skin.input}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" className={skin.primary}>
            Add user
          </button>
        </div>
        {error ? (
          <p role="alert" className="portal-fade mt-2.5 text-[14px] text-brand-dark">
            {error}
          </p>
        ) : null}
        {issued ? (
          <div ref={issuedRef} role="status" className="portal-fade mt-4 scroll-mt-20 rounded-[12px] border border-line bg-mist p-4 text-[14.5px] leading-[1.5]">
            <div className="font-semibold">Temporary password for {issued.name}</div>
            <div className="my-1.5 select-all break-all font-mono text-[18px] tracking-[.04em]">{issued.password}</div>
            <div className="text-muted">
              Copy it now and give it to them in person or by phone. It isn&apos;t shown again.
            </div>
          </div>
        ) : null}
      </form>

      {/* A table when there is room for one, a two-line card when there isn't. The
          list is allowed to overflow so a row's menu isn't cut off at its edge. */}
      <ul className={`@container ${skin.list} mt-5 overflow-visible!`}>
        <li aria-hidden="true" className={`${skin.row} hidden gap-x-4 text-[11.5px] font-semibold uppercase tracking-[.07em] text-muted @3xl:grid ${USER_COLUMNS}`}>
          <span>Staff member</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last sign-in</span>
          <span />
        </li>
        {portal.staff.map((member) => {
          const status = STAFF_STATUS[member.status];
          return (
            <li
              key={member.id}
              className={`${skin.row} grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 ${USER_COLUMNS}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={member.name} />
                <div className="min-w-0">
                  <div className="font-semibold">
                    {member.name}
                    {member.id === ME.id ? <span className="font-normal text-muted"> (you)</span> : null}
                  </div>
                  <div className={`${skin.meta} break-all`}>{member.email}</div>
                </div>
              </div>
              {/* On the second line of the card; in the table its three parts become columns. */}
              <div className="order-last col-span-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 @3xl:contents">
                <span>
                  <Chip tone={member.role === "admin" ? "info" : "off"}>{member.role === "admin" ? "Admin" : "Staff"}</Chip>
                </span>
                <span>
                  <Chip tone={status.tone}>{status.label}</Chip>
                </span>
                <span className={`${skin.meta} tabular-nums`}>
                  {member.lastSignIn ? (
                    <>
                      <span className="@3xl:hidden">Last in </span>
                      {stamp(member.lastSignIn)}
                    </>
                  ) : (
                    "Never signed in"
                  )}
                </span>
              </div>
              {member.id === ME.id ? (
                <span />
              ) : (
                <ManageMenu
                  name={member.name}
                  items={[
                    {
                      label: "Reset password",
                      onSelect: () => {
                        setIssued({ name: member.name, password: portal.resetStaffPassword(member) });
                        // The new password appears above the list, which may be off screen.
                        requestAnimationFrame(() => issuedRef.current?.scrollIntoView({ block: "nearest" }));
                      },
                    },
                    {
                      label: member.role === "admin" ? "Make staff" : "Make admin",
                      onSelect: () => portal.toggleStaffRole(member),
                    },
                    member.status === "deactivated"
                      ? { label: "Reactivate", apart: true, onSelect: () => portal.toggleStaffActive(member) }
                      : { label: "Deactivate", apart: true, danger: true, onSelect: () => portal.toggleStaffActive(member) },
                  ]}
                />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function ActivityScreen({ skin, portal, go, accountNumber }: { skin: Skin; portal: Portal; go: Go; accountNumber?: string }) {
  const [filter, setFilter] = useState(accountNumber ?? "");
  const filterId = useId();
  const wanted = filter.trim().toLowerCase().replace(/[-\s]/g, "");
  const entries = portal.log.filter(
    (entry) => !wanted || entry.accountNumber?.toLowerCase().replace("-", "").includes(wanted),
  );

  return (
    <>
      <Head
        skin={skin}
        art={ART.activity}
        title="Activity"
        lead="Who signed in, which patient accounts they opened, and what they changed. Entries are never edited or deleted."
      />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label htmlFor={filterId} className={`${skin.label} min-w-[220px] flex-1 sm:max-w-[340px]`}>
          Show one account
          <input
            id={filterId}
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="e.g. NS-861355"
            className={skin.input}
          />
        </label>
        {filter ? (
          <button type="button" onClick={() => setFilter("")} className={`${skin.quiet} pb-2.5`}>
            Show everything
          </button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <p className={`${skin.card} mt-5 text-muted`}>No activity recorded for “{filter.trim()}”.</p>
      ) : (
        <ul className={`${skin.list} mt-5`}>
          {entries.map((entry) => (
            <li key={entry.id} className={`${skin.row} grid gap-x-4 gap-y-0.5 md:grid-cols-[150px_minmax(0,1fr)_auto] md:items-baseline`}>
              <span className={`${skin.meta} tabular-nums`}>{stamp(entry.at)}</span>
              <span className="min-w-0">
                <span className="font-semibold">{entry.who}</span> <span className="text-muted">·</span> {entry.what}
                {entry.detail ? <span className={`${skin.meta} block break-words`}>{entry.detail}</span> : null}
              </span>
              {entry.accountNumber ? (
                <button
                  type="button"
                  onClick={() => go({ name: "account", accountNumber: entry.accountNumber as string })}
                  className={`${skin.code} justify-self-start text-brand hover:text-brand-dark md:justify-self-end`}
                >
                  {entry.accountNumber}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** What every design shows after Sign out. The sign-in screen itself isn't being redesigned. */
export function SignedOut({ onBack }: { onBack: () => void }) {
  return (
    <div className="grid h-full place-items-center bg-mist p-6 text-center">
      <div className="portal-rise max-w-[380px]">
        <Logo className="mx-auto mb-6 h-11 w-auto" />
        <h1 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-.03em]">You&apos;re signed out.</h1>
        <p className="mt-2 text-[15.5px] leading-[1.5] text-muted">
          In the real staff area this returns to the sign-in screen, which stays as it is.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="portal-press mt-6 rounded-[12px] bg-brand px-5 py-3 text-[15.5px] font-semibold text-white hover:bg-brand-press"
        >
          Sign back in
        </button>
      </div>
    </div>
  );
}
