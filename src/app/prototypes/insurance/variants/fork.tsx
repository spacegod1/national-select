"use client";

import { useState } from "react";
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

type Path = "insurance" | "selfpay";

/** Dual-path page: patient chooses insurance vs self-pay; content reveals for that path. */
export function ForkInsurance() {
  const [path, setPath] = useState<Path>("insurance");

  return (
    <ProtoShell>
      <section className="px-[clamp(16px,4vw,40px)] pb-10 pt-[clamp(36px,6vw,64px)]">
        <div className="mx-auto max-w-[800px] text-center">
          <SectionLabel>Insurance &amp; pricing</SectionLabel>
          <h1 className="ins-fade-up font-display text-[clamp(36px,5.2vw,54px)] font-extrabold leading-[1.04] tracking-[-.032em]">
            How are you paying today?
          </h1>
          <p className="ins-fade-up ins-d1 mx-auto mt-4 max-w-[34em] text-[17px] leading-[1.55] text-muted">
            Pick a path — we&apos;ll show the details that matter for your visit. You can switch anytime.
          </p>

          <div
            className="ins-fade-up ins-d2 mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-2 rounded-2xl border border-line bg-white p-1.5"
            role="tablist"
            aria-label="Payment path"
          >
            <button
              type="button"
              role="tab"
              aria-selected={path === "insurance"}
              className={`rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors ${
                path === "insurance" ? "bg-ink text-mist" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setPath("insurance")}
            >
              I have insurance
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={path === "selfpay"}
              className={`rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors ${
                path === "selfpay" ? "bg-ink text-mist" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setPath("selfpay")}
            >
              I&apos;m self-pay
            </button>
          </div>
        </div>
      </section>

      {path === "insurance" ? (
        <section key="insurance" className="ins-fade-up px-[clamp(16px,4vw,40px)] pb-[clamp(48px,7vw,88px)]">
          <div className="mx-auto max-w-[920px] rounded-[24px] border border-line bg-white px-[clamp(20px,4vw,40px)] py-10">
            <h2 className="font-display text-[clamp(26px,3.2vw,34px)] font-extrabold tracking-[-.025em]">
              Plans we accept
            </h2>
            <p className="mt-3 max-w-[36em] text-[16px] leading-[1.55] text-muted">
              Bring your insurance card and a photo ID. Hover or tap a logo for color. Not sure we take your plan?
              Call and we&apos;ll verify while you&apos;re on the phone.
            </p>
            <div className="mt-8">
              <LogoGrid />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
              <a
                href={CLINIC.phoneHref}
                className="rounded-xl bg-brand px-6 py-3.5 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-brand-press"
              >
                Call to verify coverage
              </a>
              <button
                type="button"
                className="text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
                onClick={() => setPath("selfpay")}
              >
                See self-pay prices instead
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section key="selfpay" className="ins-fade-up px-[clamp(16px,4vw,40px)] pb-[clamp(48px,7vw,88px)]">
          <div className="mx-auto max-w-[920px] rounded-[24px] border border-line bg-white px-[clamp(20px,4vw,40px)] py-10">
            <h2 className="font-display text-[clamp(26px,3.2vw,34px)] font-extrabold tracking-[-.025em]">
              Flat self-pay rates
            </h2>
            <p className="mt-3 max-w-[36em] text-[16px] leading-[1.55] text-muted">
              Paid at the time of your visit. Tests and procedures are listed separately so nothing is hidden.
            </p>
            <div className="mt-6 divide-y divide-line">
              {PRICES.map((pr) => (
                <div
                  key={pr.name}
                  className="flex flex-col justify-between gap-2 py-5 sm:flex-row sm:items-baseline"
                >
                  <div>
                    <div className="text-[16.5px] font-semibold">{pr.name}</div>
                    <div className="mt-0.5 text-[14px] text-muted">{pr.note}</div>
                  </div>
                  <PriceAmount price={pr.price} />
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-panel px-5 py-4 text-[15px] leading-[1.55] text-muted">
              <strong className="text-ink">Financial hardship?</strong> Ask at the front desk. Sliding scale available —
              nobody is turned away for a same-day emergency assessment.
            </div>
            <button
              type="button"
              className="mt-6 text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
              onClick={() => setPath("insurance")}
            >
              ← Back to accepted insurance
            </button>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-panel px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,80px)]">
        <div className="mx-auto max-w-[920px]">
          <SectionLabel>Always available</SectionLabel>
          <h2 className="mb-8 font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-.025em]">
            Billing help
          </h2>
          <BillingHelp />
        </div>
      </section>

      <ReadyCta />
    </ProtoShell>
  );
}
