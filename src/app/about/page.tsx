import Link from "next/link";
import type { Metadata } from "next";
import { Container, Eyebrow, PageHero } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { STATS, VALUES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About — National Select Urgent Care",
  description:
    "An independent clinic that belongs to its neighborhood. We opened National Select Urgent Care because getting seen shouldn't mean a five-hour wait or a bill you can't read.",
};

const STORY = [
  "We're an independent clinic on Birchwood Avenue, run by clinicians who live within a few miles of the front door. Before this, most of us worked in hospital emergency departments. We loved the medicine and we loved our patients — but we watched too many people sit for hours with an earache, a twisted ankle, or a fever that scared them, and then leave with a bill that felt like a punishment.",
  "So we built the alternative we wanted for our own families: a bright, calm room where you can walk in on a Sunday afternoon, see a real clinician within the hour, get your X-ray or strep test on site, and know what it costs before you agree to it. We treat kids and grandparents. We handle the sprain today and the blood pressure check next month, because we do primary care too.",
  "Being independent matters to us. No hospital system sets our prices or our schedules. When something isn't working for patients, we can change it that week.",
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About us"
        title="A clinic that belongs to its neighborhood."
        lede="We opened National Select Urgent Care because getting seen shouldn't mean a five-hour wait or a bill you can't read."
      />

      <section className="mx-auto flex max-w-[1000px] flex-col gap-[26px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,72px)]">
        <h2 data-reveal className="font-display text-[clamp(24px,3vw,32px)] font-bold tracking-[-.022em]">
          Our story
        </h2>
        {STORY.map((p, i) => (
          <p key={i} data-reveal className="text-[18px] leading-[1.68] text-ink-soft text-pretty">
            {p}
          </p>
        ))}
        <div
          data-reveal
          className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5"
        >
          {STATS.map((st) => (
            <div key={st.label} className="rounded-[18px] border border-line bg-white px-[22px] py-6">
              <div className="mb-2 font-display text-[34px] font-extrabold leading-none tracking-[-.03em] text-[#e8342b]">
                {st.value}
              </div>
              <div className="text-[14.5px] leading-[1.45] text-muted">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-cloud">
        <Container className="py-[clamp(52px,7vw,96px)]">
          <div data-reveal className="mb-[38px] max-w-[34em]">
            <Eyebrow tone="coral">Care with heart</Eyebrow>
            <h2 className="font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.06] tracking-[-.028em] text-balance">
              What we promise every patient
            </h2>
          </div>
          <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-[20px] border border-cloud/15 bg-cloud/[.07] px-6 py-[26px]"
              >
                <PlusMark cross="#E8342B" check="#1B2A4A" className="mb-3.5 h-6 w-6" />
                <h3 className="mb-2.5 font-display text-[20px] font-bold tracking-[-.018em]">
                  {v.title}
                </h3>
                <p className="text-[15.5px] leading-[1.6] opacity-75">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container as="section" className="py-[clamp(48px,7vw,88px)] text-center">
        <h2
          data-reveal
          className="mb-4 font-display text-[clamp(28px,3.6vw,42px)] font-extrabold tracking-[-.028em] text-balance"
        >
          Come meet the people who&apos;ll take care of you.
        </h2>
        <Link
          href="/providers"
          className="inline-block rounded-[13px] bg-[#e8342b] px-[30px] py-4 text-[17px] font-semibold !text-white no-underline transition-colors hover:bg-[#ce291f] hover:no-underline"
        >
          Meet our team
        </Link>
      </Container>
    </main>
  );
}
