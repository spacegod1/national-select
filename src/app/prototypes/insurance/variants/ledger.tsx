"use client";

import {
  BillingHelp,
  CLINIC,
  LogoGrid,
  PriceAmount,
  PRICES,
  ProtoShell,
  ReadyCta,
  SectionLabel,
} from "../shared";

/** Price-first utility page: self-pay table leads; insurers sit quietly below. */
export function LedgerInsurance() {
  return (
    <ProtoShell>
      <section className="border-b border-line bg-panel px-[clamp(16px,4vw,40px)] py-[clamp(40px,7vw,72px)]">
        <div className="mx-auto max-w-[920px]">
          <SectionLabel>Insurance &amp; pricing</SectionLabel>
          <h1 className="ins-fade-up font-display text-[clamp(36px,5.4vw,56px)] font-extrabold leading-[1.04] tracking-[-.032em]">
            Know what you&apos;ll pay before you&apos;re seen.
          </h1>
          <p className="ins-fade-up ins-d1 mt-4 max-w-[36em] text-[17px] leading-[1.55] text-muted">
            Flat self-pay rates are posted here. We also accept most major plans — bring your card and a photo ID.
          </p>
          <div className="ins-fade-up ins-d2 mt-7 flex flex-wrap gap-3">
            <a
              href="#self-pay"
              className="rounded-xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-mist no-underline transition-colors hover:bg-ink-soft"
            >
              View self-pay prices
            </a>
            <a
              href="#plans"
              className="rounded-xl border-[1.5px] border-ink px-6 py-3.5 text-[15px] font-semibold text-ink no-underline transition-colors hover:bg-ink hover:text-mist"
            >
              Accepted insurance
            </a>
          </div>
        </div>
      </section>

      <section id="self-pay" className="px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-[920px]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-3">
            <h2 className="font-display text-[clamp(26px,3.2vw,34px)] font-extrabold tracking-[-.025em]">
              Flat self-pay rates
            </h2>
            <span className="font-mono text-[12px] uppercase tracking-[.1em] text-muted">Paid at visit</span>
          </div>
          <div className="divide-y divide-line">
            {PRICES.map((pr, i) => (
              <div
                key={pr.name}
                className="ins-fade-up flex flex-col justify-between gap-2 py-5 sm:flex-row sm:items-baseline"
                style={{ animationDelay: `${80 + i * 40}ms` }}
              >
                <div>
                  <div className="text-[17px] font-semibold text-ink">{pr.name}</div>
                  <div className="mt-0.5 text-[14.5px] text-muted">{pr.note}</div>
                </div>
                <PriceAmount price={pr.price} />
              </div>
            ))}
          </div>
          <p className="mt-8 border-l-2 border-brand pl-4 text-[15px] leading-[1.55] text-muted">
            <strong className="text-ink">Financial hardship?</strong> Ask at the front desk. We keep a sliding scale,
            and nobody is turned away for a same-day emergency assessment.
          </p>
        </div>
      </section>

      <section id="plans" className="border-y border-line bg-white px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,80px)]">
        <div className="mx-auto max-w-[920px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Plans we accept</SectionLabel>
              <h2 className="font-display text-[clamp(26px,3.2vw,34px)] font-extrabold tracking-[-.025em]">
                Most major insurance welcome
              </h2>
            </div>
            <a href={CLINIC.phoneHref} className="text-[15px] font-semibold text-brand no-underline hover:text-brand-dark">
              Call to verify →
            </a>
          </div>
          <LogoGrid />
          <p className="mt-6 text-[14px] text-muted">
            Hover or tap a logo for color. If your plan isn&apos;t listed, call — we&apos;ll check it in a minute.
          </p>
        </div>
      </section>

      <section className="px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-[920px]">
          <SectionLabel>Billing help</SectionLabel>
          <h2 className="mb-8 font-display text-[clamp(26px,3.2vw,34px)] font-extrabold tracking-[-.025em]">
            After your visit
          </h2>
          <BillingHelp />
        </div>
      </section>

      <ReadyCta />
    </ProtoShell>
  );
}
