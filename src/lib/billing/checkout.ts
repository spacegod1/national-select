import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { newAuditEntry, ONLINE_PAYMENT } from "@/lib/audit";
import { normalizeAccountNumber } from "@/lib/billing/lookup";
import { getDb } from "@/lib/firebase/admin";
import { COLLECTIONS, type PaymentRecord } from "@/lib/firebase/collections";
import { formatDollars } from "@/lib/staff/format";
import { getStripe } from "@/lib/stripe/client";

/** Stripe refuses card payments under $0.50. */
export const MIN_ONLINE_PAYMENT_CENTS = 50;

// Stripe's minimum session lifetime is 30 minutes. A short life keeps the amount
// on the payment page close to the balance on the account.
const CHECKOUT_LIFETIME_SECONDS = 31 * 60;

export type CheckoutPayment =
  | { status: "paid"; accountNumber: string; amountCents: number }
  | { status: "processing" }
  | { status: "not_completed" };

/**
 * Opens a Stripe-hosted payment page for the account's balance and returns its URL.
 * Only the account number goes to Stripe. Charge descriptions stay in Firestore.
 */
export async function createBalanceCheckout(accountNumber: string, balanceCents: number): Promise<string> {
  const domain = process.env.DOMAIN ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    ui_mode: "hosted_page",
    success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: balanceCents,
          product_data: { name: "Urgent care bill", description: `Account ${accountNumber}` },
        },
      },
    ],
    metadata: { accountNumber },
    payment_intent_data: { metadata: { accountNumber } },
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_LIFETIME_SECONDS,
    // Bills are in US dollars. Without this, Stripe offers to charge in the payer's
    // local currency and reports the amount paid in that currency.
    adaptive_pricing: { enabled: false },
    billing_address_collection: "auto",
    allow_promotion_codes: false,
    submit_type: "auto",
    integration_identifier: "hosted_web_0001",
    origin_context: "web",
  });

  if (!session.url) throw new Error("Checkout Session is missing a redirect URL");
  return session.url;
}

/**
 * Writes a paid Checkout Session to the account: one payment record, a lower balance,
 * and the charges it covers marked paid, oldest first. Safe to call more than once for
 * the same session. The webhook and the return page both call it.
 */
export async function recordCheckoutPayment(sessionId: string): Promise<CheckoutPayment> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const accountNumber = normalizeAccountNumber(session.metadata?.accountNumber ?? "");
  const amountCents = session.amount_total;

  if (session.status !== "complete" || !accountNumber || !amountCents) return { status: "not_completed" };
  if (session.payment_status === "unpaid") return { status: "processing" };
  if (session.currency !== "usd") {
    throw new Error(`Checkout Session ${session.id} was paid in ${session.currency}, not usd`);
  }

  const paymentIntent = session.payment_intent;
  const payment: PaymentRecord = {
    accountId: accountNumber,
    amountCents,
    stripePaymentId: typeof paymentIntent === "string" ? paymentIntent : (paymentIntent?.id ?? session.id),
    paidAt: new Date().toISOString(),
  };

  const db = getDb();
  const paymentRef = db.collection(COLLECTIONS.payments).doc(session.id);
  const accountRef = db.collection(COLLECTIONS.accounts).doc(accountNumber);
  const chargesQuery = db.collection(COLLECTIONS.charges).where("accountId", "==", accountNumber);

  await db.runTransaction(async (tx) => {
    const [paymentSnap, accountSnap, chargesSnap] = await Promise.all([
      tx.get(paymentRef),
      tx.get(accountRef),
      tx.get(chargesQuery),
    ]);
    if (paymentSnap.exists) return;
    if (!accountSnap.exists) {
      throw new Error(`Checkout Session ${session.id} was paid for missing account ${accountNumber}`);
    }

    const unpaid = chargesSnap.docs
      .filter((doc) => doc.get("status") === "unpaid")
      .sort((a, b) => String(a.get("createdAt")).localeCompare(String(b.get("createdAt"))));

    let remainingCents = amountCents;
    for (const doc of unpaid) {
      const chargeCents = Number(doc.get("amountCents"));
      if (chargeCents > remainingCents) continue;
      tx.update(doc.ref, { status: "paid" });
      remainingCents -= chargeCents;
    }

    tx.create(paymentRef, payment);
    tx.update(accountRef, { balanceCents: FieldValue.increment(-amountCents) });
    const audit = newAuditEntry(ONLINE_PAYMENT, "payment.recorded", {
      accountNumber,
      detail: `${formatDollars(amountCents)}, ${payment.stripePaymentId}`,
    });
    tx.create(audit.ref, audit.data);
  });

  return { status: "paid", accountNumber, amountCents };
}
