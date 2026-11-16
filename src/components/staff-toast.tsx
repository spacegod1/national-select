"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FLASH_COOKIE, FLASH_MESSAGES, FLASH_PATH, isFlashCode } from "@/lib/staff/flash";

/*
 * Toasts for the staff area: a short note in the corner that says an action
 * worked or didn't, then leaves on its own. They sit above the page without
 * blocking it. A form's own message still says what to fix, next to the form.
 */

type Tone = "success" | "error";
type Toast = { id: number; tone: Tone; title: string; detail?: string; leaving: boolean };

export type ToastApi = {
  /** The action worked. `detail` is an optional second line. */
  success: (title: string, detail?: string) => void;
  /** The action didn't work. `detail` can say why. */
  error: (title: string, detail?: string) => void;
};

/** No more than this many show at once. An older one makes way for a new one. */
const MAX_SHOWN = 3;
/** How long each stays. Bad news stays longer, so there is time to read why. */
const STAY_MS: Record<Tone, number> = { success: 4500, error: 7500 };
/** Matches the leaving transition on `.staff-toast` in globals.css. */
const LEAVE_MS = 180;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast needs a ToastProvider above it.");
  return api;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastId = useRef(0);

  const show = useCallback((tone: Tone, title: string, detail?: string) => {
    lastId.current += 1;
    const toast: Toast = { id: lastId.current, tone, title, detail, leaving: false };
    setToasts((current) => [...current.slice(-(MAX_SHOWN - 1)), toast]);
  }, []);
  const leave = useCallback((id: number) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
  }, []);
  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, detail) => show("success", title, detail),
      error: (title, detail) => show("error", title, detail),
    }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      <FlashReader api={api} />
      {/* Here from the start, so a screen reader hears each toast as it is added. */}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-50 flex w-[min(380px,calc(100vw-32px))] flex-col gap-2 max-md:left-4 max-md:w-auto"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onLeave={leave} onGone={remove} />
        ))}
      </div>
    </ToastContext>
  );
}

/** Shows the message an action left behind before it sent the person to this page. */
function FlashReader({ api }: { api: ToastApi }) {
  const pathname = usePathname();

  useEffect(() => {
    const entry = document.cookie.split("; ").find((part) => part.startsWith(`${FLASH_COOKIE}=`));
    if (!entry) return;
    // Cleared first, so it is shown once.
    document.cookie = `${FLASH_COOKIE}=; path=${FLASH_PATH}; max-age=0`;
    const code = decodeURIComponent(entry.slice(FLASH_COOKIE.length + 1));
    if (!isFlashCode(code)) return;
    const message = FLASH_MESSAGES[code];
    api.success(message.title, message.detail);
  }, [pathname, api]);

  return null;
}

function ToastCard({
  toast,
  onLeave,
  onGone,
}: {
  toast: Toast;
  onLeave: (id: number) => void;
  onGone: (id: number) => void;
}) {
  // The clock stops while the pointer or the keyboard is on it.
  const [held, setHeld] = useState(false);
  const { id, tone, leaving } = toast;

  useEffect(() => {
    if (held || leaving) return;
    const timer = setTimeout(() => onLeave(id), STAY_MS[tone]);
    return () => clearTimeout(timer);
  }, [held, leaving, id, tone, onLeave]);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => onGone(id), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [leaving, id, onGone]);

  return (
    <div
      data-leaving={leaving ? "" : undefined}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="staff-toast pointer-events-auto flex items-start gap-3 rounded-[14px] bg-ink py-3 pl-3.5 pr-2.5 text-left font-sans text-[14.5px] font-normal normal-case leading-[1.4] tracking-normal text-white shadow-[0_18px_40px_-14px_rgba(27,42,74,.7)]"
    >
      <span
        aria-hidden="true"
        className={`mt-px grid h-[22px] w-[22px] flex-none place-items-center rounded-full ${
          tone === "success" ? "bg-open" : "bg-brand"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
          <path
            d={tone === "success" ? "M4.5 10.5l3.5 3.5 7.5-8" : "M10 4.5v6.5M10 15v.5"}
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="min-w-0 flex-1 py-px">
        <p className="font-semibold">
          {tone === "error" ? <span className="sr-only">Problem: </span> : null}
          {toast.title}
        </p>
        {toast.detail ? <p className="mt-0.5 break-words text-[13.5px] text-cloud-soft">{toast.detail}</p> : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onLeave(id)}
        className="-my-0.5 grid h-7 w-7 flex-none place-items-center rounded-[8px] text-white/60 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:outline-white"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
          <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
