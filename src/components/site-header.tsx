"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useBooking } from "@/components/booking-modal";
import {
  CLINIC,
  MAIN_NAV,
  NAV,
  UTILITY_NAV,
  getStatus,
  type ClinicStatus,
  type NavItem,
} from "@/lib/site-data";

function useIsCurrent() {
  const pathname = usePathname();
  return (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };
}

function useLiveStatus(): ClinicStatus {
  const [status, setStatus] = useState<ClinicStatus>(() => getStatus());
  useEffect(() => {
    const update = () => setStatus(getStatus());
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);
  return status;
}

export function SiteHeader() {
  const { open: openBooking } = useBooking();
  const isCurrent = useIsCurrent();
  const status = useLiveStatus();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the drawer whenever the route changes.
  const pathname = usePathname();
  useEffect(() => setMenuOpen(false), [pathname]);

  const dot = status.isOpen ? "var(--color-open)" : "var(--color-closed)";

  return (
    <header className="sticky top-0 z-[70] border-b border-line bg-mist/95 backdrop-blur-[10px]">
      {/* Utility bar */}
      <div className="bg-ink text-cloud">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-end gap-x-[22px] gap-y-2 px-[clamp(16px,4vw,40px)] py-[7px] text-[13.5px]">
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1 leading-[1.5]">
            {UTILITY_NAV.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="whitespace-nowrap text-[13.5px] no-underline transition-colors hover:!text-white hover:no-underline"
                style={{ color: isCurrent(item) ? "var(--color-coral)" : "#d8dde7" }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={CLINIC.phoneHref}
              className="whitespace-nowrap font-semibold !text-cloud no-underline hover:no-underline"
            >
              {CLINIC.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-[clamp(16px,4vw,40px)] py-3.5">
        <Link href="/" aria-label={`${CLINIC.name}, home`} className="block flex-none py-0.5">
          <Image
            src="/logo.png"
            alt={CLINIC.name}
            width={106}
            height={46}
            priority
            className="h-[46px] w-auto"
          />
        </Link>

        {/* Desktop nav (source breakpoint: 1120px) */}
        <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 min-[1121px]:flex">
          {MAIN_NAV.map((item) => {
            const current = isCurrent(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className="rounded-[9px] px-3 py-[9px] text-[15px] no-underline transition-colors hover:!bg-panel hover:!text-ink hover:no-underline"
                style={{ color: current ? "#e8342b" : "#1b2a4a", fontWeight: current ? 600 : 500 }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden flex-none items-center gap-2.5 min-[1121px]:flex">
          <Link
            href="/billing"
            className="rounded-[11px] border-[1.5px] border-ink px-[18px] py-[11px] text-[15px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline"
          >
            Pay my bill
          </Link>
          <button
            onClick={openBooking}
            className="flex items-center gap-2 rounded-md border-b-2 border-[#b02820] bg-[#e8342b] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#d42e24] active:border-b-0 active:translate-y-px"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            Check in
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 min-[1121px]:hidden">
          <button
            onClick={openBooking}
            className="flex items-center gap-1.5 rounded-md border-b-2 border-[#b02820] bg-[#e8342b] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#d42e24]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            Check in
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center gap-1 rounded-[11px] border-[1.5px] border-field"
          >
            <span className="block h-0.5 w-[19px] rounded-sm bg-ink" />
            <span className="block h-0.5 w-[19px] rounded-sm bg-ink" />
            <span className="block h-0.5 w-[19px] rounded-sm bg-ink" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="min-[1121px]:hidden">
          <div className="fixed inset-0 z-[90] bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div
            role="dialog"
            aria-label="Menu"
            className="fixed inset-y-0 right-0 z-[91] flex w-[min(340px,88vw)] flex-col gap-1.5 overflow-auto bg-mist p-5 shadow-[-20px_0_50px_rgba(27,42,74,.18)] [animation:nsuc-rise_.25s_ease_both]"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-display text-[16px] font-extrabold tracking-[-.01em]">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="h-10 w-10 rounded-[10px] border-[1.5px] border-field text-[19px] leading-none"
              >
                ×
              </button>
            </div>
            {NAV.map((item) => {
              const current = isCurrent(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-[11px] px-3 py-[13px] text-left text-[17px] no-underline hover:no-underline"
                  style={{
                    color: current ? "#e8342b" : "#1b2a4a",
                    fontWeight: current ? 600 : 500,
                    background: current ? "var(--color-pink)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="my-3 h-px bg-line" />
            <a
              href={CLINIC.phoneHref}
              className="rounded-[11px] px-3 py-[13px] text-[17px] font-semibold !text-ink no-underline hover:no-underline"
            >
              Call {CLINIC.phone}
            </a>
            <Link
              href="/billing"
              className="rounded-[11px] px-3 py-[13px] text-left text-[17px] font-semibold !text-ink no-underline hover:no-underline"
            >
              Pay my bill
            </Link>
            <button
              onClick={openBooking}
              className="mt-1.5 rounded-[12px] bg-[#e8342b] p-[15px] text-[17px] font-semibold text-white"
            >
              Check in online
            </button>
            <div className="mt-3.5 rounded-[12px] bg-panel p-3.5 text-[14px] leading-[1.5]">
              <div className="mb-1 font-semibold" suppressHydrationWarning>
                {status.line}
              </div>
              <div className="text-muted">Mon–Fri 8am–8pm · Sat–Sun 9am–5pm</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
