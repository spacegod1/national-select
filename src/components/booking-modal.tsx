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

type BookingContextValue = { open: () => void };
const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}

const REASONS = [
  "Illness or symptoms",
  "Injury",
  "Physical or form",
  "Lab test",
  "Vaccine",
  "Something else",
];

const SLOTS = ["9:00", "9:40", "10:20", "11:00", "11:40", "1:00", "1:40", "2:20", "3:00", "3:40", "4:20", "5:00"];
const TAKEN = new Set([2, 5, 9]);

type DayOption = { dow: string; num: number; full: string };

function buildDays(): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      dow: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      num: d.getDate(),
      full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    });
  }
  return days;
}

function chipStyle(on: boolean): React.CSSProperties {
  return on
    ? { borderColor: "#E8342B", background: "#FCEEED", color: "#B4231C" }
    : { borderColor: "#C7D1E0", background: "#fff", color: "#1B2A4A" };
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<number | null>(null);
  const [days, setDays] = useState<DayOption[]>([]);

  const open = useCallback(() => {
    setDays(buildDays());
    setDone(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setDone(false);
    setTime(null);
  }, []);

  // Lock scroll + close on Escape while the dialog is open.
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

  const value = useMemo(() => ({ open }), [open]);

  const confirmLabel = time === null ? "Pick a time to continue" : "Confirm my check-in";
  const confirmation =
    time === null || !days[day]
      ? ""
      : `We'll see you ${days[day].full} at ${SLOTS[time]}${time < 5 ? "am" : "pm"} for ${reason.toLowerCase()}.`;

  return (
    <BookingContext.Provider value={value}>
      <RevealController />
      {children}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto bg-ink/50 p-5"
            onClick={close}
          />
          <div
            role="dialog"
            aria-label="Check in online"
            className="fixed left-1/2 top-1/2 z-[101] max-h-[88vh] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[22px] bg-mist p-[clamp(22px,3vw,32px)] shadow-[0_30px_80px_rgba(27,42,74,.35)] [animation:nsuc-rise-center_.22s_ease_both]"
          >
            <div className="mb-[18px] flex items-start justify-between gap-4">
              <div>
                <h2 className="mb-1.5 font-display text-[26px] font-extrabold tracking-[-.024em]">
                  {done ? "Check-in confirmed" : "Check in online"}
                </h2>
                {!done && (
                  <p className="text-[15.5px] leading-[1.5] text-muted">
                    Hold your place and wait at home. Takes about a minute.
                  </p>
                )}
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="h-[38px] w-[38px] flex-none rounded-[10px] border-[1.5px] border-field text-[19px] leading-none"
              >
                ×
              </button>
            </div>

            {!done ? (
              <div className="flex flex-col gap-[22px]">
                {/* Reason */}
                <div>
                  <div className="mb-2.5 text-[14.5px] font-semibold">What brings you in?</div>
                  <div className="flex flex-wrap gap-2">
                    {REASONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setReason(r)}
                        aria-pressed={reason === r}
                        style={chipStyle(reason === r)}
                        className="rounded-[11px] border-[1.5px] px-[15px] py-2.5 text-[14.5px] font-medium"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day */}
                <div>
                  <div className="mb-2.5 text-[14.5px] font-semibold">Pick a day</div>
                  <div className="flex gap-2 overflow-auto pb-1">
                    {days.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDay(i);
                          setTime(null);
                        }}
                        aria-pressed={day === i}
                        style={chipStyle(day === i)}
                        className="min-w-[78px] flex-none rounded-[13px] border-[1.5px] px-2.5 py-3 text-center"
                      >
                        <span className="block font-mono text-[11.5px] uppercase tracking-[.07em] opacity-75">
                          {d.dow}
                        </span>
                        <span className="mt-[3px] block font-display text-[20px] font-extrabold tracking-[-.02em]">
                          {d.num}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <div className="mb-2.5 text-[14.5px] font-semibold">Pick a time</div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
                    {SLOTS.map((t, i) => {
                      const off = TAKEN.has(i);
                      const on = time === i;
                      const base = chipStyle(on);
                      return (
                        <button
                          key={i}
                          onClick={() => !off && setTime(i)}
                          aria-pressed={on}
                          disabled={off}
                          style={{
                            borderColor: off ? "#E1E8F2" : base.borderColor,
                            background: off ? "#E9EEF6" : base.background,
                            color: off ? "#98A4B8" : base.color,
                            opacity: off ? 0.7 : 1,
                            cursor: off ? "not-allowed" : "pointer",
                          }}
                          className="rounded-[11px] border-[1.5px] px-2 py-[11px] font-mono text-[14.5px] font-medium"
                        >
                          {t}
                          {i < 5 ? "am" : "pm"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => time !== null && setDone(true)}
                  className="rounded-[12px] bg-[#e8342b] p-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#ce291f]"
                >
                  {confirmLabel}
                </button>
                <p className="-mt-2 text-[13.5px] leading-[1.55] text-muted">
                  Walk-ins are always welcome — booking just holds your place so you can wait at home.
                </p>
              </div>
            ) : (
              <div className="px-1.5 pb-2 pt-4 text-center">
                <PlusMark
                  cross="#E8342B"
                  check="#F2F5FA"
                  className="mx-auto mb-4 h-12 w-12"
                />
                <h3 className="mb-2.5 font-display text-[24px] font-extrabold tracking-[-.022em]">
                  You&apos;re on the list
                </h3>
                <p className="mb-5 text-[16.5px] leading-[1.6] text-muted">{confirmation}</p>
                <div className="mb-5 rounded-[16px] border border-line bg-white p-5 text-left text-[15.5px] leading-[1.7]">
                  Bring your photo ID and insurance card. Arrive about five minutes early, and give us a
                  call at <a href={CLINIC.phoneHref}>{CLINIC.phone}</a> if your plans change.
                </div>
                <button
                  onClick={close}
                  className="rounded-[12px] bg-ink px-7 py-[15px] text-[16px] font-semibold text-mist"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </BookingContext.Provider>
  );
}

/** A "Check in online" button that opens the booking dialog. */
export function CheckInButton({
  className,
  children = "Check in online",
}: {
  className?: string;
  children?: ReactNode;
}) {
  const { open } = useBooking();
  return (
    <button onClick={open} className={className}>
      {children}
    </button>
  );
}
