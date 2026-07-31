import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { CLINIC, INSURERS, PRICES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Insurance & pricing — National Select Urgent Care",
  description:
    "Know what you'll pay before you're seen. We take most major plans, and self-pay prices are flat and posted.",
};

export default function InsurancePage() {
  return (
    <main className="bg-[#f8f9fa] min-h-screen">
      {/* Hero Section */}
      <section className="bg-white pt-[clamp(60px,8vw,100px)] pb-[clamp(40px,6vw,80px)]">
        <Container className="max-w-[1240px]">
          <div className="max-w-[700px]">
            <div className="inline-block rounded-full bg-red-100/60 px-4 py-1.5 mb-6">
              <span className="text-[#e8342b] font-mono text-[13px] font-bold tracking-widest uppercase">
                Pricing that's clear
              </span>
            </div>
            <h1 className="font-display text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-.03em] text-[#0d1b2a] mb-6">
              Know what you'll pay <br/>
              <span className="text-[#e8342b]">before you're seen.</span>
            </h1>
            <p className="text-[18px] leading-[1.6] text-slate-600 mb-8 max-w-[500px]">
              We take most major plans, and if you don't have insurance our self-pay prices are flat and posted right here. No surprises like a hospital later.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-[12px] bg-[#0d1b2a] hover:bg-[#152a42] px-6 py-3.5 text-[16px] font-bold text-white transition-colors flex items-center gap-2">
                View self-pay prices
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </button>
              <button className="rounded-[12px] border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 text-[16px] font-bold text-[#0d1b2a] transition-colors">
                Accepted insurance
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Plans Section */}
      <section className="bg-white py-[clamp(40px,6vw,80px)] border-b border-slate-100">
        <Container className="max-w-[1240px]">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="mb-2 font-display text-[clamp(28px,3vw,36px)] font-bold tracking-[-.02em] text-[#0d1b2a]">
                Plans we accept
              </h2>
              <p className="text-[16px] text-slate-500 max-w-[600px]">
                Bring your card and a photo ID. If your plan isn't listed, call us — we'll check it for you in a minute.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#e8342b] font-medium text-[15px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href={CLINIC.phoneHref} className="hover:underline">Call for coverage</a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {INSURERS.map((ins) => (
              <div
                key={ins}
                className="flex items-center justify-center rounded-[12px] border border-slate-200 bg-white px-4 py-6 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <span className="font-display text-[14px] font-bold text-[#0d1b2a] text-center">{ins}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Self-pay prices */}
      <section className="py-[clamp(60px,8vw,120px)] relative overflow-hidden">
        <Container className="max-w-[1000px] relative z-10">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-display text-[clamp(32px,4vw,42px)] font-bold tracking-[-.02em] text-[#0d1b2a]">
              Flat Self-Pay Rates
            </h2>
            <p className="text-[17px] text-slate-500 max-w-[500px] mx-auto text-balance">
              Flat rates, paid at the time of your visit. Tests and procedures are listed separately so nothing is hidden.
            </p>
          </div>

          <div className="rounded-[24px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-white border border-slate-100">
            {/* Table Header */}
            <div className="bg-[#0d1b2a] px-8 py-4 flex justify-between items-center text-white text-[12px] font-bold tracking-widest uppercase">
              <span>Service / Description</span>
              <span>Price</span>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {PRICES.map((pr) => (
                <div key={pr.name} className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-[18px] font-bold text-[#0d1b2a] mb-1">{pr.name}</div>
                    <div className="text-[15px] text-slate-500">{pr.note}</div>
                  </div>
                  <div className="font-display text-[24px] font-extrabold text-[#e8342b]">
                    {pr.price.includes('from') ? (
                      <span className="text-[16px] text-slate-500 font-normal mr-2">from</span>
                    ) : null}
                    {pr.price.replace('from ', '')}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Hardship Banner */}
            <div className="bg-[#152a42] px-8 py-6 flex items-start gap-4">
              <div className="mt-1 flex-none rounded-full bg-red-500/20 p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white mb-1">Financial hardship?</h3>
                <p className="text-[15px] text-slate-300 leading-[1.6]">
                  Ask at the front desk. We keep a sliding scale for neighbors who need it, and nobody is turned away for a same-day emergency assessment.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Billing help cards */}
      <section className="pb-[clamp(80px,10vw,140px)]">
        <Container className="max-w-[1240px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[24px] bg-white border border-slate-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <h3 className="mb-3 font-display text-[20px] font-bold text-[#0d1b2a]">
                Already have a bill?
              </h3>
              <p className="mb-6 text-[15px] leading-[1.6] text-slate-500">
                Pay online in about a minute with your account number, or call our billing line Monday to Friday.
              </p>
              <Link href="/billing" className="inline-flex items-center gap-2 text-[15px] font-bold text-[#e8342b] hover:text-[#c1121f] transition-colors">
                Pay no bill
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3 className="mb-3 font-display text-[20px] font-bold text-[#0d1b2a]">
                Need an itemized receipt?
              </h3>
              <p className="mb-6 text-[15px] leading-[1.6] text-slate-500">
                We'll email one the same day — useful for HSA, FSA and out-of-network reimbursement.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-[15px] font-bold text-[#e8342b] hover:text-[#c1121f] transition-colors">
                Request a receipt
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h3 className="mb-3 font-display text-[20px] font-bold text-[#0d1b2a]">
                Questions about coverage?
              </h3>
              <p className="mb-6 text-[15px] leading-[1.6] text-slate-500">
                Call before you come in and we'll verify your benefits while you're on the phone.
              </p>
              <a href={CLINIC.phoneHref} className="inline-flex items-center gap-2 text-[15px] font-bold text-[#e8342b] hover:text-[#c1121f] transition-colors">
                Call {CLINIC.phone}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Ready CTA Section */}
      <section className="bg-gradient-to-r from-[#0d1b2a] via-[#1a0a0c] to-[#990d14] py-[clamp(60px,8vw,100px)]">
        <Container className="max-w-[1240px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-[500px]">
              <h2 className="mb-4 font-display text-[clamp(32px,4vw,42px)] font-bold tracking-[-.02em] text-white">
                Ready to be seen? No appointment needed.
              </h2>
              <p className="text-[17px] text-slate-300 leading-[1.6]">
                Our clinical team is ready to provide top-tier care with no hidden costs. Most patients are seen and home within an hour.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="rounded-[12px] bg-[#e8342b] hover:bg-[#c1121f] px-8 py-3.5 text-[16px] font-bold text-white transition-colors">
                Check in now
              </button>
              <button className="rounded-[12px] border border-white/20 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-[16px] font-bold text-white transition-colors">
                Find directions
              </button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
