import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { recordCheckoutPayment } from "@/lib/billing/checkout";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Stripe webhook: STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") ?? "",
      webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Bank debits and similar methods complete the session first and pay later.
  // recordCheckoutPayment writes nothing until Stripe reports the session as paid.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      await recordCheckoutPayment(event.data.object.id);
    } catch (error) {
      // A 500 makes Stripe deliver the event again later.
      console.error("Stripe webhook: recording a payment failed", error);
      return NextResponse.json({ error: "Payment was not recorded" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
