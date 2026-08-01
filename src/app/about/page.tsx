import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { CheckInButton } from "@/components/booking-modal";
import { STATS, VALUES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About — National Select Urgent Care",
  description:
    "An independent clinic rooted in Silver Spring. We opened National Select Urgent Care because getting seen shouldn't mean a five-hour wait or a bill you can't read.",
};

const STORY = [
  "We're an independent clinic on Birchwood Avenue, run by clinicians who live within a few miles of the front door. Before this, most of us worked in hospital emergency departments.",
  "We loved the medicine and we loved our patients — but we watched too many people sit for hours with an earache, a twisted ankle, or a fever that scared them, and then leave with a bill that felt like a punishment.",
  "So we built the alternative we wanted for our own families: a bright, calm room where you can walk in on a Sunday afternoon, see a real clinician within the hour, get your X-ray or strep test on site, and know what it costs before you agree to it.",
  "We treat kids and grandparents. We handle the sprain today and the blood pressure check next month, because we do primary care too."
];

export default function AboutPage() {
  return (
    <main className="bg-[#f8f9fa] overflow-hidden">
      {/* Hero Section */}
      <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(20px,3.5vw,48px)] pb-[clamp(40px,8vw,100px)] grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div data-reveal className="max-w-[500px]">
          <h1 className="font-display text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-.03em] text-[#0d1b2a] mb-6">
            A clinic that belongs to this community.
          </h1>
          <p className="text-[18px] leading-[1.6] text-slate-600 mb-8 max-w-[400px]">
            We opened National Select Urgent Care because getting seen shouldn't mean a five-hour wait or a bill you can't read.
          </p>
          <CheckInButton className="rounded-[12px] bg-[#c1121f] hover:bg-[#a00f1a] px-8 py-3.5 text-[16px] font-bold text-white transition-colors flex items-center gap-2">
            Check in online
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </CheckInButton>
        </div>
        
        <div data-reveal className="relative mt-8 lg:mt-0">
          <div className="rounded-[24px] overflow-hidden relative aspect-[4/3] shadow-2xl">
            <Image 
              src="/clinic_front_desk.png" 
              alt="Clinic front desk"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {/* Overlay Box */}
          <div className="absolute -bottom-8 -left-4 lg:-left-8 bg-[#0d1b2a] rounded-[16px] p-8 max-w-[280px] shadow-xl z-10">
             <div className="text-[#e8342b] font-mono text-xs font-bold tracking-widest uppercase mb-3">Local Care</div>
             <p className="text-white font-display text-[22px] font-medium leading-[1.3] italic">
               "Run by clinicians who live within a few miles of the front door."
             </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pb-[clamp(60px,8vw,120px)] pt-16">
        <div data-reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((st) => (
            <div key={st.label} className="rounded-[20px] bg-white p-8 shadow-sm">
              <div className="mb-4">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div className="mb-2 font-display text-[32px] font-extrabold leading-none text-[#0d1b2a]">
                {st.value}
              </div>
              <div className="text-[14px] leading-[1.5] text-slate-500">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-[clamp(60px,10vw,120px)]">
        <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)]">
          <div data-reveal className="text-center mb-16">
            <div className="text-[#e8342b] font-mono text-sm font-bold tracking-widest uppercase mb-4">Our Story</div>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-bold tracking-[-.02em] text-[#0d1b2a]">
              Why we started National Select.
            </h2>
            <p className="mt-4 text-[18px] text-slate-600 max-w-[600px] mx-auto text-balance">
               {STORY[0]}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div data-reveal className="flex flex-col gap-6">
              <p className="text-[17px] leading-[1.7] text-slate-600">
                {STORY[1]}
              </p>
              <p className="text-[17px] leading-[1.7] text-slate-600">
                {STORY[2]}
              </p>
              <p className="text-[17px] leading-[1.7] text-slate-600">
                {STORY[3]}
              </p>
              
              <div className="mt-6 border-l-4 border-[#e8342b] pl-6 py-2">
                <p className="text-[16px] leading-[1.6] text-slate-500 italic">
                  "Being independent matters to us. No hospital system sets our prices or our schedules. When something isn't working for patients, we can change it that week."
                </p>
              </div>
            </div>

            <div data-reveal className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-4">
                  <div className="relative rounded-[20px] overflow-hidden aspect-[4/5]">
                     <Image src="/clinician_consultation.png" alt="Clinician consultation" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                  </div>
                  <div className="rounded-[20px] bg-[#c1121f] p-8 aspect-square flex flex-col justify-center items-center text-center text-white">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                     <div className="font-display text-[22px] font-bold leading-tight">Care without<br/>borders.</div>
                  </div>
               </div>
               <div className="flex flex-col gap-4 pt-12">
                  <div className="relative rounded-[20px] overflow-hidden aspect-[4/5]">
                     <Image src="/stethoscope_desk.png" alt="Stethoscope on desk" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                  </div>
                  <div className="rounded-[20px] bg-[#0d1b2a] p-8 aspect-square flex flex-col justify-center items-center text-center text-white">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                     <div className="font-display text-[22px] font-bold leading-tight">Built for Silver<br/>Spring.</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#0b1324] text-white py-[clamp(80px,10vw,120px)] relative overflow-hidden">
        {/* Subtle gradient glow in background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <Container className="relative z-10">
          <div data-reveal className="mb-12 max-w-[34em]">
            <div className="text-[#e8342b] font-mono text-sm font-bold tracking-widest uppercase mb-4">Care with heart</div>
            <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.1] tracking-[-.02em] text-balance">
              What we promise every patient
            </h2>
          </div>
          <div data-reveal className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-[24px] border border-white/10 bg-[#152033] p-8 hover:bg-[#1a263c] transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-[#e8342b] flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3 className="mb-3 font-display text-[22px] font-bold tracking-[-.01em]">
                  {v.title}
                </h3>
                <p className="text-[16px] leading-[1.6] text-slate-300">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-[clamp(80px,10vw,120px)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-100 rounded-tl-full blur-2xl translate-x-1/4 translate-y-1/4"></div>
        
        <Container className="relative z-10 text-center max-w-[800px]">
          <h2
            data-reveal
            className="mb-8 font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-.02em] text-[#0d1b2a] text-balance mx-auto max-w-[600px]"
          >
            Come meet the people who'll take care of you.
          </h2>
          <div data-reveal>
             <Link
               href="/providers"
               className="inline-flex items-center gap-3 rounded-[12px] bg-[#0d1b2a] hover:bg-[#152a42] px-8 py-4 text-[17px] font-bold text-white transition-colors"
             >
               Meet our team
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
             </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
