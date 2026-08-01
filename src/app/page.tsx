import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { CheckInButton } from "@/components/booking-modal";
import { HeroBackground } from "@/components/hero-background";
import { InsuranceMarquee } from "@/components/insurance-marquee";
import { HeroCinematicStatus, HoursTable } from "@/components/live-widgets";
import { CLINIC, REASONS, SERVICES, TESTIMONIALS } from "@/lib/site-data";

const btnPrimary =
  "home-hero-press inline-block rounded-[12px] bg-brand px-7 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-brand-press";
const btnGhost =
  "home-hero-press inline-block rounded-[12px] border border-white/40 bg-white/10 px-6 py-3.5 text-[16px] font-semibold !text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20 hover:no-underline";
const btnOutline =
  "home-hero-press inline-block rounded-xl border-[1.5px] border-ink px-6 py-3.5 text-[15px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline";

const QUICK_TILES = [
  {
    title: "Find us",
    cta: "Get directions",
    href: "/contact",
    img: "/stethoscope_desk.png",
  },
  {
    title: "Services",
    cta: "See what we treat",
    href: "/services",
    img: "/xray_room.png",
  },
  {
    title: "Patient resources",
    cta: "Open resources",
    href: "/resources",
    img: "/doctor-writing-notes.jpg",
  },
  {
    title: "Pay a bill",
    cta: "Pay my bill",
    href: "/billing",
    img: "/examining-xray-scan.jpg",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-[min(92dvh,880px)] overflow-hidden">
        <HeroBackground />
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-ink/90 via-ink/55 to-ink/20" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
        <div className="relative z-[3] mx-auto flex min-h-[min(92dvh,880px)] max-w-[1240px] flex-col justify-end px-[clamp(16px,4vw,40px)] pb-14 pt-16 sm:justify-center sm:pb-20">
          <h1 className="home-hero-fade-up max-w-[11em] font-display text-[clamp(42px,7vw,72px)] font-extrabold leading-[1.02] tracking-[-.035em] text-white">
            Feel better sooner.
          </h1>
          <p className="home-hero-fade-up home-hero-delay-1 mt-5 max-w-[30em] text-[clamp(16px,1.7vw,19px)] leading-[1.55] text-white/80">
            Walk-in urgent care and primary care in Silver Spring. Most patients are seen, treated,
            and home within an hour.
          </p>
          <div className="home-hero-fade-up home-hero-delay-2 mt-8 flex flex-wrap gap-3">
            <CheckInButton className={btnPrimary} />
            <Link href="/contact" className={btnGhost}>
              Hours &amp; location
            </Link>
          </div>
          <HeroCinematicStatus />
        </div>
      </section>

      {/* QUICK ACCESS — photo tiles */}
      <section className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3 px-[clamp(16px,4vw,40px)] py-10 md:grid-cols-4">
        {QUICK_TILES.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            data-reveal
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl no-underline hover:no-underline"
          >
            <Image
              src={c.img}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="font-display text-[17px] font-bold">{c.title}</div>
              <div className="mt-0.5 text-[13px] text-white/75">{c.cta} →</div>
            </div>
          </Link>
        ))}
      </section>

      {/* WHY CHOOSE US */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)] lg:grid-cols-2">
        <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
          <Image
            src="/clinician_consultation.png"
            alt="Clinician with patient"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div data-reveal>
          <Eyebrow>Why patients choose us</Eyebrow>
          <h2 className="mb-4 font-display text-[clamp(30px,4vw,46px)] font-extrabold tracking-[-.028em] text-balance">
            Real care, without the runaround.
          </h2>
          <p className="mb-6 max-w-[34em] text-[17px] leading-[1.6] text-muted text-pretty">
            We&apos;re independent — not part of a hospital system. We answer to our patients, keep
            prices honest, and take the time to listen.
          </p>
          <ul className="mb-6 flex flex-col">
            {REASONS.map((r) => (
              <li key={r.title} className="border-b border-line py-4">
                <div className="font-semibold text-ink">{r.title}</div>
                <div className="mt-1 text-[15px] leading-[1.5] text-muted">{r.body}</div>
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className="inline-block rounded-[12px] border-[1.5px] border-ink px-6 py-3.5 text-[16px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline"
          >
            More about our clinic
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-ink text-cloud">
        <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)]">
          <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow tone="coral">What we treat</Eyebrow>
              <h2 className="font-display text-[clamp(30px,4vw,46px)] font-extrabold tracking-[-.028em] text-balance">
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
          <div data-reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                className="rounded-2xl border border-cloud/15 bg-cloud/[.07] p-5 !text-cloud no-underline transition-colors hover:bg-cloud/15 hover:no-underline"
              >
                <div className="font-display text-[18px] font-bold">{s.name}</div>
                <div className="mt-1.5 text-[14px] leading-[1.5] text-cloud-soft">{s.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)]">
        <div data-reveal className="mb-8">
          <Eyebrow>From our patients</Eyebrow>
          <h2 className="font-display text-[clamp(30px,4vw,42px)] font-extrabold tracking-[-.028em] text-balance">
            What people say after their visit
          </h2>
        </div>
        <div data-reveal className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-line bg-white p-6">
              <div className="text-brand" aria-label="Five out of five stars">
                ★★★★★
              </div>
              <blockquote className="mt-3 text-[16px] leading-[1.55] text-ink text-pretty">
                {t.quote}
              </blockquote>
              <figcaption className="mt-4 text-[14px] text-muted">
                <strong className="text-ink">{t.name}</strong> · {t.meta}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* INSURANCE */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-12">
          <div data-reveal className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-[24px] font-bold tracking-[-.02em]">
              We accept most major insurance
            </h2>
            <Link
              href="/insurance"
              className="text-[16px] font-semibold text-brand no-underline hover:text-brand-dark hover:no-underline"
            >
              See all plans &amp; self-pay prices →
            </Link>
          </div>
          <InsuranceMarquee />
        </div>
      </section>

      {/* HOURS + WALK-IN */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-[clamp(16px,4vw,40px)] py-[clamp(56px,8vw,96px)] lg:grid-cols-2">
        <div data-reveal>
          <Eyebrow>Walk-ins welcome</Eyebrow>
          <h2 className="mb-4 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold tracking-[-.028em] text-balance">
            Open seven days a week, including evenings.
          </h2>
          <p className="mb-6 text-[16.5px] leading-[1.6] text-muted text-pretty">
            Come in whenever you need us. Checking in online just means less time in the waiting
            room.
          </p>
          <div className="flex flex-wrap gap-3">
            <CheckInButton className="home-hero-press rounded-xl bg-brand px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-press" />
            <a href={CLINIC.phoneHref} className={btnOutline}>
              Call {CLINIC.phone}
            </a>
          </div>
        </div>
        <div data-reveal className="rounded-2xl border border-line bg-white px-[22px] py-2">
          <HoursTable note />
        </div>
      </section>
    </main>
  );
}
