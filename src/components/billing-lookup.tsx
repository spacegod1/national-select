"use client";

import { useActionState, useState } from "react";
import { lookupBill, payBill, type BillLookupState, type PayBillState } from "@/app/billing/actions";
import { Busy } from "@/components/spinner";

const field =
  "rounded-[11px] border-[1.5px] border-field bg-mist px-3.5 py-[13px] text-[16px] font-normal";
const label = "flex flex-col gap-[7px] text-[14.5px] font-semibold";
const primary =
  "rounded-[12px] bg-[#e8342b] p-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#ce291f] disabled:opacity-70";

const initialLookup: BillLookupState = { status: "idle" };
const initialPay: PayBillState = { error: null };

type Props = { phone: string; phoneHref: string };

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function BillingLookup(props: Props) {
  // A new key remounts the card, which clears the last lookup.
  const [lookupNumber, setLookupNumber] = useState(0);
  return <LookupCard key={lookupNumber} onReset={() => setLookupNumber((n) => n + 1)} {...props} />;
}

function LookupCard({ phone, phoneHref, onReset }: Props & { onReset: () => void }) {
  const [state, lookupAction, looking] = useActionState(lookupBill, initialLookup);
  const [payState, payAction, paying] = useActionState(payBill, initialPay);

  const due = state.status === "found" && state.balanceCents > 0 ? state : null;

  let message: string | null = null;
  if (state.status === "invalid") {
    message = "Enter the account number and date of birth from your statement.";
  } else if (state.status === "not_found") {
    message = "We couldn't find a bill for that account number and date of birth.";
  } else if (state.status === "found" && !due) {
    message = `Account ${state.accountNumber} has no balance due.`;
  } else if (state.status === "unconfigured" || state.status === "error") {
    message = "Online bill lookup isn't available right now.";
  }

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-[clamp(24px,3vw,32px)]">
      {due ? null : (
        <form action={lookupAction} className="flex flex-col gap-4">
          <label className={label}>
            Account number
            <input type="text" name="accountNumber" placeholder="e.g. NS-104882" autoComplete="off" required className={field} />
          </label>
          <label className={label}>
            Date of birth
            <input type="text" name="dateOfBirth" placeholder="MM / DD / YYYY" autoComplete="bday" required className={field} />
          </label>
          <button type="submit" disabled={looking} className={primary}>
            {looking ? <Busy>Finding your balance</Busy> : "Find my balance"}
          </button>
        </form>
      )}

      <div aria-live="polite" className="flex flex-col gap-4 empty:hidden">
        {message ? <p className="text-[15px] leading-[1.55] text-ink">{message}</p> : null}

        {due ? (
          <>
            <div>
              <div className="text-[14.5px] font-semibold text-muted">Balance due for {due.accountNumber}</div>
              <div className="font-display text-[clamp(38px,5vw,50px)] font-extrabold leading-[1.1] tracking-[-.03em] tabular-nums">
                {formatDollars(due.balanceCents)}
              </div>
            </div>
            <form action={payAction} className="flex flex-col gap-3">
              <input type="hidden" name="accountNumber" value={due.accountNumber} />
              <input type="hidden" name="dateOfBirth" value={due.dateOfBirth} />
              <button type="submit" disabled={paying} className={primary}>
                {paying ? <Busy>Opening secure payment</Busy> : `Pay ${formatDollars(due.balanceCents)}`}
              </button>
              {payState.error ? (
                <p role="alert" className="text-[15px] leading-[1.55] text-brand-dark">
                  {payState.error}
                </p>
              ) : null}
              <p className="text-[14.5px] leading-[1.55] text-muted">
                You&apos;ll pay on a secure page run by Stripe. We never see or store your card number.
              </p>
            </form>
            <button
              type="button"
              onClick={onReset}
              className="self-start text-[15px] font-semibold text-brand hover:text-brand-dark"
            >
              Look up a different account
            </button>
          </>
        ) : null}
      </div>

      <div className="text-[14.5px] leading-[1.55] text-muted">
        Can&apos;t find your account number? Call billing at <a href={phoneHref}>{phone}</a>, Monday to Friday,
        9am–5pm. We can also set up a payment plan.
      </div>
    </div>
  );
}
