import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { CheckInButton } from "@/components/booking-modal";
import { CLINIC, SERVICES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services — National Select Urgent Care",
  description:
    "Everyday care, urgent problems, and the tests that go with them — usually same day, usually for a fraction of an ER bill.",
};

const GRID_SERVICES = SERVICES.filter((s) => s.id !== "xray");
const XRAY = SERVICES.find((s) => s.id === "xray")!;

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  illnesses: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  ),
  injuries: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4.5 19.5 10a2.12 2.12 0 0 1 0 3L13 19.5a2.12 2.12 0 0 1-3 0L4.5 14a2.12 2.12 0 0 1 0-3L10 5.5a2.12 2.12 0 0 1 3 0Z" />
      <path d="m9 11 4 4" />
      <path d="m11 9 4 4" />
    </svg>
  ),
  physicals: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
  labs: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v11l3.4 6.2A1 1 0 0 1 17.5 22h-11a1 1 0 0 1-.9-1.8L9 14V3z" />
      <path d="M6.4 19.1h11.2" />
    </svg>
  ),
  vaccines: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
      <path d="m9 11 4 4" />
      <path d="m5 19-3 3" />
      <path d="m14 4 6 6" />
    </svg>
  ),
  womens: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M12 14v7" />
      <path d="M9 19h6" />
    </svg>
  ),
};

const DIAGNOSTIC_CARDS = [
  {
    tag: "Lungs & chest",
    title: "Digital X-ray",
    body: "Bones, chest, and soft tissue — images reviewed during your visit.",
  },
  {
    tag: "Heart health",
    title: "EKG",
    body: "On-site electrocardiogram read by the clinician who already saw you.",
  },
  {
    tag: "Oxygen & vitals",
    title: "Pulse oximetry",
    body: "Quick oxygen and heart-rate checks for breathing and illness visits.",
  },
  {
    tag: "Screening",
    title: "Glucose & vision",
    body: "Rapid blood glucose, vision screening, and spirometry when needed.",
  },
];

export default function ServicesPage() {
  return (
    <main className="bg-mist min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(252,238,237,.85),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(228,235,244,.7),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-[clamp(16px,4vw,40px)] py-[clamp(40px,7vw,88px)] lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div data-reveal className="max-w-[540px]">
            <div className="mb-6 inline-flex rounded-full bg-pink px-4 py-1.5">
              <span className="font-mono text-[12.5px] font-bold uppercase tracking-[.1em] text-[#b4231c]">
                Comprehensive medical care
              </span>
            </div>
            <h1 className="mb-6 font-display text-[clamp(36px,4.8vw,58px)] font-extrabold leading-[1.05] tracking-[-.03em] text-ink text-balance">
              Everyday care, urgent problems, and the tests that go with them.
            </h1>
            <p className="max-w-[34em] text-[18px] leading-[1.6] text-muted text-pretty">
              If it isn&apos;t life-threatening, there&apos;s a good chance we can handle it here —
              usually same day, and usually for a fraction of an emergency room bill.
            </p>
          </div>

          <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(27,42,74,.18)]">
            <Image
              src="/xray_room.png"
              alt="Digital X-ray suite at National Select Urgent Care"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="pb-[clamp(56px,8vw,96px)] pt-[clamp(48px,6vw,72px)]">
        <Container className="max-w-[1240px]">
          <div data-reveal className="mb-12 text-center">
            <h2 className="mb-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold tracking-[-.025em] text-ink">
              Our services
            </h2>
            <p className="mx-auto max-w-[36em] text-[17px] leading-[1.55] text-muted text-pretty">
              Walk in for the things that can&apos;t wait — and leave with a plan, not a referral runaround.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {GRID_SERVICES.map((s) => (
              <article
                key={s.id}
                data-reveal
                className="flex flex-col rounded-[20px] border border-line bg-white p-7 transition-shadow hover:shadow-[0_14px_36px_rgba(27,42,74,.08)]"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-pink">
                  {SERVICE_ICONS[s.id]}
                </div>
                <h3 className="mb-2 font-display text-[22px] font-bold tracking-[-.02em] text-ink">
                  {s.name}
                </h3>
                <p className="mb-5 text-[15px] leading-[1.55] text-muted">{s.blurb}</p>
                <ul className="mb-6 flex flex-col gap-2.5">
                  {s.items.slice(0, 4).map((it) => (
                    <li key={it} className="flex gap-2.5 text-[14.5px] leading-[1.45] text-ink-soft">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${s.id}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-brand no-underline transition-colors hover:text-brand-dark hover:no-underline"
                >
                  About {s.name}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Diagnostic & X-ray */}
      <section className="pb-[clamp(56px,8vw,96px)]">
        <Container className="max-w-[1240px]">
          <div
            data-reveal
            className="grid grid-cols-1 items-center gap-10 rounded-[28px] bg-ink px-[clamp(28px,5vw,56px)] py-[clamp(36px,5vw,64px)] text-cloud lg:grid-cols-[1fr_1.15fr] lg:gap-14"
          >
            <div>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] bg-cloud/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff8078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <path d="M7 12h10" />
                  <path d="M10 9v6" />
                  <path d="M14 9v6" />
                </svg>
              </div>
              <h2 className="mb-4 font-display text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-.025em]">
                {XRAY.name}
              </h2>
              <p className="mb-8 max-w-[28em] text-[16.5px] leading-[1.6] text-cloud/70 text-pretty">
                {XRAY.intro}
              </p>
              <Link
                href={`/services/${XRAY.id}`}
                className="inline-flex items-center gap-2 rounded-[12px] bg-brand px-7 py-3.5 text-[15.5px] font-semibold !text-white no-underline shadow-[0_10px_26px_rgba(232,52,43,.28)] transition-all hover:-translate-y-0.5 hover:bg-brand-press hover:no-underline"
              >
                Full diagnostic details
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DIAGNOSTIC_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[16px] border border-cloud/15 bg-cloud/[.06] px-5 py-5"
                >
                  <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[.1em] text-coral">
                    {card.tag}
                  </div>
                  <div className="mb-1.5 font-display text-[18px] font-bold tracking-[-.015em]">
                    {card.title}
                  </div>
                  <p className="text-[14px] leading-[1.5] text-cloud/65">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Not sure CTA */}
      <section className="relative pb-[clamp(72px,10vw,120px)] pt-4">
        <div className="pointer-events-none absolute left-1/2 top-8 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-panel/80 blur-3xl" />
        <Container className="relative max-w-[720px] text-center">
          <div data-reveal>
            <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8342b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <path d="M12 7v3" />
                <path d="M12 13h.01" />
              </svg>
            </div>
            <h2 className="mb-4 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold tracking-[-.025em] text-ink">
              Not sure if we can help?
            </h2>
            <p className="mx-auto mb-9 max-w-[34em] text-[17px] leading-[1.6] text-muted text-pretty">
              Call us and describe what&apos;s going on. If you need an emergency room instead, we&apos;ll
              tell you straight away — and help you get there.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={CLINIC.phoneHref}
                className="inline-flex items-center gap-2.5 rounded-[12px] border-[1.5px] border-ink bg-white px-7 py-3.5 text-[16px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call {CLINIC.phone}
              </a>
              <CheckInButton className="inline-flex items-center gap-2.5 rounded-[12px] bg-brand px-7 py-3.5 text-[16px] font-semibold text-white shadow-[0_10px_26px_rgba(232,52,43,.26)] transition-all hover:-translate-y-0.5 hover:bg-brand-press" />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
