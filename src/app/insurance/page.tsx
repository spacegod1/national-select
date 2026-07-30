import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { CLINIC, INSURERS, PRICES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Insurance & pricing — National Select Urgent Care",
  description:
    "Know what you'll pay before you're seen. We take most major plans, and self-pay prices are flat and posted.",
};

export default function InsurancePage() {
  return (
    <main>
      <PageHero
        eyebrow="Insurance & pricing"
        title="Know what you'll pay before you're seen."
        lede="We take most major plans, and if you don't have insurance our self-pay prices are flat and posted right here. No surprise bills weeks later."
      />

      {/* Plans */}
      <Container as="section" className="py-[clamp(40px,6vw,72px)]">
        <h2 data-reveal className="mb-2 font-display text-[clamp(24px,3vw,32px)] font-bold tracking-[-.022em]">
          Plans we accept
        </h2>
        <p data-reveal className="mb-[26px] text-[16.5px] text-muted">
          Bring your card and a photo ID. If your plan isn&apos;t listed, call us — we&apos;ll check
          it for you in a minute.
        </p>
        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {INSURERS.map((ins) => (
            <div
              key={ins}
              className="flex items-center gap-3 rounded-[14px] border border-line bg-white px-[22px] py-5"
            >
              <PlusMark check="#fff" className="h-[18px] w-[18px] flex-none" />
              <span className="font-display text-[16px] font-semibold tracking-[-.01em]">{ins}</span>
            </div>
          ))}
        </div>
      </Container>

      {/* Self-pay prices */}
      <Container as="section" className="pb-[clamp(40px,6vw,72px)]">
        <div data-reveal className="overflow-hidden rounded-[22px] border border-line bg-white">
          <div className="border-b border-line px-[clamp(20px,3vw,34px)] py-7">
            <h2 className="mb-2 font-display text-[clamp(23px,2.8vw,30px)] font-bold tracking-[-.022em]">
              Self-pay prices
            </h2>
            <p className="text-[16.5px] text-muted">
              Flat rates, paid at the time of your visit. Tests and procedures are listed separately
              so nothing is hidden.
            </p>
          </div>
          {PRICES.map((pr) => (
            <div
              key={pr.name}
              className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 border-b border-line-soft px-[clamp(20px,3vw,34px)] py-5"
            >
              <div className="min-w-[220px] flex-1">
                <div className="text-[17px] font-semibold">{pr.name}</div>
                <div className="mt-0.5 text-[14.5px] text-muted">{pr.note}</div>
              </div>
              <div className="font-display text-[23px] font-extrabold tracking-[-.02em] text-ink">
                {pr.price}
              </div>
            </div>
          ))}
          <div className="bg-pink px-[clamp(20px,3vw,34px)] py-[22px] text-[15.5px] leading-[1.55] text-pink-ink">
            Financial hardship? Ask at the front desk. We keep a sliding scale for neighbors who need
            it, and nobody is turned away for a same-day emergency assessment.
          </div>
        </div>
      </Container>

      {/* Billing help cards */}
      <Container as="section" className="pb-[clamp(56px,8vw,100px)]">
        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          <div className="rounded-[20px] bg-panel-2 p-[26px]">
            <h3 className="mb-2.5 font-display text-[19px] font-bold tracking-[-.015em]">
              Already have a bill?
            </h3>
            <p className="mb-4 text-[15.5px] leading-[1.6] text-muted">
              Pay online in about a minute with your account number, or call our billing line Monday
              to Friday.
            </p>
            <Link href="/billing" className="text-[15.5px] font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline">
              Pay my bill →
            </Link>
          </div>
          <div className="rounded-[20px] bg-panel-2 p-[26px]">
            <h3 className="mb-2.5 font-display text-[19px] font-bold tracking-[-.015em]">
              Need an itemized receipt?
            </h3>
            <p className="mb-4 text-[15.5px] leading-[1.6] text-muted">
              We&apos;ll email one the same day — useful for HSA, FSA and out-of-network
              reimbursement.
            </p>
            <Link href="/contact" className="text-[15.5px] font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline">
              Request a receipt →
            </Link>
          </div>
          <div className="rounded-[20px] bg-panel-2 p-[26px]">
            <h3 className="mb-2.5 font-display text-[19px] font-bold tracking-[-.015em]">
              Questions about coverage?
            </h3>
            <p className="mb-4 text-[15.5px] leading-[1.6] text-muted">
              Call before you come in and we&apos;ll verify your benefits while you&apos;re on the
              phone.
            </p>
            <a href={CLINIC.phoneHref} className="text-[15.5px] font-semibold">
              Call {CLINIC.phone} →
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
