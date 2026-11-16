import type { Metadata } from "next";
import Link from "next/link";
import { recordCheckoutPayment, type CheckoutPayment } from "@/lib/billing/checkout";
import { CLINIC } from "@/lib/site-data";
import { formatDollars } from "@/lib/staff/format";

export const metadata: Metadata = {
  title: "Payment status — National Select Urgent Care",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: sessionId } = await searchParams;

  // Stripe also reports the payment to the webhook. Recording it here as well means
  // the balance is already updated when the patient lands on this page.
  let payment: CheckoutPayment = { status: "not_completed" };
  if (typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    try {
      payment = await recordCheckoutPayment(sessionId);
    } catch (error) {
      console.error("Billing: confirming a payment on return failed", error);
    }
  }

  let heading: string;
  let body: string;
  if (payment.status === "paid") {
    heading = "Payment received";
    body = `Thank you. We received ${formatDollars(payment.amountCents)} for account ${payment.accountNumber}.`;
  } else if (payment.status === "processing") {
    heading = "Payment processing";
    body = "Your bank is still confirming this payment. Your balance updates as soon as it clears.";
  } else {
    heading = "We couldn't confirm this payment";
    body = "If you completed a payment, call billing and we'll check it. Otherwise, return to your bill and try again.";
  }

  return (
    <main>
      <section className="mx-auto max-w-[680px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,84px)]">
        <h1 className="mb-4 font-display text-[clamp(32px,4.6vw,50px)] font-extrabold leading-[1.05] tracking-[-.032em] text-balance">
          {heading}
        </h1>
        <p className="mb-3 text-[18px] leading-[1.6] text-muted text-pretty">{body}</p>
        <p className="mb-7 text-[18px] leading-[1.6] text-muted text-pretty">
          Questions about your bill? Call billing at <a href={CLINIC.phoneHref}>{CLINIC.phone}</a>.
        </p>
        {payment.status === "not_completed" ? (
          <Link
            href="/billing"
            className="inline-block rounded-[12px] bg-[#e8342b] px-5 py-3.5 text-[17px] font-semibold text-white no-underline transition-colors hover:bg-[#ce291f]"
          >
            Back to my bill
          </Link>
        ) : null}
      </section>
    </main>
  );
}
