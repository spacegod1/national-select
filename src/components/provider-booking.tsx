"use client";

import { BookAppointmentButton, CheckInButton } from "@/components/booking-modal";

type Props = {
  provider: {
    id: string;
    name: string;
    title: string;
    bookable?: boolean;
  };
};

/** Sidebar CTAs on a clinician profile: book with this doctor, or same-day check-in. */
export function ProviderBookingActions({ provider }: Props) {
  const shortName = provider.name.split(",")[0];

  return (
    <div className="flex flex-col gap-2.5">
      {provider.bookable && (
        <BookAppointmentButton
          provider={{ id: provider.id, name: provider.name, title: provider.title }}
          className="rounded-[12px] bg-[#e8342b] p-[15px] text-[16px] font-semibold text-white transition-colors hover:bg-[#ce291f]"
        >
          Book with {shortName}
        </BookAppointmentButton>
      )}
      <CheckInButton
        className={
          provider.bookable
            ? "rounded-[12px] border-[1.5px] border-ink p-[15px] text-[16px] font-semibold text-ink transition-colors hover:bg-ink hover:text-mist"
            : "rounded-[12px] bg-[#e8342b] p-[15px] text-[16px] font-semibold text-white transition-colors hover:bg-[#ce291f]"
        }
      >
        {provider.bookable ? "Same-day check-in" : "Check in online"}
      </CheckInButton>
      {provider.bookable && (
        <p className="text-[13px] leading-[1.5] text-muted">
          Book for physicals and follow-ups. Use check-in for same-day illness or injury — any
          available clinician will see you.
        </p>
      )}
    </div>
  );
}
