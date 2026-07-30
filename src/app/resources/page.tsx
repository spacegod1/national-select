import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { FaqList } from "@/components/faq-list";
import { FORMS, RESOURCE_CARDS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Patient resources — National Select Urgent Care",
  description:
    "Forms, records and answers — all in one place. Handle the paperwork before you arrive so your visit is about you.",
};

export default function ResourcesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Patient resources"
        title="Forms, records and answers — all in one place."
        lede="Handle the paperwork before you arrive so your visit is about you, not a clipboard."
      />

      <Container as="section" className="py-[clamp(40px,6vw,72px)]">
        <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {RESOURCE_CARDS.map((rc) => (
            <div
              key={rc.title}
              className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-[26px]"
            >
              <PlusMark check="#fff" className="h-[22px] w-[22px]" />
              <h2 className="font-display text-[20px] font-bold tracking-[-.018em]">{rc.title}</h2>
              <p className="text-[15.5px] leading-[1.55] text-muted">{rc.body}</p>
              <span className="mt-auto pt-1.5 text-[14.5px] font-semibold text-[#e8342b]">{rc.cta} →</span>
            </div>
          ))}
        </div>
      </Container>

      <Container as="section" className="pb-[clamp(40px,6vw,72px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[clamp(24px,4vw,48px)]">
          <div>
            <h2 className="mb-[18px] font-display text-[clamp(23px,2.8vw,30px)] font-bold tracking-[-.022em]">
              Forms to download
            </h2>
            <ul className="flex flex-col gap-2.5">
              {FORMS.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center justify-between gap-3.5 rounded-[14px] border border-line bg-white px-[18px] py-4"
                >
                  <span>
                    <span className="block text-[16px] font-semibold">{f.name}</span>
                    <span className="mt-0.5 block text-[14px] text-muted">{f.note}</span>
                  </span>
                  <span className="flex-none font-mono text-[12.5px] text-muted">{f.size}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-[18px] font-display text-[clamp(23px,2.8vw,30px)] font-bold tracking-[-.022em]">
              Common questions
            </h2>
            <FaqList />
          </div>
        </div>
      </Container>
    </main>
  );
}
