import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { PlusOutline } from "@/components/icons";
import { POSTS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Health news — National Select Urgent Care",
  description:
    "Plain-language health notes from our clinicians — what's going around, what to do at home, and when it's time to come in.",
};

export default function BlogPage() {
  return (
    <main>
      <PageHero
        eyebrow="Health news"
        titleMax="14em"
        title="Plain-language health notes from our clinicians."
        lede="Short, practical reads — what's going around, what to do at home, and when it's time to come in."
      />

      <Container as="section" className="py-[clamp(40px,6vw,80px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[18px]">
          {POSTS.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.id}`}
              data-reveal
              className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white text-left no-underline transition-all hover:-translate-y-[3px] hover:no-underline hover:shadow-[0_14px_32px_rgba(27,42,74,.09)]"
            >
              <span
                className="relative block h-[130px] overflow-hidden"
                style={{ background: p.tint }}
              >
                <PlusOutline
                  fill={p.ink}
                  className="absolute -bottom-6 -right-3.5 h-[118px] w-[118px] opacity-[.22]"
                />
                <span className="absolute left-[18px] top-[18px] rounded-full bg-mist/90 px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-[.07em] text-ink">
                  {p.category}
                </span>
              </span>
              <span className="flex flex-1 flex-col gap-2.5 p-6">
                <span className="font-mono text-[12.5px] text-muted">
                  {p.date} · {p.read}
                </span>
                <span className="font-display text-[21px] font-bold leading-[1.2] tracking-[-.02em] text-ink text-balance">
                  {p.title}
                </span>
                <span className="text-[15.5px] leading-[1.55] text-muted">{p.excerpt}</span>
                <span className="mt-auto pt-2 text-[14.5px] font-semibold text-[#e8342b]">
                  Read article →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
