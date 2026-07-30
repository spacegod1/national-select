import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { CheckInButton } from "@/components/booking-modal";
import { CLINIC, SERVICES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services — National Select Urgent Care",
  description:
    "Everyday care, urgent problems, and the tests that go with them — usually same day, usually for a fraction of an ER bill.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Services"
        titleMax="16em"
        title="Everyday care, urgent problems, and the tests that go with them."
        lede="If it isn't life-threatening, there's a good chance we can handle it here — usually same day, and usually for a fraction of an emergency room bill."
      />

      <Container as="section" className="py-[clamp(40px,6vw,72px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[18px]">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              data-reveal
              className="flex flex-col gap-3.5 rounded-[20px] border border-line bg-white px-[26px] py-7"
            >
              <div className="flex items-center gap-3">
                <PlusMark check="#fff" className="h-[22px] w-[22px] flex-none" />
                <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">{s.name}</h2>
              </div>
              <p className="text-[15.5px] leading-[1.55] text-muted">{s.blurb}</p>
              <ul className="flex flex-wrap gap-[7px]">
                {s.items.map((it) => (
                  <li
                    key={it}
                    className="rounded-full border border-line bg-panel px-3 py-1.5 text-[13.5px] text-ink"
                  >
                    {it}
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${s.id}`}
                className="mt-auto self-start pt-2 text-[15.5px] font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline"
              >
                About {s.name.toLowerCase()} →
              </Link>
            </div>
          ))}
        </div>
      </Container>

      <Container as="section" className="pb-[clamp(56px,8vw,100px)]">
        <div
          data-reveal
          className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-7 rounded-[24px] bg-ink p-[clamp(28px,4vw,52px)] text-cloud"
        >
          <div>
            <h2 className="mb-3.5 font-display text-[clamp(26px,3.2vw,36px)] font-extrabold leading-[1.08] tracking-[-.026em] text-balance">
              Not sure if we can help?
            </h2>
            <p className="text-[17px] leading-[1.6] opacity-80 text-pretty">
              Call us and describe what&apos;s going on. If you need an emergency room instead,
              we&apos;ll tell you straight away — and help you get there.
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <a
              href={CLINIC.phoneHref}
              className="rounded-[12px] bg-[#e8342b] px-[26px] py-[15px] text-[16px] font-semibold !text-white no-underline transition-colors hover:bg-[#ce291f] hover:no-underline"
            >
              Call {CLINIC.phone}
            </a>
            <CheckInButton className="rounded-[12px] border-[1.5px] border-cloud/35 px-[26px] py-[15px] text-[16px] font-semibold text-cloud transition-colors hover:bg-[#e4ebf4] hover:text-ink" />
          </div>
        </div>
      </Container>
    </main>
  );
}
