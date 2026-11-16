"use client";

import { unstable_rethrow } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import {
  addStaffUser,
  resetPassword,
  setUserActive,
  setUserRole,
  type IssuedPassword,
  type IssuedPasswordState,
} from "@/app/staff/actions";
import { Busy, Spinner } from "@/components/spinner";
import { useToast } from "@/components/staff-toast";
import { Avatar, Chip, Icon, skin } from "@/components/staff-ui";
import { CONNECTION_ERROR, formDataOf } from "@/lib/staff/forms";

export type StaffUserRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  status: "active" | "temporary" | "deactivated";
  /** When they last signed in, already written out, or null if they never have. */
  lastSignIn: string | null;
};

const STATUS: Record<StaffUserRow["status"], { label: string; tone: "ok" | "info" | "off" }> = {
  active: { label: "Active", tone: "ok" },
  temporary: { label: "Temporary password", tone: "info" },
  deactivated: { label: "Deactivated", tone: "off" },
};

const initialIssuedState: IssuedPasswordState = { error: null, issued: null };

/** The staff table's columns: person, role, status, last sign-in, menu. */
const COLUMNS = "@3xl:grid-cols-[minmax(0,1fr)_84px_164px_132px_100px]";

type MenuItem = {
  label: string;
  onSelect: () => void;
  /** Shown in red: it takes something away. */
  danger?: boolean;
  /** Set apart from the items above it by a rule. */
  apart?: boolean;
};

