"use client";

import Image from "next/image";
import {
  BillingHelp,
  CLINIC,
  LogoMarquee,
  PriceAmount,
  PRICES,
  ProtoShell,
  ReadyCta,
  SectionLabel,
} from "../shared";

/** Logo-led atmospheric page: brand marks + photo first, pricing as a calm secondary ledger. */
export function GalleryInsurance() {
  return (
    <ProtoShell>
      <section className="relative min-h-[58vh] overflow-hidden">
        <Image
          src="/clinician_consultation.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/70 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
        <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-[1240px] flex-col justify-end px-[clamp(16px,4vw,40px)] pb-12 pt-20">
          <h1 className="ins-fade-up max-w-[14em] font-display text-[clamp(40px,6vw,64px)] font-extrabold leading-[1.02] tracking-[-.034em] text-white">
            Clear prices. Real coverage.
          </h1>
          <p className="ins-fade-up ins-d1 mt-4 max-w-[30em] text-[17px] leading-[1.55] text-white/80">
            We take most major plans, and self-pay rates are flat and posted — no hospital-style surprise bills.
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-white px-[clamp(16px,4vw,40px)] py-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <SectionLabel>Plans we accept</SectionLabel>
            <a href={CLINIC.phoneHref} className="text-[14px] font-semibold text-brand no-underline">
              Call {CLINIC.phone} to verify
            </a>
          </div>
          <LogoMarquee />
        </div>
      </section>

      <section className="px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)]">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <SectionLabel>Self-pay</SectionLabel>
            <h2 className="mb-4 font-display text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-.028em]">
              Flat rates, paid when you&apos;re seen.
            </h2>
            <p className="mb-6 max-w-[32em] text-[16.5px] leading-[1.55] text-muted">
              Tests and procedures are listed separately so nothing is hidden. Sliding scale available if you ask.
            </p>
            <div className="relative aspect-[4/5] max-w-md overflow-hidden rounded-[24px]">
              <Image
                src="/stethoscope_desk.png"
                alt=""
                fill
                className="object-cover"
                sizes="40vw"
              />
            </div>
          </div>
          <div className="rounded-[22px] border border-line bg-white px-6 py-2 sm:px-8">
            {PRICES.map((pr) => (
              <div
                key={pr.name}
                className="flex flex-col justify-between gap-2 border-b border-line py-5 last:border-0 sm:flex-row sm:items-baseline"
              >
                <div>
                  <div className="text-[16.5px] font-semibold">{pr.name}</div>
                  <div className="mt-0.5 text-[14px] text-muted">{pr.note}</div>
                </div>
                <PriceAmount price={pr.price} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-panel px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-[1240px]">
          <SectionLabel>Billing help</SectionLabel>
          <h2 className="mb-8 font-display text-[clamp(26px,3.4vw,36px)] font-extrabold tracking-[-.025em]">
            Need help after the visit?
          </h2>
          <BillingHelp />
        </div>
      </section>

      <ReadyCta />
    </ProtoShell>
  );
}
