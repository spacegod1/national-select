"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PlusMark } from "@/components/icons";
import { RevealController } from "@/components/reveal-controller";
import { CLINIC } from "@/lib/site-data";

export type BookingProviderInfo = {
  id: string;
  name: string;
  title: string;
};

type BookingMode = "checkin" | "appointment";

type BookingContextValue = {
  open: () => void;
  openAppointment: (provider: BookingProviderInfo) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}

const CHECKIN_REASONS = [
  "Illness or symptoms",
  "Injury",
  "Physical or form",
  "Lab test",
  "Vaccine",
  "Other",
];

const APPOINTMENT_SERVICES = [
  "Annual physical",
  "Follow-up visit",
  "Women's health",
  "Chronic care management",
  "Lab or results review",
  "Other",
];

const SLOTS = ["9:00", "9:40", "10:20", "11:00", "11:40", "1:00", "1:40", "2:20", "3:00", "3:40", "4:20", "5:00"];
const CHECKIN_TAKEN = new Set([2, 5, 9]);
const APPOINTMENT_TAKEN = new Set([1, 4, 7, 10]);

type DayOption = { dow: string; num: number; full: string; key: string };

const APPOINTMENT_DAYS = 14;
const WEEK_SIZE = 7;

function buildDays(count: number, opts?: { labelToday?: boolean }): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    days.push({
      dow: opts?.labelToday && i === 0 ? "Today" : weekday,
      num: d.getDate(),
      full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      key: d.toISOString().slice(0, 10),
    });
  }
  return days;
}

