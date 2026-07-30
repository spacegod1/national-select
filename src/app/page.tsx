import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { CheckInButton } from "@/components/booking-modal";
import { HeroStatusStrip, TodayCard, HoursTable } from "@/components/live-widgets";
import { CLINIC, INSURERS, REASONS, SERVICES, TESTIMONIALS } from "@/lib/site-data";

const btnPrimary =
  "inline-block rounded-[13px] bg-[#e8342b] px-7 py-4 text-[17px] font-semibold shadow-[0_10px_26px_rgba(232,52,43,.26)] transition-all hover:-translate-y-0.5 hover:bg-[#ce291f] !text-white no-underline hover:no-underline";
const btnOutline =
  "inline-block rounded-[13px] border-[1.5px] border-ink px-[26px] py-4 text-[17px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline";

const QUICK_CARDS = [
  { title: "Find us", body: "1420 Birchwood Ave, Silver Spring. Free parking at the door.", cta: "Get directions", href: "/contact" },
  { title: "Services", body: "Illnesses, injuries, physicals, labs, X-ray and vaccines.", cta: "See what we treat", href: "/services" },
  { title: "Patient resources", body: "Portal sign-in, forms, records requests and answers.", cta: "Open resources", href: "/resources" },
  { title: "Pay a bill", body: "Pay online in a minute, or set up a payment plan.", cta: "Pay my bill", href: "/billing" },
];

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-center gap-[clamp(32px,5vw,64px)] px-[clamp(16px,4vw,40px)] pb-[clamp(28px,4vw,44px)] pt-[clamp(36px,6vw,76px)]">
        <div>
          <div className="mb-[22px] inline-flex items-center gap-[9px] rounded-full border border-pink-line bg-pink py-[7px] pl-2.5 pr-3.5 text-[13.5px] font-semibold text-[#b4231c]">
            <PlusMark cross="#E8342B" check="#FCEEED" className="h-[15px] w-[15px]" />
            Your neighborhood walk-in clinic
          </div>
          <h1 className="mb-5 font-display text-[clamp(40px,6.2vw,68px)] font-extrabold leading-[1.03] tracking-[-.03em] text-balance">
            Feel better sooner.
            <br />
            We&apos;ll take it from here.
          </h1>
          <p className="mb-7 max-w-[34em] text-[clamp(17px,1.7vw,20px)] leading-[1.55] text-muted text-pretty">
            Urgent care and primary care under one roof in Silver Spring. Walk in any time we&apos;re
            open, or check in online and hold your place from the couch.
          </p>
          <div className="mb-[26px] flex flex-wrap gap-3">
            <CheckInButton className={btnPrimary} />
            <Link href="/contact" className={btnOutline}>
              Find our hours &amp; location
            </Link>
          </div>
          <HeroStatusStrip />
        </div>
        <div className="relative min-h-[340px]">
          <TodayCard />
        </div>
      </section>

      {/* QUICK ACCESS */}
      <Container as="section">
        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5">
          {QUICK_CARDS.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white px-[22px] py-6 text-left no-underline transition-all hover:-translate-y-[3px] hover:border-[#B9C6D8] hover:no-underline hover:shadow-[0_14px_32px_rgba(27,42,74,.09)]"
            >
              <span className="grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-pink">
                <PlusMark className="h-[19px] w-[19px]" />
              </span>
              <span className="font-display text-[19px] font-bold tracking-[-.015em] text-ink">
                {c.title}
              </span>
              <span className="text-[14.5px] leading-[1.5] text-muted">{c.body}</span>
              <span className="mt-0.5 text-[14px] font-semibold text-[#e8342b]">{c.cta} →</span>
            </Link>
          ))}
        </div>
      </Container>

      {/* WHY CHOOSE US */}
      <Container as="section" className="py-[clamp(56px,8vw,104px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[clamp(30px,5vw,70px)]">
          <div data-reveal>
            <Eyebrow>Why neighbors choose us</Eyebrow>
            <h2 className="mb-[18px] font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.06] tracking-[-.028em] text-balance">
              Real care, without the runaround.
            </h2>
            <p className="mb-6 max-w-[34em] text-[17.5px] leading-[1.6] text-muted text-pretty">
              We&apos;re independent — not part of a hospital system. That means we answer to our
              patients, keep our prices honest, and take the time to actually listen.
            </p>
            <Link
              href="/about"
              className="inline-block rounded-[12px] border-[1.5px] border-ink px-6 py-3.5 text-[16px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline"
            >
              More about our clinic
            </Link>
          </div>
          <ul data-reveal className="flex flex-col gap-0.5">
            {REASONS.map((r) => (
              <li key={r.title} className="flex gap-4 border-b border-line py-5">
                <PlusMark check="#F2F5FA" className="mt-0.5 h-6 w-6 flex-none" />
                <div>
                  <div className="mb-1 text-[17.5px] font-semibold text-ink">{r.title}</div>
                  <div className="text-[15.5px] leading-[1.55] text-muted">{r.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {/* SERVICES PREVIEW */}
      <section className="bg-ink text-cloud">
        <Container className="py-[clamp(56px,8vw,100px)]">
          <div data-reveal className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow tone="coral">What we treat</Eyebrow>
              <h2 className="font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.06] tracking-[-.028em] text-balance">
                From sore throats to stitches.
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-block rounded-[12px] border-[1.5px] border-cloud/35 px-6 py-3.5 text-[16px] font-semibold !text-cloud no-underline transition-colors hover:!bg-[#e4ebf4] hover:!text-ink hover:no-underline"
            >
              See all services
            </Link>
          </div>
          <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3.5">
            {SERVICES.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                className="flex flex-col gap-2 rounded-[18px] border border-cloud/15 bg-cloud/[.07] p-[22px] !text-cloud no-underline transition-all hover:-translate-y-[3px] hover:bg-cloud/15 hover:no-underline"
              >
                <span className="font-display text-[19px] font-bold tracking-[-.015em]">{s.name}</span>
                <span className="text-[14.5px] leading-[1.5] opacity-70">{s.blurb}</span>
                <span className="mt-1 font-mono text-[12px] tracking-[.06em] opacity-55">
                  {s.items.length} conditions
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <Container as="section" className="py-[clamp(56px,8vw,100px)]">
        <div data-reveal className="mb-[38px] text-center">
          <Eyebrow>From our neighbors</Eyebrow>
          <h2 className="font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.06] tracking-[-.028em] text-balance">
            What people say after their visit
          </h2>
        </div>
        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-4">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col gap-4 rounded-[20px] border border-line bg-white px-[26px] py-7"
            >
              <div className="text-[15px] text-[#e8342b]" aria-label="Five out of five stars">
                ★★★★★
              </div>
              <blockquote className="text-[17.5px] leading-[1.55] text-ink text-pretty">
                {t.quote}
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-1.5">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-panel text-[14.5px] font-semibold text-ink">
                  {t.initials}
                </span>
                <span className="text-[14.5px] text-muted">
                  <strong className="font-semibold text-ink">{t.name}</strong>
                  <br />
                  {t.meta}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>

      {/* INSURANCE STRIP */}
      <section className="border-y border-line bg-panel">
        <Container className="py-[clamp(40px,6vw,64px)]">
          <div data-reveal className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-[clamp(21px,2.4vw,27px)] font-bold tracking-[-.02em]">
              We accept most major insurance
            </h2>
            <Link href="/insurance" className="text-[16px] font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline">
              See all plans &amp; self-pay prices →
            </Link>
          </div>
          <div data-reveal className="flex flex-wrap gap-2.5">
            {INSURERS.map((ins) => (
              <span
                key={ins}
                className="rounded-[11px] border border-line bg-white px-[18px] py-[11px] font-display text-[15px] font-semibold tracking-[-.01em] text-ink"
              >
                {ins}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* HOURS + WALK-IN */}
      <Container as="section" className="py-[clamp(56px,8vw,100px)]">
        <div
          data-reveal
          className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(24px,4vw,48px)] rounded-[24px] border border-line bg-white p-[clamp(26px,4vw,48px)]"
        >
          <div>
            <Eyebrow>Walk-ins welcome</Eyebrow>
            <h2 className="mb-4 font-display text-[clamp(28px,3.6vw,42px)] font-extrabold leading-[1.07] tracking-[-.028em] text-balance">
              Open seven days a week, including evenings.
            </h2>
            <p className="mb-6 text-[17px] leading-[1.6] text-muted text-pretty">
              Come in whenever you need us. Checking in online just means less time in the waiting
              room — you&apos;ll still be seen if you simply walk through the door.
            </p>
            <div className="flex flex-wrap gap-3">
              <CheckInButton className="rounded-[12px] bg-[#e8342b] px-[26px] py-[15px] text-[16px] font-semibold text-white transition-colors hover:bg-[#ce291f]" />
              <a
                href={CLINIC.phoneHref}
                className="rounded-[12px] border-[1.5px] border-ink px-6 py-[15px] text-[16px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline"
              >
                Call {CLINIC.phone}
              </a>
            </div>
          </div>
          <div className="rounded-[18px] border border-line bg-mist px-[22px] py-2">
            <HoursTable note />
          </div>
        </div>
      </Container>
    </main>
  );
}
