"use client";

import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
  useState,
  useTransition,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  changePassword,
  checkOwnPassword,
  checkSetupKey,
  setUpFirstAdmin,
  signIn,
  type StaffFormState,
} from "@/app/staff/actions";
import { Busy } from "@/components/spinner";
import { useToast } from "@/components/staff-toast";
import { Icon } from "@/components/staff-ui";
import { CLINIC } from "@/lib/site-data";
import { CONNECTION_ERROR, formDataOf } from "@/lib/staff/forms";

/*
 * The three ways into the staff area: signing in, creating the first admin,
 * and choosing a password. Signing in is one short form. The other two ask
 * one question at a time and check each answer before asking the next.
 */

// Matches MIN_PASSWORD_LENGTH in lib/staff/passwords.ts, which can't be imported into the browser.
const MIN_PASSWORD_LENGTH = 12;

const initialState: StaffFormState = { error: null };

function emailProblem(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : "Enter a full email address.";
}

function newPasswordProblem(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password !== confirm) return "The two passwords don't match.";
  return null;
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** How the eye button looks. Each box adds where it sits. */
const eyeButton =
  "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[10px] text-muted transition-colors duration-150 ease-out hover:bg-line-soft hover:text-ink";

/** A password box with an eye button that shows or hides what was typed, and a Caps Lock warning. */
function PasswordInput({
  inputClassName,
  toggleClassName,
  noteClassName,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  inputClassName: string;
  /** Where the eye button sits in the box. */
  toggleClassName: string;
  noteClassName: string;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const readCapsLock = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"));

  return (
    <>
      <span className="relative block">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={inputClassName}
          onKeyDown={readCapsLock}
          onKeyUp={readCapsLock}
          onBlur={() => setCapsLock(false)}
        />
        {/* An open eye offers to show it. The crossed-out eye, shown while it is readable, hides it again. */}
        <button
          type="button"
          className={`${eyeButton} ${toggleClassName}`}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((shown) => !shown)}
        >
          <Icon name={visible ? "eyeOff" : "eye"} />
        </button>
      </span>
      {capsLock ? (
        <span role="status" className={noteClassName}>
          Caps Lock is on.
        </span>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------
   Sign in
   ------------------------------------------------------------------ */

const signInLabel = "mb-[7px] block text-[14.5px] font-semibold";
const signInInput =
  "w-full rounded-[11px] border-[1.5px] border-field bg-mist px-3.5 py-[13px] text-[16px] transition-colors duration-150 ease-out hover:border-muted";

export function StaffSignInForm() {
  const [state, action, pending] = useActionState(signIn, initialState);
  // Held here so a refused sign-in doesn't clear what was typed.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailId = useId();
  const passwordId = useId();
  const toast = useToast();

  // The reason is shown under the boxes and stays there. The toast only says it didn't go through.
  useEffect(() => {
    if (state.error) toast.error("Couldn't sign in");
  }, [state, toast]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor={emailId} className={signInLabel}>
          Email
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="username"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={signInInput}
        />
      </div>
      <div>
        <label htmlFor={passwordId} className={signInLabel}>
          Password
        </label>
        <PasswordInput
          id={passwordId}
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          inputClassName={`${signInInput} pr-[52px]`}
          toggleClassName="right-1.5"
          noteClassName="mt-1.5 block text-[13.5px] text-muted"
        />
      </div>
      {state.error ? (
        <p
          role="alert"
          className="staff-entry-fade rounded-[11px] border border-pink-line bg-pink px-3.5 py-3 text-[14.5px] leading-[1.45] text-pink-ink"
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="staff-entry-press mt-1 w-full rounded-[12px] bg-brand px-5 py-3.5 text-[16px] font-semibold text-white hover:bg-brand-press disabled:opacity-70"
      >
        {pending ? <Busy>Signing in</Busy> : "Sign in"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------
   One question at a time
   ------------------------------------------------------------------ */

type Values = Record<string, string>;

type GuidedField = {
  name: string;
  label: string;
  kind: "text" | "email" | "secret";
  autoComplete: string;
  maxLength?: number;
};

type GuidedStep = {
  title: string;
  help: string;
  fields: GuidedField[];
  /** Runs first, in the browser: what is wrong with what was typed, or null. */
  validate?: (values: Values) => string | null;
  /** Runs when the person continues. Returns what is wrong, or null. It may ask the server. */
  check: (values: Values) => string | null | Promise<string | null>;
  /** On the step that saves something: what the toast says if the server refuses it. */
  failed?: string;
  /** The new password and its repeat, to tick the password rules against as they are typed. */
  rules?: [string, string];
  cta: string;
  pendingCta: string;
  /** How this answer is shown on the next step. */
  answered: (values: Values) => string;
};

const guidedTitle =
  "block font-display text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.05] tracking-[-.032em]";
const guidedInput =
  "w-full rounded-none border-0 border-b-2 border-field bg-transparent px-0 py-2.5 text-[22px] transition-colors duration-150 ease-out";

/** The page around a guided flow: logo, where the person is, and a way out. */
export function GuidedShell({
  status,
  progress,
  exit,
  children,
}: {
  status: string;
  /** How far along the flow is, from 0 to 1. */
  progress: number;
  exit?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <header className="flex items-center justify-between gap-4 px-[clamp(20px,4vw,48px)] py-5">
        <Image src="/logo.png" alt={CLINIC.name} width={92} height={40} className="h-10 w-auto" />
        <div className="flex items-center gap-5">
          <span className="font-mono text-[12.5px] uppercase tracking-[.09em] text-muted">{status}</span>
          {exit}
        </div>
      </header>
      <div className="h-[3px] bg-line-soft" aria-hidden="true">
        <div
          className="h-full origin-left bg-brand transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-[clamp(20px,4vw,48px)] py-12">
        {children}
      </main>
    </div>
  );
}

function GuidedFlow({ steps, exit }: { steps: GuidedStep[]; exit?: ReactNode }) {
  const baseId = useId();
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(steps.flatMap((step) => step.fields.map((spec) => [spec.name, ""]))),
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const current = steps[step];
  const single = current.fields.length === 1;

  function goTo(next: number) {
    setError(null);
    setStep(next);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const invalid = current.validate?.(values) ?? null;
    if (invalid) return setError(invalid);
    setError(null);
    startTransition(async () => {
      let problem: string | null;
      try {
        problem = await current.check(values);
      } catch (thrown) {
        // The last step ends in a redirect, which arrives here as an error Next has to see.
        unstable_rethrow(thrown);
        problem = CONNECTION_ERROR;
      }
      if (problem) {
        setError(problem);
        // The reason is under the question. The toast only says nothing was saved.
        if (current.failed) toast.error(current.failed);
      } else if (step < steps.length - 1) goTo(step + 1);
    });
  }

  return (
    <GuidedShell status={`Step ${step + 1} of ${steps.length}`} progress={(step + 1) / steps.length} exit={exit}>
      {/* The key restarts the entrance and moves focus to the new question. */}
      <form key={step} onSubmit={submit} className="staff-entry-rise" noValidate>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={pending}
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[14.5px] text-muted transition-colors duration-150 ease-out hover:border-muted hover:text-ink"
          >
            <span aria-hidden="true">←</span>
            <span className="truncate">{steps[step - 1].answered(values)}</span>
            <span className="sr-only">. Go back a step</span>
          </button>
        ) : null}

        {single ? (
          <label htmlFor={`${baseId}-${current.fields[0].name}`} className={guidedTitle}>
            {current.title}
          </label>
        ) : (
          <h1 className={guidedTitle}>{current.title}</h1>
        )}
        <p className="mt-3 text-[16.5px] leading-[1.5] text-muted">{current.help}</p>

        <div className="mt-8 flex flex-col gap-6">
          {current.fields.map((spec, index) => {
            const shared = {
              id: `${baseId}-${spec.name}`,
              name: spec.name,
              autoComplete: spec.autoComplete,
              maxLength: spec.maxLength,
              autoFocus: index === 0,
              value: values[spec.name],
              onChange: (event: { target: { value: string } }) => {
                setError(null);
                setValues((all) => ({ ...all, [spec.name]: event.target.value }));
              },
            };
            return (
              <div key={spec.name}>
                {single ? null : (
                  <label htmlFor={shared.id} className="block text-[14px] font-semibold text-muted">
                    {spec.label}
                  </label>
                )}
                {spec.kind === "secret" ? (
                  <PasswordInput
                    {...shared}
                    inputClassName={`${guidedInput} pr-12`}
                    toggleClassName="right-0"
                    noteClassName="mt-2 block text-[14px] text-muted"
                  />
                ) : (
                  <input {...shared} type={spec.kind} className={guidedInput} />
                )}
              </div>
            );
          })}
        </div>

        {current.rules ? (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[14.5px]">
            {[
              {
                label: `At least ${MIN_PASSWORD_LENGTH} characters`,
                met: values[current.rules[0]].length >= MIN_PASSWORD_LENGTH,
              },
              {
                label: "Both entries match",
                met: values[current.rules[0]].length > 0 && values[current.rules[0]] === values[current.rules[1]],
              },
            ].map((rule) => (
              <li key={rule.label} className={`flex items-center gap-2 ${rule.met ? "text-open" : "text-muted"}`}>
                <CheckIcon className={`h-4 w-4 ${rule.met ? "" : "opacity-35"}`} />
                {rule.label}
              </li>
            ))}
          </ul>
        ) : null}

        {error ? (
          <p role="alert" className="staff-entry-fade mt-5 text-[15.5px] leading-[1.45] text-brand-dark">
            {error}
          </p>
        ) : null}

        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            disabled={pending}
            className="staff-entry-press rounded-[12px] bg-brand px-7 py-3.5 text-[16px] font-semibold text-white hover:bg-brand-press disabled:opacity-70"
          >
            {pending ? <Busy>{current.pendingCta}</Busy> : current.cta}
          </button>
          <span className="text-[14px] text-muted max-sm:hidden">
            or press <kbd className="font-mono text-[13px]">Enter ↵</kbd>
          </span>
        </div>
      </form>
    </GuidedShell>
  );
}

/* ------------------------------------------------------------------
   Creating the first admin
   ------------------------------------------------------------------ */

const SETUP_STEPS: GuidedStep[] = [
  {
    title: "Enter the setup key.",
    help: "It is the STAFF_PASSCODE value on the server. Whoever installed the site has it.",
    fields: [{ name: "setupKey", label: "Setup key", kind: "secret", autoComplete: "off" }],
    check: async (v) => (v.setupKey.trim() ? (await checkSetupKey(v.setupKey)).error : "Enter the setup key."),
    cta: "Continue",
    pendingCta: "Checking",
    answered: () => "Setup key accepted",
  },
  {
    title: "Who's the first admin?",
    help: "This person adds everyone else and can make other people admins.",
    fields: [
      { name: "name", label: "Your name", kind: "text", autoComplete: "name", maxLength: 80 },
      { name: "email", label: "Your email", kind: "email", autoComplete: "username", maxLength: 200 },
    ],
    check: (v) => (v.name.trim() ? emailProblem(v.email) : "Enter your name."),
    cta: "Continue",
    pendingCta: "Continue",
    answered: (v) => `${v.name.trim()} · ${v.email.trim()}`,
  },
  {
    title: "Choose a password.",
    help: `At least ${MIN_PASSWORD_LENGTH} characters. A few unrelated words work well.`,
    fields: [
      { name: "password", label: "Password", kind: "secret", autoComplete: "new-password" },
      { name: "confirm", label: "Password again", kind: "secret", autoComplete: "new-password" },
    ],
    validate: (v) => newPasswordProblem(v.password, v.confirm),
    check: async (v) =>
      (
        await setUpFirstAdmin(
          initialState,
          formDataOf({
            setupKey: v.setupKey,
            name: v.name,
            email: v.email,
            password: v.password,
            confirmPassword: v.confirm,
          }),
        )
      ).error,
    failed: "Admin account not created",
    rules: ["password", "confirm"],
    cta: "Create admin",
    pendingCta: "Creating admin",
    answered: () => "",
  },
];

export function FirstAdminSetup() {
  return <GuidedFlow steps={SETUP_STEPS} />;
}

/* ------------------------------------------------------------------
   Choosing a password
   ------------------------------------------------------------------ */

function passwordSteps(temporary: boolean): GuidedStep[] {
  return [
    {
      title: temporary ? "Enter your temporary password." : "Enter your current password.",
      help: temporary ? "The one your admin gave you." : "This confirms it's you before anything changes.",
      fields: [
        {
          name: "current",
          label: temporary ? "Temporary password" : "Current password",
          kind: "secret",
          autoComplete: "current-password",
        },
      ],
      check: async (v) =>
        v.current
          ? (await checkOwnPassword(v.current)).error
          : `Enter your ${temporary ? "temporary" : "current"} password.`,
      cta: "Continue",
      pendingCta: "Checking",
      answered: () => (temporary ? "Temporary password accepted" : "Current password accepted"),
    },
    {
      title: temporary ? "Now choose your own." : "Now choose a new one.",
      help: temporary
        ? `At least ${MIN_PASSWORD_LENGTH} characters. You'll use it every time you sign in.`
        : `At least ${MIN_PASSWORD_LENGTH} characters. Saving it signs you out everywhere else you're signed in.`,
      fields: [
        { name: "next", label: "New password", kind: "secret", autoComplete: "new-password" },
        { name: "confirm", label: "New password again", kind: "secret", autoComplete: "new-password" },
      ],
      validate: (v) =>
        newPasswordProblem(v.next, v.confirm) ??
        (v.next === v.current ? "Choose a password you haven't been using." : null),
      check: async (v) =>
        (
          await changePassword(
            initialState,
            formDataOf({ currentPassword: v.current, newPassword: v.next, confirmPassword: v.confirm }),
          )
        ).error,
      failed: "Password not saved",
      rules: ["next", "confirm"],
      cta: "Save password",
      pendingCta: "Saving password",
      answered: () => "",
    },
  ];
}

/** `temporary` is true for someone who signed in with a password an admin issued. */
export function PasswordChange({ temporary, exit }: { temporary: boolean; exit: ReactNode }) {
  const [steps] = useState(() => passwordSteps(temporary));
  return <GuidedFlow steps={steps} exit={exit} />;
}
