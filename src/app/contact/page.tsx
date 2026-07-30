import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { PlusMark } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";
import { HoursTable, StatusInline } from "@/components/live-widgets";
import { CLINIC } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact & location — National Select Urgent Care",
  description:
    "We're on Birchwood Avenue in Silver Spring, MD, with parking out front. Hours, directions and a contact form.",
};

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-[#E1E8F2] bg-panel">
        <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,72px)]">
          <Eyebrow>Contact & location</Eyebrow>
          <h1 className="mb-[18px] max-w-[14em] font-display text-[clamp(36px,5.4vw,62px)] font-extrabold leading-[1.03] tracking-[-.032em] text-balance">
            We&apos;re on Birchwood Avenue, with parking out front.
          </h1>
          <div className="flex flex-wrap gap-3">
            <a
              href={CLINIC.mapsHref}
              target="_blank"
              rel="noopener"
              className="rounded-[12px] bg-[#e8342b] px-[26px] py-[15px] text-[16px] font-semibold !text-white no-underline transition-colors hover:bg-[#ce291f] hover:no-underline"
            >
              Get directions
            </a>
            <a
              href={CLINIC.phoneHref}
              className="rounded-[12px] border-[1.5px] border-ink px-6 py-[15px] text-[16px] font-semibold !text-ink no-underline transition-colors hover:!bg-ink hover:!text-mist hover:no-underline"
            >
              Call {CLINIC.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[clamp(24px,4vw,44px)] px-[clamp(16px,4vw,40px)] py-[clamp(36px,5vw,64px)]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Map placeholder */}
          <div className="relative h-[300px] overflow-hidden rounded-[20px] border border-line bg-panel-2">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#D3DCEA 1px,transparent 1px),linear-gradient(90deg,#D3DCEA 1px,transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="absolute -left-[8%] top-[38%] h-[22px] w-[116%] bg-mist [transform:rotate(-7deg)]" />
            <div className="absolute left-[26%] -top-[10%] h-[120%] w-[20px] bg-mist [transform:rotate(9deg)]" />
            <div className="absolute left-1/2 top-[44%] flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1.5">
              <PlusMark
                cross="#E8342B"
                check="#fff"
                className="h-[34px] w-[34px] [filter:drop-shadow(0_6px_10px_rgba(27,42,74,.28))]"
              />
              <span className="whitespace-nowrap rounded-[7px] bg-ink px-2.5 py-[5px] font-mono text-[12.5px] text-cloud">
                1420 Birchwood Ave
              </span>
            </div>
            <div className="absolute bottom-3.5 left-3.5 rounded-[10px] border border-line bg-mist/90 px-3 py-2 font-mono text-[13px] text-muted">
              Map placeholder — embed Google Maps here
            </div>
          </div>

          {/* Hours */}
          <div className="rounded-[20px] border border-line bg-white p-[26px]">
            <h2 className="mb-4 font-display text-[21px] font-bold tracking-[-.018em]">Hours</h2>
            <HoursTable />
            <div className="mt-4 text-[15px]">
              <StatusInline />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-[26px]">
            <div>
              <div className="mb-1.5 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
                Address
              </div>
              <div className="text-[16.5px] leading-[1.5]">
                {CLINIC.addressLine1}
                <br />
                {CLINIC.addressLine2}
              </div>
            </div>
            <div>
              <div className="mb-1.5 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
                Phone &amp; fax
              </div>
              <div className="text-[16.5px] leading-[1.5]">
                <a href={CLINIC.phoneHref}>{CLINIC.phone}</a>
                <br />
                <span className="text-muted">Fax {CLINIC.fax}</span>
              </div>
            </div>
            <div>
              <div className="mb-1.5 font-mono text-[12px] uppercase tracking-[.09em] text-muted">
                Parking &amp; transit
              </div>
              <div className="text-[16px] leading-[1.55] text-muted">
                Free lot in front of the building, two accessible spaces by the door. Six minutes&apos;
                walk from the Silver Spring Metro.
              </div>
            </div>
          </div>
        </div>

        {/* Right column: form */}
        <div className="sticky top-[120px] rounded-[20px] border border-line bg-white p-[clamp(24px,3vw,34px)]">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
