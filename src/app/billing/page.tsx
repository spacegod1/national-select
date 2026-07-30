import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { CLINIC } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Pay my bill — National Select Urgent Care",
  description:
    "Pay your bill online with the account number from your statement. Payments post the same day with an emailed receipt.",
};

const field =
  "rounded-[11px] border-[1.5px] border-field bg-mist px-3.5 py-[13px] text-[16px] font-normal";
const label = "flex flex-col gap-[7px] text-[14.5px] font-semibold";

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
        <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-[clamp(24px,3vw,32px)]">
          <label className={label}>
            Account number
            <input type="text" placeholder="e.g. NS-104882" className={field} />
          </label>
          <label className={label}>
            Date of birth
            <input type="text" placeholder="MM / DD / YYYY" className={field} />
          </label>
          <button className="rounded-[12px] bg-[#e8342b] p-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#ce291f]">
            Find my balance
          </button>
          <div className="text-[14.5px] leading-[1.55] text-muted">
            Can&apos;t find your account number? Call billing at{" "}
            <a href={CLINIC.phoneHref}>{CLINIC.phone}</a>, Monday to Friday, 9am–5pm. We can also set
            up a payment plan.
          </div>
        </div>
      </section>
    </main>
  );
}
