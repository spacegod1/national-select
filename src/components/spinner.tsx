import type { ReactNode } from "react";

/** A small ring that turns while something is being saved or loaded. It takes the colour of the text around it. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`ns-spinner flex-none ${className}`}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeOpacity=".28" strokeWidth="2.5" />
      <path d="M17.5 10A7.5 7.5 0 0010 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** What a button says while its action runs: the spinner, then the words. */
export function Busy({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-2 align-middle">
      <Spinner />
      {children}
    </span>
  );
}