/** One button per row that opens that person's actions, instead of a row of links. */
function ManageMenu({
  name,
  items,
  disabled,
  busy,
}: {
  name: string;
  items: MenuItem[];
  disabled: boolean;
  /** One of this person's actions is running. */
  busy: boolean;
}) {
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
        disabled={disabled}
        aria-expanded={open}
        aria-label={`Manage ${name}`}
        onClick={() => setOpen((value) => !value)}
        className={`staff-entry-press inline-flex items-center gap-1 rounded-[9px] border bg-white py-2 pl-3 pr-2 font-sans text-[13.5px] font-semibold text-ink disabled:opacity-60 ${
          open ? "border-ink" : "border-line hover:border-field"
        }`}
      >
        Manage
        {busy ? (
          <Spinner className="h-4 w-4 text-muted" />
        ) : (
          <Icon
            name="down"
            className={`h-4 w-4 text-muted transition-transform duration-150 ease-out ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {open ? (
        <ul className="staff-entry-fade absolute right-0 top-[calc(100%+6px)] z-20 w-[196px] rounded-[12px] border border-line bg-white p-1.5 text-left shadow-[0_18px_40px_-18px_rgba(27,42,74,.5)]">
          {items.map((item) => (
            <li key={item.label} className={item.apart ? "mt-1.5 border-t border-line-soft pt-1.5" : ""}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`block w-full rounded-[8px] px-3 py-2 text-left font-sans text-[14.5px] font-medium transition-colors duration-150 ease-out hover:bg-mist ${
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

/** Adding a staff user, and the list of everyone with what an admin can do to each. */
export function StaffUsers({ users, currentUserId }: { users: StaffUserRow[] | null; currentUserId: string }) {
  const noticeRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<IssuedPassword | null>(null);
  /** The row being changed, or "new" while a user is being added. */
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  // A new password or a refusal appears above the list, which may be off screen.
  useEffect(() => {
    if (issued || error) noticeRef.current?.scrollIntoView({ block: "nearest" });
  }, [issued, error]);

  /**
   * Runs one change and says how it went in a toast. The Add form also shows a
   * refusal under its boxes. A row's menu has nowhere to, so its toast carries the reason.
   */
  function run(
    target: string,
    work: () => Promise<{ error: string | null; issued?: IssuedPassword | null }>,
    words: { done: string; detail?: string; failed: string },
    onDone?: () => void,
  ) {
    if (pending) return;
    const fromForm = target === "new";
    setError(null);
    setBusy(target);
    startTransition(async () => {
      let problem: string | null;
      try {
        const result = await work();
        problem = result.error;
        if (!problem && result.issued) setIssued(result.issued);
      } catch (thrown) {
        // Being signed out arrives here as a redirect, which Next has to see.
        unstable_rethrow(thrown);
        problem = CONNECTION_ERROR;
      }
      if (problem) {
        if (fromForm) setError(problem);
        toast.error(words.failed, fromForm ? undefined : problem);
      } else {
        toast.success(words.done, words.detail);
        onDone?.();
      }
      setBusy(null);
    });
  }

  function add(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter the staff member's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("That email address doesn't look right.");
    run(
      "new",
      () => addStaffUser(initialIssuedState, formDataOf({ name, email, role })),
      {
        done: `${name.trim()} added`,
        detail: "Their temporary password is above the list. Copy it now.",
        failed: "User not added",
      },
      () => {
        setName("");
        setEmail("");
        setRole("staff");
      },
    );
  }

  return (
    <>
      <form onSubmit={add} className={`${skin.card} mt-6`} noValidate>
        <h2 className={`${skin.heading} mb-4`}>Add a staff user</h2>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_130px_auto] md:items-end">
          <label className={skin.label}>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
              maxLength={80}
              className={skin.input}
            />
          </label>
          <label className={skin.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              maxLength={200}
              className={skin.input}
            />
          </label>
          <label className={skin.label}>
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "staff")}
              className={skin.input}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={pending} className={skin.primary}>
            {busy === "new" ? <Busy>Adding</Busy> : "Add user"}
          </button>
        </div>
        <div ref={noticeRef} className="scroll-mt-20">
          {error ? (
            <p role="alert" className="staff-entry-fade mt-3 text-[14.5px] leading-[1.45] text-brand-dark">
              {error}
            </p>
          ) : null}
          {issued ? (
            <div
              role="status"
              className="staff-entry-fade mt-4 rounded-[12px] border border-line bg-mist p-4 font-sans text-[14.5px] leading-[1.5]"
            >
              <div className="font-semibold">Temporary password for {issued.name}</div>
              <div className="my-1.5 select-all break-all font-mono text-[18px] tracking-[.04em]">{issued.password}</div>
              <div className="text-muted">
                Copy it now and give it to them in person or by phone. It isn&apos;t shown again, and they choose their
                own password the first time they sign in.
              </div>
            </div>
          ) : null}
        </div>
      </form>

      {users === null ? (
        <p role="alert" className={`${skin.alert} mt-5`}>
          The staff database didn&apos;t respond, so staff users can&apos;t be shown right now.
        </p>
      ) : (
        /* A table when there is room for one, a two-line card when there isn't. The
           list is allowed to overflow so a row's menu isn't cut off at its edge. */
        <ul className={`@container ${skin.list} mt-5 overflow-visible!`}>
          <li
            aria-hidden="true"
            className={`${skin.row} hidden gap-x-4 text-[11.5px] font-semibold uppercase tracking-[.07em] text-muted @3xl:grid ${COLUMNS}`}
          >
            <span>Staff member</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last sign-in</span>
            <span />
          </li>
          {users.map((user) => {
            const status = STATUS[user.status];
            return (
              <li
                key={user.id}
                aria-busy={busy === user.id}
                className={`${skin.row} grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 transition-opacity duration-150 ease-out ${COLUMNS} ${
                  busy === user.id ? "opacity-60" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={user.name} />
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {user.name}
                      {user.id === currentUserId ? <span className="font-normal text-muted"> (you)</span> : null}
                    </div>
                    <div className={`${skin.meta} break-all`}>{user.email}</div>
                  </div>
                </div>
                {/* On the second line of the card; in the table its three parts become columns. */}
                <div className="order-last col-span-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 @3xl:contents">
                  <span>
                    <Chip tone={user.role === "admin" ? "info" : "off"}>{user.role === "admin" ? "Admin" : "Staff"}</Chip>
                  </span>
                  <span>
                    <Chip tone={status.tone}>{status.label}</Chip>
                  </span>
                  <span className={`${skin.meta} tabular-nums`}>
                    {user.lastSignIn ? (
                      <>
                        <span className="@3xl:hidden">Last in </span>
                        {user.lastSignIn}
                      </>
                    ) : (
                      "Never signed in"
                    )}
                  </span>
                </div>
                {user.id === currentUserId ? (
                  <span />
                ) : (
                  <ManageMenu
                    name={user.name}
                    disabled={pending}
                    busy={busy === user.id}
                    items={[
                      {
                        label: "Reset password",
                        onSelect: () =>
                          run(user.id, () => resetPassword(initialIssuedState, formDataOf({ userId: user.id })), {
                            done: `Password reset for ${user.name}`,
                            detail: "Their temporary password is above the list. Copy it now.",
                            failed: "Password not reset",
                          }),
                      },
                      {
                        label: user.role === "admin" ? "Make staff" : "Make admin",
                        onSelect: () =>
                          run(
                            user.id,
                            () =>
                              setUserRole(
                                formDataOf({ userId: user.id, role: user.role === "admin" ? "staff" : "admin" }),
                              ),
                            {
                              done: `${user.name} is now ${user.role === "admin" ? "staff" : "an admin"}`,
                              failed: "Role not changed",
                            },
                          ),
                      },
                      user.status === "deactivated"
                        ? {
                            label: "Reactivate",
                            apart: true,
                            onSelect: () =>
                              run(user.id, () => setUserActive(formDataOf({ userId: user.id, active: "true" })), {
                                done: `${user.name} reactivated`,
                                detail: "They can sign in again.",
                                failed: `${user.name} not reactivated`,
                              }),
                          }
                        : {
                            label: "Deactivate",
                            apart: true,
                            danger: true,
                            onSelect: () =>
                              run(user.id, () => setUserActive(formDataOf({ userId: user.id, active: "false" })), {
                                done: `${user.name} deactivated`,
                                detail: "They've been signed out and can't sign in.",
                                failed: `${user.name} not deactivated`,
                              }),
                          },
                    ]}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
