import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { CheckInButton } from "@/components/booking-modal";
import { InsuranceMarquee } from "@/components/insurance-marquee";
import { CLINIC, PRICES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Insurance & pricing — National Select Urgent Care",
  description:
    "Know what you'll pay before you're seen. We take most major plans, and self-pay prices are flat and posted.",
};

function PriceAmount({ price }: { price: string }) {
  const from = price.startsWith("from ");
  const value = price.replace(/^from /, "");
  return (
    <span className="font-display text-[24px] font-extrabold text-brand tabular-nums">
      {from ? <span className="mr-1.5 text-[14px] font-medium text-muted">from</span> : null}
      {value}
    </span>
  );
}

const BILLING_HELP = [
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

export default function InsurancePage() {
  return (
    <main className="bg-mist text-ink">
      {/* Hero */}
      <section className="relative min-h-[58vh] overflow-hidden">
        <Image
          src="/clinician_consultation.png"
          alt="Clinician consulting with a patient"
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/70 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
        <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-[1240px] flex-col justify-end px-[clamp(16px,4vw,40px)] pb-12 pt-20">
          <h1 className="home-hero-fade-up max-w-[14em] font-display text-[clamp(40px,6vw,64px)] font-extrabold leading-[1.02] tracking-[-.034em] text-white">
            Clear prices. Real coverage.
          </h1>
          <p className="home-hero-fade-up home-hero-delay-1 mt-4 max-w-[30em] text-[17px] leading-[1.55] text-white/80">
            We take most major plans, and self-pay rates are flat and posted — no hospital-style surprise bills.
          </p>
        </div>
      </section>

      {/* Plans marquee */}
      <section className="border-b border-line bg-white px-[clamp(16px,4vw,40px)] py-10">
        <div className="mx-auto max-w-[1240px]">
          <div data-reveal className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <Eyebrow>Plans we accept</Eyebrow>
            <a
              href={CLINIC.phoneHref}
              className="text-[14px] font-semibold text-brand no-underline hover:text-brand-dark hover:no-underline"
            >
              Call {CLINIC.phone} to verify
            </a>
          </div>
          <InsuranceMarquee />
        </div>
      </section>

      {/* Self-pay */}
      <section className="px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)]">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div data-reveal>
            <Eyebrow>Self-pay</Eyebrow>
            <h2 className="mb-4 font-display text-[clamp(30px,4vw,44px)] font-extrabold tracking-[-.028em] text-balance">
              Flat rates, paid when you&apos;re seen.
            </h2>
            <p className="mb-6 max-w-[32em] text-[16.5px] leading-[1.55] text-muted text-pretty">
              Tests and procedures are listed separately so nothing is hidden. Sliding scale available if you ask.
            </p>
            <div className="relative aspect-[4/5] max-w-md overflow-hidden rounded-[24px]">
              <Image
                src="/stethoscope_desk.png"
                alt="Clinic exam tools on a desk"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
          <div data-reveal className="rounded-[22px] border border-line bg-white px-6 py-2 sm:px-8">
            {PRICES.map((pr) => (
              <div
                key={pr.name}
                className="flex flex-col justify-between gap-2 border-b border-line py-5 last:border-0 sm:flex-row sm:items-baseline"
              >
                <div>
                  <div className="text-[16.5px] font-semibold text-ink">{pr.name}</div>
                  <div className="mt-0.5 text-[14px] text-muted">{pr.note}</div>
                </div>
                <PriceAmount price={pr.price} />
              </div>
            ))}
            <div className="border-t border-line py-5 text-[15px] leading-[1.55] text-muted">
              <strong className="text-ink">Financial hardship?</strong> Ask at the front desk. We keep a sliding
              scale, and nobody is turned away for a same-day emergency assessment.
            </div>
          </div>
        </div>
      </section>

      {/* Billing help */}
      <section className="border-t border-line bg-panel px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)]">
        <div className="mx-auto max-w-[1240px]">
          <div data-reveal>
            <Eyebrow>Billing help</Eyebrow>
            <h2 className="mb-8 font-display text-[clamp(26px,3.4vw,36px)] font-extrabold tracking-[-.025em] text-balance">
              Need help after the visit?
            </h2>
          </div>
          <div data-reveal className="grid gap-8 md:grid-cols-3">
            {BILLING_HELP.map((item) => (
              <div key={item.title} className="border-t border-line pt-5">
                <h3 className="mb-2 font-display text-[19px] font-bold tracking-[-.015em]">{item.title}</h3>
                <p className="mb-4 text-[15px] leading-[1.55] text-muted">{item.body}</p>
                {"external" in item && item.external ? (
                  <a
                    href={item.href}
                    className="text-[15px] font-semibold text-brand no-underline hover:text-brand-dark hover:no-underline"
                  >
                    {item.cta} →
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[15px] font-semibold text-brand no-underline hover:text-brand-dark hover:no-underline"
                  >
                    {item.cta} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready CTA */}
      <section className="bg-ink px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)] text-cloud">
        <div
          data-reveal
          className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 md:flex-row md:items-center"
        >
          <div className="max-w-[32em]">
            <h2 className="mb-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold tracking-[-.028em]">
              Ready to be seen? No appointment needed.
            </h2>
            <p className="text-[16.5px] leading-[1.55] text-cloud-soft">
              Most patients are seen, treated, and home within an hour. Walk in, or check in online and hold your
              place.
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
    </main>
  );
}
