import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { PROVIDERS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Our team — National Select Urgent Care",
  description:
    "Board-certified physicians, nurse practitioners and physician assistants — all part of our permanent team, not a rotating roster of locums.",
};

export default function ProvidersPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our team"
        title="The clinicians you'll actually see."
        lede="Board-certified physicians, nurse practitioners and physician assistants — all part of our permanent team, not a rotating roster of locums."
      />

      <Container as="section" className="py-[clamp(40px,6vw,80px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
          {PROVIDERS.map((p) => (
            <Link
              key={p.id}
              href={`/providers/${p.id}`}
              data-reveal
              className="flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-[26px] text-left no-underline transition-all hover:-translate-y-[3px] hover:no-underline hover:shadow-[0_14px_32px_rgba(27,42,74,.09)]"
            >
              <span
                className="grid h-[74px] w-[74px] place-items-center rounded-[20px] font-display text-[26px] font-extrabold tracking-[-.02em]"
                style={{ background: p.tint, color: p.ink }}
              >
                {p.initials}
              </span>
              <span>
                <span className="block font-display text-[21px] font-bold tracking-[-.018em] text-ink">
                  {p.name}
                </span>
                <span className="mt-[3px] block text-[14.5px] font-semibold text-[#e8342b]">{p.title}</span>
              </span>
              <span className="text-[15px] leading-[1.55] text-muted">{p.short}</span>
              <span className="mt-auto pt-1.5 text-[14.5px] font-semibold text-ink">
                Read full bio →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
