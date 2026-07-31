import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";
import { HoursTable, StatusInline } from "@/components/live-widgets";
import { CLINIC } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact & location — National Select Urgent Care",
  description:
    "We're on Birchwood Avenue in Silver Spring, MD, with parking out front. Hours, directions and a contact form.",
};

export default function ContactPage() {
  return (
    <main className="bg-[#f8f9fa] min-h-screen">
      {/* Hero */}
      <section className="bg-white pt-[clamp(60px,8vw,100px)] pb-[clamp(40px,6vw,80px)] border-b border-slate-100 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] relative z-10">
          <div className="max-w-[800px]">
            <div className="inline-block rounded-full bg-red-100/60 px-4 py-1.5 mb-6">
              <span className="text-[#e8342b] font-mono text-[13px] font-bold tracking-widest uppercase">
                Contact & location
              </span>
            </div>
            <h1 className="mb-6 font-display text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-.03em] text-[#0d1b2a] text-balance">
              We're on Birchwood Avenue, <br className="hidden md:block"/>
              with parking out front.
            </h1>
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href={CLINIC.mapsHref}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#e8342b] px-8 py-3.5 text-[16px] font-bold text-white transition-colors hover:bg-[#c1121f]"
              >
                Get directions
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
              <a
                href={CLINIC.phoneHref}
                className="inline-flex items-center gap-2 rounded-[12px] border-2 border-[#0d1b2a] bg-transparent px-8 py-3.5 text-[16px] font-bold text-[#0d1b2a] transition-colors hover:bg-[#0d1b2a] hover:text-white"
              >
                Call {CLINIC.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] grid-cols-1 lg:grid-cols-[1fr_1.2fr] items-start gap-[clamp(24px,4vw,64px)] px-[clamp(16px,4vw,40px)] py-[clamp(60px,8vw,100px)]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Map placeholder */}
          <div className="relative h-[340px] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="absolute -left-[8%] top-[38%] h-[28px] w-[116%] bg-white shadow-sm [transform:rotate(-7deg)]" />
            <div className="absolute left-[26%] -top-[10%] h-[120%] w-[24px] bg-white shadow-sm [transform:rotate(9deg)]" />
            <div className="absolute left-1/2 top-[44%] flex -translate-x-1/2 -translate-y-full flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#e8342b] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="whitespace-nowrap rounded-[8px] bg-[#0d1b2a] px-3 py-1.5 font-mono text-[13px] font-bold text-white shadow-md">
                1420 Birchwood Ave
              </span>
            </div>
            <div className="absolute bottom-4 left-4 rounded-[12px] border border-slate-200 bg-white/90 backdrop-blur px-4 py-2 font-mono text-[13px] font-medium text-slate-500 shadow-sm">
              Map placeholder — embed Google Maps here
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Hours */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h2 className="font-display text-[22px] font-bold text-[#0d1b2a]">Hours</h2>
              </div>
              <HoursTable />
              <div className="mt-6 pt-6 border-t border-slate-100">
                <StatusInline />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-6 rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-none mt-1">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[12px] font-bold uppercase tracking-[.09em] text-[#e8342b]">
                    Address
                  </div>
                  <div className="text-[16px] leading-[1.6] text-[#0d1b2a] font-medium">
                    {CLINIC.addressLine1}
                    <br />
                    {CLINIC.addressLine2}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-none mt-1">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[12px] font-bold uppercase tracking-[.09em] text-[#e8342b]">
                    Phone &amp; fax
                  </div>
                  <div className="text-[16px] leading-[1.6] text-[#0d1b2a] font-medium">
                    <a href={CLINIC.phoneHref} className="hover:text-[#e8342b] transition-colors">{CLINIC.phone}</a>
                    <br />
                    <span className="text-slate-500 font-normal">Fax {CLINIC.fax}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-none mt-1">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[12px] font-bold uppercase tracking-[.09em] text-[#e8342b]">
                    Parking &amp; transit
                  </div>
                  <div className="text-[15px] leading-[1.6] text-slate-500 text-pretty">
                    Free lot in front of the building, two accessible spaces by the door. Six minutes' walk from the Silver Spring Metro.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: form */}
        <div className="sticky top-[120px] rounded-[32px] border-4 border-white bg-[#0d1b2a] p-[clamp(24px,4vw,40px)] shadow-2xl text-white">
          <div className="mb-8">
            <h2 className="font-display text-[28px] font-bold tracking-[-.02em] mb-2">Send us a message</h2>
            <p className="text-slate-300 text-[15px]">We typically respond within 1 hour during business hours.</p>
          </div>
          <div className="bg-white rounded-[20px] p-6 text-[#0d1b2a]">
             <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
