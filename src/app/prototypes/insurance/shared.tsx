"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { CheckInButton } from "@/components/booking-modal";
import { CLINIC, INSURER_LOGOS, PRICES } from "@/lib/site-data";

export { CLINIC, INSURER_LOGOS, PRICES };

export function ProtoShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-mist text-ink pb-24">{children}</div>;
}

export function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={`mb-3.5 font-mono text-[12.5px] uppercase tracking-[.11em] ${
        light ? "text-coral" : "text-brand"
      }`}
    >
      {children}
    </div>
  );
}

export function PriceAmount({ price }: { price: string }) {
  const from = price.startsWith("from ");
  const value = price.replace(/^from /, "");
  return (
    <span className="font-display text-[24px] font-extrabold text-brand tabular-nums">
      {from ? <span className="mr-1.5 text-[14px] font-medium text-muted">from</span> : null}
      {value}
    </span>
  );
}

/** Grayscale → color logo grid (no white cards). */
export function LogoGrid({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTouch = useCallback((name: string) => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    setActive(name);
    touchTimer.current = setTimeout(() => setActive(null), 1400);
  }, []);

  return (
    <ul className={`grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 md:grid-cols-5 ${className}`}>
      {INSURER_LOGOS.map((logo) => (
        <li key={logo.name}>
          <button
            type="button"
            aria-label={logo.name}
            className="flex h-14 w-full items-center justify-center bg-transparent p-0"
            onMouseEnter={() => setActive(logo.name)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(logo.name)}
            onBlur={() => setActive(null)}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") onTouch(logo.name);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt=""
              width={logo.width}
              height={40}
              draggable={false}
              className="h-9 w-auto max-w-[140px] object-contain transition-[filter,opacity,transform] duration-[420ms] ease-out"
              style={{
                filter: active === logo.name ? "grayscale(0)" : "grayscale(1) contrast(1.05)",
                opacity: active === logo.name ? 1 : 0.7,
                transform: active === logo.name ? "scale(1.04)" : "scale(1)",
              }}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Slow marquee of logos without card chrome. */
export function LogoMarquee() {
  const [active, setActive] = useState<string | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strip = [...INSURER_LOGOS, ...INSURER_LOGOS];

  const onTouch = useCallback((name: string) => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    setActive(name);
    touchTimer.current = setTimeout(() => setActive(null), 1400);
  }, []);

  return (
    <div className="ins-proto-marquee relative overflow-hidden">
      <div className="ins-proto-marquee-track flex w-max items-center gap-10 py-2">
        {strip.map((logo, i) => (
          <button
            key={`${logo.name}-${i}`}
            type="button"
            aria-label={logo.name}
            className="flex h-12 shrink-0 items-center bg-transparent p-0"
            onMouseEnter={() => setActive(logo.name)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(logo.name)}
            onBlur={() => setActive(null)}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") onTouch(logo.name);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt=""
              width={logo.width}
              height={40}
              draggable={false}
              className="h-9 w-auto max-w-[150px] object-contain transition-[filter,opacity,transform] duration-[420ms] ease-out"
              style={{
                filter: active === logo.name ? "grayscale(0)" : "grayscale(1) contrast(1.05)",
                opacity: active === logo.name ? 1 : 0.68,
                transform: active === logo.name ? "scale(1.04)" : "scale(1)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function BillingHelp() {
  const items = [
    {
      title: "Already have a bill?",
      body: "Pay online in about a minute with your account number, or call billing Monday to Friday.",
      href: "/billing",
      cta: "Pay my bill",
    },
    {
      title: "Need an itemized receipt?",
      body: "We'll email one the same day — useful for HSA, FSA and out-of-network reimbursement.",
      href: "/contact",
      cta: "Request a receipt",
    },
    {
      title: "Questions about coverage?",
      body: "Call before you come in and we'll verify your benefits while you're on the phone.",
      href: CLINIC.phoneHref,
      cta: `Call ${CLINIC.phone}`,
      external: true,
    },
  ] as const;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="border-t border-line pt-5">
          <h3 className="mb-2 font-display text-[19px] font-bold tracking-[-.015em]">{item.title}</h3>
          <p className="mb-4 text-[15px] leading-[1.55] text-muted">{item.body}</p>
          {"external" in item && item.external ? (
            <a href={item.href} className="text-[15px] font-semibold text-brand no-underline hover:text-brand-dark">
              {item.cta} →
            </a>
          ) : (
            <Link href={item.href} className="text-[15px] font-semibold text-brand no-underline hover:text-brand-dark">
              {item.cta} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export function ReadyCta() {
  return (
    <section className="bg-ink px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)] text-cloud">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-[32em]">
          <h2 className="mb-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold tracking-[-.028em]">
            Ready to be seen? No appointment needed.
          </h2>
          <p className="text-[16.5px] leading-[1.55] text-cloud-soft">
            Most patients are seen, treated, and home within an hour. Walk in, or check in online and hold your place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CheckInButton className="rounded-xl bg-brand px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-press" />
          <a
            href={CLINIC.mapsHref}
            target="_blank"
            rel="noopener"
            className="rounded-xl border border-cloud/30 px-6 py-3.5 text-[15px] font-semibold !text-cloud no-underline transition-colors hover:bg-cloud/10 hover:no-underline"
          >
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}
