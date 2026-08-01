import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProviderBookingActions } from "@/components/provider-booking";
import { ProviderPhoto } from "@/components/provider-photo";
import { PROVIDERS, getProvider } from "@/lib/site-data";

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const prv = getProvider(id);
  if (!prv) return { title: "Our team — National Select Urgent Care" };
  return {
    title: `${prv.name} — National Select Urgent Care`,
    description: `${prv.title}. ${prv.short}`,
  };
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prv = getProvider(id);
  if (!prv) notFound();

  return (
    <main>
      <section className="border-b border-[#E1E8F2] bg-panel">
        <div className="mx-auto max-w-[1000px] px-[clamp(16px,4vw,40px)] pb-[clamp(36px,5vw,60px)] pt-[clamp(26px,4vw,44px)]">
          <div className="mb-[26px] flex flex-wrap items-center gap-2 text-[14px] text-muted">
            <Link href="/providers" className="font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline">
              Our team
            </Link>
            <span aria-hidden="true">/</span>
            <span>{prv.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-[26px]">
            <ProviderPhoto
              name={prv.name}
              initials={prv.initials}
              photo={prv.photo}
              ink={prv.ink}
              size="hero"
            />
            <div>
              <h1 className="mb-2 font-display text-[clamp(32px,4.6vw,50px)] font-extrabold leading-[1.05] tracking-[-.03em]">
                {prv.name}
              </h1>
              <div className="text-[18px] font-semibold text-[#e8342b]">{prv.title}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1000px] grid-cols-[repeat(auto-fit,minmax(270px,1fr))] items-start gap-[clamp(28px,4vw,56px)] px-[clamp(16px,4vw,40px)] py-[clamp(36px,5vw,64px)]">
        <div className="flex flex-col gap-[22px]">
          <p className="text-[18px] leading-[1.68] text-ink-soft text-pretty">{prv.bio1}</p>
          <p className="text-[18px] leading-[1.68] text-ink-soft text-pretty">{prv.bio2}</p>
          <div className="rounded-[18px] bg-panel-2 p-6">
            <div className="mb-3 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
              In their words
            </div>
            <p className="text-[18px] italic leading-[1.6] text-ink text-pretty">
              &ldquo;{prv.quote}&rdquo;
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-[18px] rounded-[18px] border border-line bg-white p-6">
            <div>
              <div className="mb-2 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
                Focus areas
              </div>
              <ul className="flex flex-wrap gap-[7px]">
                {prv.focus.map((f) => (
                  <li
                    key={f}
                    className="rounded-full border border-line bg-panel px-3 py-1.5 text-[13.5px]"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
                Education
              </div>
              <div className="text-[15.5px] leading-[1.55] text-ink">{prv.education}</div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
                Languages
              </div>
              <div className="text-[15.5px] text-ink">{prv.languages}</div>
            </div>
            <ProviderBookingActions provider={prv} />
          </div>
        </aside>
      </section>
    </main>
  );
}
