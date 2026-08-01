"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function SiteHeader() {
  const { open: openBooking } = useBooking();
  const isCurrent = useIsCurrent();
  const status = useLiveStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useMounted();

  const pathname = usePathname();
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const dot = status.isOpen ? "var(--color-open)" : "var(--color-closed)";

  const mobileMenu =
    mounted &&
    createPortal(
      <div
        className={`min-[1121px]:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`fixed inset-0 z-[200] bg-ink/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`fixed inset-y-0 right-0 z-[201] flex h-[100dvh] w-[min(360px,100vw)] flex-col bg-white shadow-[-16px_0_48px_rgba(27,42,74,.18)] transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
            <div>
              <div className="font-display text-[15px] font-bold tracking-[-.01em] text-ink">
                Menu
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: dot }}
                  aria-hidden="true"
                />
                <span suppressHydrationWarning>{status.line}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full text-[22px] leading-none text-muted transition-colors hover:bg-[#f2f5fa] hover:text-ink"
            >
              ×
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            <div className="flex flex-col">
              {NAV.map((item) => {
                const current = isCurrent(item);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3.5 text-[16.5px] no-underline transition-colors hover:no-underline ${
                      current
                        ? "bg-[#fceeed] font-semibold text-[#e8342b]"
                        : "font-medium text-ink hover:bg-[#f2f5fa]"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`text-[18px] leading-none ${current ? "text-[#e8342b]" : "text-[#c7d1e0]"}`}
                    >
                      ›
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mx-3.5 my-3 h-px bg-[#e8eef6]" />

            <div className="flex flex-col">
              <a
                href={CLINIC.phoneHref}
                className="rounded-xl px-3.5 py-3.5 text-[16px] font-semibold !text-ink no-underline hover:bg-[#f2f5fa] hover:no-underline"
              >
                Call {CLINIC.phone}
              </a>
              <Link
                href="/billing"
                className="rounded-xl px-3.5 py-3.5 text-[16px] font-semibold !text-ink no-underline hover:bg-[#f2f5fa] hover:no-underline"
              >
                Pay my bill
              </Link>
            </div>
          </nav>

          <div className="border-t border-[#eef2f7] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
              className="mb-3 w-full rounded-xl bg-[#e8342b] py-3.5 text-[15.5px] font-semibold text-white transition-colors hover:bg-[#ce291f]"
            >
              Check in online
            </button>
            <div className="rounded-xl bg-[#f2f5fa] px-3.5 py-3 text-[13px] leading-[1.45] text-muted">
              Mon–Fri 8am–8pm · Sat–Sun 9am–5pm
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
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

          {/* Desktop nav */}
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
          <div className="flex items-center gap-1.5 min-[1121px]:hidden">
            <button
              onClick={openBooking}
              className="flex items-center gap-1.5 rounded-full bg-[#e8342b] px-3.5 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#d42e24]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              Check in
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-[#e8eef6]"
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-[18px] rounded-full bg-ink transition-all duration-200 ${
                  menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px]"
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-[18px] rounded-full bg-ink transition-all duration-200 ${
                  menuOpen ? "scale-x-0 opacity-0" : "opacity-100"
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-[18px] rounded-full bg-ink transition-all duration-200 ${
                  menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px]"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {mobileMenu}
    </>
  );
}
