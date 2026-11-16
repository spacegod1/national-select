import type { Metadata } from "next";
import { BillingLookup } from "@/components/billing-lookup";
import { Eyebrow } from "@/components/ui";
import { CLINIC } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Pay my bill — National Select Urgent Care",
  description:
    "Pay your bill online with the account number from your statement. Payments post the same day with an emailed receipt.",
};

export default function BillingPage() {
  return (
    <main>
      <section className="mx-auto max-w-[680px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,84px)]">
        <Eyebrow>Billing</Eyebrow>
        <h1 className="mb-4 font-display text-[clamp(32px,4.6vw,50px)] font-extrabold leading-[1.05] tracking-[-.032em] text-balance">
          Pay my bill
        </h1>
        <p className="mb-7 text-[18px] leading-[1.6] text-muted text-pretty">
          Enter the account number from the top right of your statement. Payments post the same day,
          and you&apos;ll get an emailed receipt straight away.
        </p>
        <BillingLookup phone={CLINIC.phone} phoneHref={CLINIC.phoneHref} />
      </section>
    </main>
  );
}
