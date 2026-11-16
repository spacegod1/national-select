"use server";

import { redirect } from "next/navigation";
import { createBalanceCheckout, MIN_ONLINE_PAYMENT_CENTS } from "@/lib/billing/checkout";
import { lookupBalance, type BillLookup } from "@/lib/billing/lookup";

export type BillLookupState = BillLookup | { status: "idle" } | { status: "error" };
export type PayBillState = { error: string | null };

export async function lookupBill(_previous: BillLookupState, formData: FormData): Promise<BillLookupState> {
  try {
    return await lookupBalance(
      String(formData.get("accountNumber") ?? ""),
      String(formData.get("dateOfBirth") ?? ""),
    );
  } catch {
    return { status: "error" };
  }
}

/** Checks the account again, then sends the patient to Stripe to pay the balance on file. */
export async function payBill(_previous: PayBillState, formData: FormData): Promise<PayBillState> {
  let checkoutUrl: string;
  try {
    const bill = await lookupBalance(
      String(formData.get("accountNumber") ?? ""),
      String(formData.get("dateOfBirth") ?? ""),
    );
    if (bill.status !== "found" || bill.balanceCents <= 0) {
      return { error: "We couldn't find a balance due on that account. Look it up again." };
    }
    if (bill.balanceCents < MIN_ONLINE_PAYMENT_CENTS) {
      return { error: "Balances under $0.50 can't be paid online. Call billing to pay." };
    }
    checkoutUrl = await createBalanceCheckout(bill.accountNumber, bill.balanceCents);
  } catch (error) {
    console.error("Billing: starting a payment failed", error);
    return { error: "Online payment isn't available right now." };
  }
  redirect(checkoutUrl);
}
