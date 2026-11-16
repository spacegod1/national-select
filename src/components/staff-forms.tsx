"use client";

import { unstable_rethrow } from "next/navigation";
import { useActionState, useId, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { createPatient, postCharge, removeCharge, type StaffFormState } from "@/app/staff/actions";
import { Icon, skin } from "@/components/staff-ui";
import { CONNECTION_ERROR, formDataOf } from "@/lib/staff/forms";
import { VOID_NOTE_MAX, VOID_REASONS, voidReasonProblem } from "@/lib/staff/void-reasons";

const initialState: StaffFormState = { error: null };

function FormError({ error, className = "" }: { error: string | null; className?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className={`staff-entry-fade text-[14.5px] leading-[1.45] text-brand-dark ${className}`}>
      {error}
    </p>
  );
}

/* ------------------------------------------------------------------
   New patient
   ------------------------------------------------------------------ */

const EMPTY_PATIENT = { firstName: "", lastName: "", dateOfBirth: "", phone: "", email: "" };

/** `today` is the clinic's date, `YYYY-MM-DD`: the latest date of birth the form offers. */
export function NewPatientForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(createPatient, initialState);
  // Held here so a refused form doesn't clear what was typed.
  const [values, setValues] = useState(EMPTY_PATIENT);
  const set = (name: keyof typeof EMPTY_PATIENT) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [name]: event.target.value }));

  return (
    <form action={action} className={`${skin.card} mt-6 flex max-w-[640px] flex-col gap-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={skin.label}>
          First name
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={set("firstName")}
            autoComplete="off"
            required
            maxLength={80}
            className={skin.input}
          />
        </label>
        <label className={skin.label}>
          Last name
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={set("lastName")}
            autoComplete="off"
            required
            maxLength={80}
            className={skin.input}
          />
        </label>
      </div>
      <label className={`${skin.label} sm:max-w-[260px]`}>
        Date of birth
        <input
          type="date"
          name="dateOfBirth"
          value={values.dateOfBirth}
          onChange={set("dateOfBirth")}
          required
          max={today}
          className={skin.input}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={skin.label}>
          Phone (optional)
          <input
            type="tel"
            name="phone"
            value={values.phone}
            onChange={set("phone")}
            autoComplete="off"
            maxLength={30}
            className={skin.input}
          />
        </label>
        <label className={skin.label}>
          Email (optional)
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={set("email")}
            autoComplete="off"
            maxLength={200}
            className={skin.input}
          />
        </label>
      </div>
      <FormError error={state.error} />
      <button type="submit" disabled={pending} className={`${skin.primary} self-start`}>
        {pending ? "Creating account" : "Create patient account"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------
   Charges
   ------------------------------------------------------------------ */

export function ChargeForm({
  accountNumber,
  onPosted,
  className = "",
}: {
  accountNumber: string;
  onPosted?: () => void;
  className?: string;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!description.trim()) return setError("Describe the charge.");
    if (!amount.trim()) return setError("Enter an amount greater than zero, such as 149.00.");
    setError(null);
    startTransition(async () => {
      let problem: string | null;
      try {
        problem = (await postCharge(initialState, formDataOf({ accountNumber, description, amount }))).error;
      } catch (thrown) {
        // Being signed out arrives here as a redirect, which Next has to see.
        unstable_rethrow(thrown);
        problem = CONNECTION_ERROR;
      }
      if (problem) return setError(problem);
      setDescription("");
      setAmount("");
      onPosted?.();
    });
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
        <button type="submit" disabled={pending} className={skin.primary}>
          {pending ? "Posting" : "Post charge"}
        </button>
      </div>
      <FormError error={error} className="mt-2.5" />
    </form>
  );
}

/**
 * The Void button on an unpaid charge, and the pop-up it opens. A void can't be
 * undone, so it asks first, and asks why: the reason is kept with the charge.
 */
export function VoidCharge({
  accountNumber,
  chargeId,
  description,
  amount,
  className,
}: {
  accountNumber: string;
  chargeId: string;
  description: string;
  /** The charge's amount, already written out, such as `$149.00`. */
  amount: string;
  /** How the Void button looks where it is used. */
  className: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const titleId = useId();
  const reasonName = useId();
  const needsNote = reason === "other";

  function open() {
    setReason("");
    setNote("");
    setError(null);
    dialog.current?.showModal();
  }

  function close() {
    if (!pending) dialog.current?.close();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const invalid = voidReasonProblem(reason, note);
    if (invalid) return setError(invalid);
    setError(null);
    startTransition(async () => {
      let problem: string | null;
      try {
        problem = (await removeCharge(initialState, formDataOf({ accountNumber, chargeId, reason, note }))).error;
      } catch (thrown) {
        unstable_rethrow(thrown);
        problem = CONNECTION_ERROR;
      }
      if (problem) return setError(problem);
      // The charge comes back voided, without this button. Close in case it is still here.
      dialog.current?.close();
    });
  }

  return (
    <>
      <button type="button" onClick={open} className={className}>
        Void
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Escape closes it, except while the void is being saved.
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        // A click on the dimmed page around it lands on the dialog itself.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="staff-dialog m-auto w-[min(460px,calc(100%-32px))] overflow-hidden rounded-[18px] bg-white text-left font-sans text-[15px] font-normal normal-case leading-[1.5] tracking-normal text-ink shadow-[0_30px_70px_-30px_rgba(27,42,74,.7)] max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none"
      >
        <form onSubmit={submit} noValidate className="flex max-h-[min(88dvh,680px)] flex-col">
          <div className="min-h-0 overflow-y-auto px-5 pb-4 pt-5 md:px-6 md:pt-6">
            <h2 id={titleId} className="font-display text-[22px] font-extrabold leading-[1.15] tracking-[-.025em]">
              Void this charge?
            </h2>
            <div className="mt-3 flex items-baseline justify-between gap-4 rounded-[12px] bg-mist px-3.5 py-3">
              <span className="min-w-0 break-words font-semibold">{description}</span>
              <span className="font-semibold tabular-nums">{amount}</span>
            </div>
            <p className="mt-3 text-[14px] text-muted">
              It stays on the account marked Void, and the balance drops by {amount}. A void can&apos;t be undone.
            </p>

            <fieldset className="mt-4">
              <legend className="text-[13px] font-semibold text-muted">Why is it being voided?</legend>
              <div className="mt-2 flex flex-col gap-1.5">
                {VOID_REASONS.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-line px-3 py-2 text-[14.5px] transition-colors duration-150 ease-out hover:border-field has-[:checked]:border-ink has-[:checked]:bg-mist"
                  >
                    <input
                      type="radio"
                      name={reasonName}
                      value={item.id}
                      checked={reason === item.id}
                      onChange={() => {
                        setReason(item.id);
                        setError(null);
                      }}
                      className="h-4 w-4 flex-none accent-brand"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-3.5 flex flex-col gap-1 text-[13px] font-semibold text-muted">
              {needsNote ? "Note" : "Note (optional)"}
              <input
                type="text"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setError(null);
                }}
                maxLength={VOID_NOTE_MAX}
                autoComplete="off"
                placeholder={needsNote ? "Say why this charge is being voided" : "Anything worth adding"}
                className="w-full rounded-[10px] border border-field bg-white px-3 py-2 text-[15px] font-normal text-ink"
              />
            </label>

            <FormError error={error} className="mt-3" />
            <p className="mt-3 text-[13px] text-muted">
              The reason is saved with the charge and in the activity log, under your name.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2.5 border-t border-line-soft px-5 py-3.5 md:px-6">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="staff-entry-press rounded-[10px] border border-line bg-white px-4 py-2.5 text-[14.5px] font-semibold text-ink hover:border-field disabled:opacity-70"
            >
              Keep charge
            </button>
            <button
              type="submit"
              disabled={pending}
              className="staff-entry-press rounded-[10px] bg-brand px-4 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-press disabled:opacity-70"
            >
              {pending ? "Voiding" : "Void charge"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/* ------------------------------------------------------------------
   An account's records, beside the list on larger screens
   ------------------------------------------------------------------ */

export type RecordTab = { id: string; label: string; count: number; panel: ReactNode };

/** Posting a charge, then the account's records a tab at a time. The first tab holds the charges. */
export function AccountWorkbench({ accountNumber, tabs }: { accountNumber: string; tabs: RecordTab[] }) {
  const [tabId, setTabId] = useState(tabs[0].id);
  const current = tabs.find((tab) => tab.id === tabId) ?? tabs[0];
  const panelId = useId();

  return (
    <>
      <div className="rounded-[12px] border border-line bg-white p-3.5">
        <h2 className="mb-3 flex items-center gap-2.5 text-[15px] font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-pink text-brand-dark">
            <Icon name="receipt" className="h-[18px] w-[18px]" />
          </span>
          Post a charge
        </h2>
        {/* A new charge is worth seeing, whichever tab was open. */}
        <ChargeForm accountNumber={accountNumber} onPosted={() => setTabId(tabs[0].id)} />
      </div>

      <div role="tablist" aria-label="Account records" className="mt-5 flex gap-5 border-b border-line">
        {tabs.map((tab) => {
          const selected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              onClick={() => setTabId(tab.id)}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 pb-2 text-[14px] font-semibold ${
                selected ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 text-[12px] ${selected ? "bg-ink text-white" : "bg-line-soft text-muted"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={panelId} aria-label={current.label} className="mt-3.5">
        {current.panel}
      </div>
    </>
  );
}