function formatSlot(index: number) {
  return `${SLOTS[index]}${index < 5 ? "am" : "pm"}`;
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

const fieldClass =
  "w-full rounded-xl border border-[#d0dae8] bg-white px-3.5 py-3 text-[16px] text-ink outline-none transition-colors placeholder:text-[#98a4b8] focus:border-[#e8342b] focus:ring-2 focus:ring-[#e8342b]/15";

const chipBase =
  "rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors sm:text-[14px]";

function chipClass(on: boolean) {
  return on
    ? `${chipBase} border-[#e8342b] bg-[#fceeed] text-[#b4231c]`
    : `${chipBase} border-[#d0dae8] bg-white text-ink hover:border-[#b9c6d8]`;
}

const emptyPatient = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  patientType: "returning" as "new" | "returning",
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BookingMode>("checkin");
  const [provider, setProvider] = useState<BookingProviderInfo | null>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [service, setService] = useState(CHECKIN_REASONS[0]);
  const [day, setDay] = useState(0);
  const [weekPage, setWeekPage] = useState(0);
  const [time, setTime] = useState<number | null>(null);
  const [days, setDays] = useState<DayOption[]>([]);
  const [patient, setPatient] = useState(emptyPatient);

  const resetShared = useCallback(() => {
    setDone(false);
    setStep(1);
    setDay(0);
    setWeekPage(0);
    setTime(null);
    setPatient(emptyPatient);
  }, []);

  const open = useCallback(() => {
    resetShared();
    setMode("checkin");
    setProvider(null);
    setService(CHECKIN_REASONS[0]);
    setDays(buildDays(2, { labelToday: true }));
    setIsOpen(true);
  }, [resetShared]);

  const openAppointment = useCallback(
    (prv: BookingProviderInfo) => {
      resetShared();
      setMode("appointment");
      setProvider(prv);
      setService(APPOINTMENT_SERVICES[0]);
      setDays(buildDays(APPOINTMENT_DAYS));
      setIsOpen(true);
    },
    [resetShared],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setDone(false);
    setTime(null);
    setProvider(null);
    setStep(1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  const value = useMemo(() => ({ open, openAppointment }), [open, openAppointment]);

  const taken = mode === "checkin" ? CHECKIN_TAKEN : APPOINTMENT_TAKEN;
  const services = mode === "checkin" ? CHECKIN_REASONS : APPOINTMENT_SERVICES;
  const isAppointment = mode === "appointment";
  const maxWeek = Math.ceil(APPOINTMENT_DAYS / WEEK_SIZE) - 1;

  const patientReady =
    patient.firstName.trim().length > 1 &&
    patient.lastName.trim().length > 1 &&
    patient.email.includes("@") &&
    patient.phone.replace(/\D/g, "").length >= 10;

  const confirmation =
    time === null || !days[day]
      ? ""
      : isAppointment && provider
        ? `${patient.firstName}, your appointment with ${provider.name} is set for ${days[day].full} at ${formatSlot(time)} (${service.toLowerCase()}).`
        : `We'll see you ${days[day].full} at ${formatSlot(time)} for ${service.toLowerCase()}.`;

  const title = done
    ? isAppointment
      ? "Appointment confirmed"
      : "Check-in confirmed"
    : isAppointment
      ? "Book an appointment"
      : "Check in online";

  const subtitle = isAppointment
    ? provider
      ? `With ${provider.name}`
      : "Schedule a visit with your preferred clinician"
    : "Reserve your place — we'll text you when a room is ready";

  const primaryLabel =
    time === null
      ? "Select a time to continue"
      : isAppointment
        ? "Continue"
        : "Confirm check-in";

  const weekDays = days.slice(weekPage * WEEK_SIZE, weekPage * WEEK_SIZE + WEEK_SIZE);

  const goPrimary = () => {
    if (time === null) return;
    if (isAppointment) setStep(2);
    else setDone(true);
  };

  return (
    <BookingContext.Provider value={value}>
      <RevealController />
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={close}
        >
          {/* Mobile: bottom sheet · Desktop: compact centered panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            className={`flex w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_-12px_40px_rgba(27,42,74,.18)] sm:max-h-[min(780px,88vh)] sm:rounded-2xl sm:border sm:border-[#e1e8f2] sm:shadow-[0_24px_64px_rgba(27,42,74,.22)] ${
              isAppointment
                ? "max-h-[94dvh] sm:w-[min(640px,100%)]"
                : "max-h-[92dvh] sm:w-[min(460px,100%)]"
            } [animation:nsuc-rise_.22s_ease_both]`}
          >
            {/* Grab handle (mobile) */}
            <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-[#d0dae8]" />
            </div>

            {/* Header */}
            <div className="flex flex-none items-start justify-between gap-3 border-b border-[#eef2f7] px-5 pb-3.5 pt-2.5 sm:px-6 sm:pb-4 sm:pt-5">
              <div className="min-w-0">
                <h2 className="font-display text-[21px] font-extrabold tracking-[-.025em] text-ink sm:text-[24px]">
                  {title}
                </h2>
                {!done && (
                  <p className="mt-1 text-[13.5px] leading-snug text-muted sm:text-[14.5px]">
                    {subtitle}
                  </p>
                )}
                {isAppointment && !done && (
                  <div className="mt-2.5 flex gap-2">
                    {[1, 2].map((n) => (
                      <span
                        key={n}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.06em] ${
                          step === n
                            ? "bg-[#fceeed] font-semibold text-[#b4231c]"
                            : "bg-[#f2f5fa] text-muted"
                        }`}
                      >
                        {n === 1 ? "Schedule" : "Details"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 flex-none place-items-center rounded-full text-[20px] leading-none text-muted transition-colors hover:bg-[#f2f5fa] hover:text-ink"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
              {done ? (
                <div className="mx-auto max-w-md py-2 text-center sm:py-4">
                  <PlusMark cross="#E8342B" check="#F2F5FA" className="mx-auto mb-4 h-11 w-11" />
                  <h3 className="mb-2 font-display text-[22px] font-extrabold tracking-[-.02em] sm:text-[24px]">
                    {isAppointment ? "You're booked" : "Your place is reserved"}
                  </h3>
                  <p className="mb-5 text-[15px] leading-[1.55] text-muted sm:text-[16px]">
                    {confirmation}
                  </p>
                  <div className="mb-5 rounded-xl border border-[#e1e8f2] bg-[#f7f9fc] p-4 text-left text-[14.5px] leading-[1.65] text-ink sm:p-5 sm:text-[15px]">
                    {isAppointment ? (
                      <>
                        A confirmation will be sent to {patient.email}. Arrive five minutes early with
                        your photo ID and insurance card. Call{" "}
                        <a href={CLINIC.phoneHref}>{CLINIC.phone}</a> to reschedule.
                      </>
                    ) : (
                      <>
                        Bring your photo ID and insurance card. Arrive about five minutes early, or
                        call <a href={CLINIC.phoneHref}>{CLINIC.phone}</a> if plans change.
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="w-full rounded-xl bg-ink px-6 py-3.5 text-[16px] font-semibold text-white sm:w-auto sm:px-8"
                  >
                    Done
                  </button>
                </div>
              ) : isAppointment && step === 2 ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-[#e1e8f2] bg-[#f7f9fc] px-4 py-3 text-[14px] leading-[1.5]">
                    <div className="font-semibold text-ink">{provider?.name}</div>
                    <div className="mt-0.5 text-muted">
                      {days[day]?.full} · {time !== null ? formatSlot(time) : ""} · {service}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink">
                      First name
                      <input
                        value={patient.firstName}
                        onChange={(e) => setPatient((p) => ({ ...p, firstName: e.target.value }))}
                        className={fieldClass}
                        autoComplete="given-name"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink">
                      Last name
                      <input
                        value={patient.lastName}
                        onChange={(e) => setPatient((p) => ({ ...p, lastName: e.target.value }))}
                        className={fieldClass}
                        autoComplete="family-name"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink">
                    Email
                    <input
                      type="email"
                      value={patient.email}
                      onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                      className={fieldClass}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink">
                    Mobile phone
                    <input
                      type="tel"
                      value={patient.phone}
                      onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))}
                      className={fieldClass}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="(301) 555-0142"
                    />
                  </label>

                  <div>
                    <div className="mb-2 text-[13.5px] font-semibold text-ink">Patient type</div>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["returning", "Returning patient"],
                          ["new", "New patient"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPatient((p) => ({ ...p, patientType: value }))}
                          aria-pressed={patient.patientType === value}
                          className={chipClass(patient.patientType === value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:gap-4">
                  {isAppointment && provider && (
                    <div className="rounded-xl border border-[#e1e8f2] bg-[#f7f9fc] px-4 py-3">
                      <div className="font-mono text-[11px] uppercase tracking-[.08em] text-muted">
                        Clinician
                      </div>
                      <div className="mt-0.5 font-display text-[17px] font-bold tracking-[-.015em] text-ink">
                        {provider.name}
                      </div>
                      <div className="text-[13.5px] text-muted">{provider.title}</div>
                    </div>
                  )}

                  <section>
                    <h3 className="mb-2 text-[13px] font-semibold text-ink sm:text-[13.5px]">
                      {isAppointment ? "Type of visit" : "Reason for visit"}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {services.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setService(r)}
                          aria-pressed={service === r}
                          className={chipClass(service === r)}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-2 text-[13px] font-semibold text-ink sm:text-[13.5px]">
                      {isAppointment ? "Select a date" : "Select a day"}
                    </h3>

                    {isAppointment ? (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5 rounded-xl border border-[#d0dae8] bg-white px-3.5 py-2.5 text-[14px] font-semibold text-ink sm:text-[14.5px]">
                          <span className="text-[#e8342b]">
                            <CalendarIcon />
                          </span>
                          <span className="truncate">{days[day]?.full ?? "Select a date"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Previous week"
                            disabled={weekPage === 0}
                            onClick={() => setWeekPage((p) => Math.max(0, p - 1))}
                            className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#d0dae8] bg-white text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronIcon dir="left" />
                          </button>

                          <div className="grid min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-1.5">
                            {weekDays.map((d, i) => {
                              const index = weekPage * WEEK_SIZE + i;
                              const on = day === index;
                              return (
                                <button
                                  key={d.key}
                                  type="button"
                                  onClick={() => {
                                    setDay(index);
                                    setTime(null);
                                  }}
                                  aria-pressed={on}
                                  aria-label={d.full}
                                  className={`flex flex-col items-center rounded-[10px] border px-0.5 py-2 transition-colors sm:rounded-xl sm:py-2.5 ${
                                    on
                                      ? "border-[#e8342b] bg-[#fceeed] text-[#b4231c]"
                                      : "border-[#d0dae8] bg-white text-ink hover:border-[#b9c6d8]"
                                  }`}
                                >
                                  <span className="font-mono text-[9px] uppercase tracking-[.04em] opacity-70 sm:text-[10px]">
                                    {d.dow.slice(0, 3)}
                                  </span>
                                  <span className="mt-0.5 font-display text-[15px] font-extrabold tracking-[-.02em] sm:text-[17px]">
                                    {d.num}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            aria-label="Next week"
                            disabled={weekPage >= maxWeek}
                            onClick={() => setWeekPage((p) => Math.min(maxWeek, p + 1))}
                            className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#d0dae8] bg-white text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronIcon dir="right" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {days.map((d, i) => {
                          const on = day === i;
                          return (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => {
                                setDay(i);
                                setTime(null);
                              }}
                              aria-pressed={on}
                              className={`flex min-w-0 flex-1 flex-col items-center rounded-xl border px-2 py-2.5 transition-colors ${
                                on
                                  ? "border-[#e8342b] bg-[#fceeed] text-[#b4231c]"
                                  : "border-[#d0dae8] bg-white text-ink hover:border-[#b9c6d8]"
                              }`}
                            >
                              <span className="font-mono text-[10px] uppercase tracking-[.06em] opacity-70">
                                {d.dow}
                              </span>
                              <span className="mt-0.5 font-display text-[18px] font-extrabold tracking-[-.02em]">
                                {d.num}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-2 text-[13px] font-semibold text-ink sm:text-[13.5px]">
                      {isAppointment ? "Select a time" : "Preferred arrival time"}
                    </h3>
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                      {SLOTS.map((t, i) => {
                        const off = taken.has(i);
                        const on = time === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => !off && setTime(i)}
                            aria-pressed={on}
                            disabled={off}
                            className={`rounded-[10px] border px-1.5 py-2 font-mono text-[13px] font-medium transition-colors sm:rounded-xl sm:px-2 sm:py-2.5 sm:text-[13.5px] ${
                              off
                                ? "cursor-not-allowed border-[#e8eef6] bg-[#f2f5fa] text-[#98a4b8]"
                                : on
                                  ? "border-[#e8342b] bg-[#fceeed] text-[#b4231c]"
                                  : "border-[#d0dae8] bg-white text-ink hover:border-[#b9c6d8]"
                            }`}
                          >
                            {t}
                            {i < 5 ? "am" : "pm"}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Sticky footer actions */}
            {!done && (
              <div className="flex flex-none flex-col gap-2 border-t border-[#eef2f7] bg-white px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
                {!(isAppointment && step === 2) && (
                  <p className="text-[12.5px] leading-[1.45] text-muted">
                    {isAppointment
                      ? "For same-day illness or injury, use Check in instead."
                      : "Walk-ins are always welcome — this just reserves your place in line."}
                  </p>
                )}
                {isAppointment && step === 2 ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="order-2 rounded-xl border border-ink px-5 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white sm:order-1 sm:w-auto"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!patientReady}
                      onClick={() => patientReady && setDone(true)}
                      className="order-1 flex-1 rounded-xl bg-[#e8342b] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#ce291f] disabled:cursor-not-allowed disabled:opacity-40 sm:order-2"
                    >
                      Confirm appointment
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={time === null}
                    onClick={goPrimary}
                    className="w-full rounded-xl bg-[#e8342b] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#ce291f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {primaryLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </BookingContext.Provider>
  );
}

/** Opens the same-day check-in dialog (queue hold). */
export function CheckInButton({
  className,
  children = "Check in online",
}: {
  className?: string;
  children?: ReactNode;
}) {
  const { open } = useBooking();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}

/** Opens the appointment booking dialog for a specific clinician. */
export function BookAppointmentButton({
  provider,
  className,
  children = "Book an appointment",
  "aria-label": ariaLabel,
}: {
  provider: BookingProviderInfo;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}) {
  const { openAppointment } = useBooking();
  return (
    <button
      type="button"
      onClick={() => openAppointment(provider)}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
