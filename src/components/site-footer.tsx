import Link from "next/link";
import Image from "next/image";
import { CLINIC, HOURS } from "@/lib/site-data";

const CARE_LINKS = [
  { label: "Illnesses", href: "/services/illnesses" },
  { label: "Injuries", href: "/services/injuries" },
  { label: "Physicals", href: "/services/physicals" },
  { label: "Lab testing", href: "/services/labs" },
  { label: "All services", href: "/services" },
];

const PATIENT_LINKS = [
  { label: "Patient portal", href: "/resources" },
  { label: "Forms & records", href: "/resources" },
  { label: "Insurance & pricing", href: "/insurance" },
  { label: "Pay my bill", href: "/billing" },
  { label: "Contact us", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-cloud-soft">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[clamp(28px,4vw,48px)] px-[clamp(16px,4vw,40px)] pb-7 pt-[clamp(44px,6vw,72px)]">
        <div className="col-span-1 min-w-[240px]">
          <Image
            src="/logo-on-dark.png"
            alt={CLINIC.name}
            width={101}
            height={44}
            className="mb-[18px] block h-11 w-auto"
          />
          <p className="mb-4 max-w-[26em] text-[15.5px] leading-[1.6] opacity-70">
            Your local walk-in clinic. Independent urgent care and primary care in Silver
            Spring, Maryland.
          </p>
          <div className="text-[15.5px] leading-[1.7] opacity-85">
            {CLINIC.addressLine1}
            <br />
            {CLINIC.addressLine2}
            <br />
            <a href={CLINIC.phoneHref} className="font-medium !text-cloud no-underline hover:no-underline">
              {CLINIC.phone}
            </a>
          </div>
        </div>

        <div>
          <div className="mb-3.5 font-mono text-[12px] uppercase tracking-[.09em] text-navy-label">
            Care
          </div>
          <ul className="flex flex-col gap-2.5 text-[15.5px]">
            {CARE_LINKS.map((l) => (
              <li key={l.label + l.href}>
                <Link href={l.href} className="!text-cloud-soft no-underline transition-colors hover:!text-white hover:no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3.5 font-mono text-[12px] uppercase tracking-[.09em] text-navy-label">
            Patients
          </div>
          <ul className="flex flex-col gap-2.5 text-[15.5px]">
            {PATIENT_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="!text-cloud-soft no-underline transition-colors hover:!text-white hover:no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3.5 font-mono text-[12px] uppercase tracking-[.09em] text-navy-label">
            Hours
          </div>
          <ul className="flex flex-col gap-2.5 text-[15.5px]">
            {HOURS.map((h) => (
              <li key={h.day} className="flex flex-col gap-px">
                <span className="opacity-70">{h.day}</span>
                <span className="font-mono text-[14.5px]">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-x-[22px] gap-y-2.5 border-t border-cloud/15 px-[clamp(16px,4vw,40px)] pb-10 pt-[22px] text-[13.5px] text-navy-label">
        <span>© 2026 {CLINIC.name}. All rights reserved.</span>
        <span className="flex flex-wrap gap-x-[22px] gap-y-2.5">
          <span>Privacy practices</span>
          <span>Notice of nondiscrimination</span>
          <span>Accessibility</span>
        </span>
      </div>

      <div className="bg-[#e8342b] px-5 py-3.5 text-center text-[14.5px] font-medium text-white">
        Medical emergency? Call 911 or go to the nearest emergency room.
      </div>
    </footer>
  );
}
