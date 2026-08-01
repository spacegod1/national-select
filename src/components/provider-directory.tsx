"use client";

import Link from "next/link";
import { BookAppointmentButton } from "@/components/booking-modal";
import { ProviderPhoto } from "@/components/provider-photo";
import type { Provider } from "@/lib/site-data";

function todayHoursLabel(now = new Date()) {
  const day = now.getDay();
  if (day === 0 || day === 6) return "9a – 5p";
  return "8a – 8p";
}

function ScheduleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  const hours = todayHoursLabel();
  const shortName = provider.name.split(",")[0];

  return (
    <article
      data-reveal
      className="relative rounded-2xl bg-panel p-4 transition-colors hover:bg-[#dce5f2] sm:p-5"
    >
      <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
        {provider.bookable && (
          <>
            <span
              className="h-2.5 w-2.5 rounded-full bg-open"
              title="On the schedule today"
              aria-label="On the schedule today"
            />
            <BookAppointmentButton
              provider={{ id: provider.id, name: provider.name, title: provider.title }}
              className="grid h-9 w-9 place-items-center rounded-full text-[#e8342b] transition-colors hover:bg-white"
              aria-label={`View schedule and book with ${shortName}`}
            >
              <ScheduleIcon />
            </BookAppointmentButton>
          </>
        )}
      </div>

      <Link
        href={`/providers/${provider.id}`}
        className="flex items-start gap-3 no-underline hover:no-underline sm:gap-4"
      >
        <ProviderPhoto
          name={provider.name}
          initials={provider.initials}
          photo={provider.photo}
          ink={provider.ink}
          size="card"
        />
        <span className="min-w-0 flex-1 pr-12 pt-0.5">
          <span className="block font-display text-[16px] font-bold leading-[1.25] tracking-[-.015em] text-ink sm:text-[17px]">
            {provider.name}
          </span>
          <span className="mt-1 block text-[13.5px] leading-[1.35] text-muted sm:text-[14px]">
            {provider.title}
          </span>
        </span>
      </Link>

      {provider.bookable && (
        <div className="mt-3.5 border-t border-[#d0dae8]/80 pt-3 text-[13.5px] leading-[1.45] sm:mt-4 sm:pt-3.5 sm:text-[14px]">
          <div className="text-ink">
            <span className="font-medium">Today: </span>
            <Link
              href="/contact"
              className="font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline"
            >
              Silver Spring
            </Link>
          </div>
          <div className="mt-0.5 text-muted">{hours}</div>
        </div>
      )}
    </article>
  );
}

export function ProviderDirectory({ providers }: { providers: Provider[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {providers.map((p) => (
        <ProviderCard key={p.id} provider={p} />
      ))}
    </div>
  );
}
