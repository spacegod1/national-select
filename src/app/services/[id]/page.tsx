import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlusMark } from "@/components/icons";
import { CheckInButton } from "@/components/booking-modal";
import { TodayHours } from "@/components/live-widgets";
import { CLINIC, SERVICES, getService } from "@/lib/site-data";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const svc = getService(id);
  if (!svc) return { title: "Service — National Select Urgent Care" };
  return { title: `${svc.name} — National Select Urgent Care`, description: svc.intro };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const svc = getService(id);
  if (!svc) notFound();

  return (
    <main>
      <section className="border-b border-[#E1E8F2] bg-panel">
        <div className="mx-auto max-w-[1000px] px-[clamp(16px,4vw,40px)] pb-[clamp(36px,5vw,64px)] pt-[clamp(26px,4vw,44px)]">
          <div className="mb-[22px] flex flex-wrap items-center gap-2 text-[14px] text-muted">
            <Link href="/services" className="font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline">
              Services
            </Link>
            <span aria-hidden="true">/</span>
            <span>{svc.name}</span>
          </div>
          <h1 className="mb-[18px] font-display text-[clamp(34px,5vw,56px)] font-extrabold leading-[1.04] tracking-[-.032em] text-balance">
            {svc.name}
          </h1>
          <p className="max-w-[36em] text-[19px] leading-[1.55] text-muted text-pretty">{svc.intro}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1000px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-[clamp(28px,4vw,56px)] px-[clamp(16px,4vw,40px)] py-[clamp(36px,5vw,64px)]">
        <div className="flex flex-col gap-9">
          <div>
            <h2 className="mb-4 font-display text-[26px] font-bold tracking-[-.02em]">What we treat</h2>
            <ul className="flex flex-col gap-2.5">
              {svc.items.map((it) => (
                <li key={it} className="flex items-start gap-3 text-[16.5px] text-ink">
                  <PlusMark check="#F2F5FA" className="mt-1 h-[19px] w-[19px] flex-none" />
                  {it}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-display text-[26px] font-bold tracking-[-.02em]">What to expect</h2>
            <ol className="flex flex-col gap-4">
              {svc.expect.map((e) => (
                <li key={e.n} className="flex items-start gap-3.5">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-[9px] bg-panel-2 font-mono text-[13px] font-medium">
                    {e.n}
                  </span>
                  <span className="text-[16.5px] leading-[1.55] text-muted">
                    <strong className="font-semibold text-ink">{e.title}</strong> — {e.body}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[18px] border border-pink-line bg-pink p-6">
            <h3 className="mb-2.5 font-display text-[19px] font-bold tracking-[-.015em] text-[#b4231c]">
              When to go to the emergency room instead
            </h3>
            <p className="text-[16px] leading-[1.55] text-pink-ink text-pretty">
              Chest pain, trouble breathing, heavy bleeding, sudden weakness or confusion, a serious
              head injury, or any symptom that feels life-threatening — call 911 or go to the nearest
              ER. We&apos;d rather you be safe.
            </p>
          </div>
        </div>

        <aside className="sticky top-[120px] flex flex-col gap-3.5">
          <div className="rounded-[18px] border border-line bg-white p-6">
            <div className="mb-3 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
              Good to know
            </div>
            <div className="flex flex-col gap-3.5 text-[15.5px]">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Typical visit</span>
                <strong className="font-semibold">{svc.duration}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Self-pay from</span>
                <strong className="font-semibold">{svc.price}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Appointment</span>
                <strong className="font-semibold">Not required</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Ages seen</span>
                <strong className="font-semibold">6 months and up</strong>
              </div>
            </div>
            <CheckInButton className="mt-5 w-full rounded-[12px] bg-[#e8342b] p-[15px] text-[16px] font-semibold text-white transition-colors hover:bg-[#ce291f]" />
            <Link
              href="/insurance"
              className="mt-2 block w-full rounded-[12px] border-[1.5px] border-field p-3.5 text-center text-[15.5px] font-semibold !text-ink no-underline transition-colors hover:border-ink hover:no-underline"
            >
              Check my insurance
            </Link>
          </div>
          <div className="rounded-[18px] bg-panel-2 p-[22px] text-[15px] leading-[1.55] text-ink">
            <strong className="mb-1.5 block font-semibold">Open today</strong>
            <span className="text-muted">
              <TodayHours /> · {CLINIC.addressShort}
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}
