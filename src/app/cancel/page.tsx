import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment canceled — National Select Urgent Care",
  description: "No charge was made. You can return to your bill and try again.",
};

export default function CancelPage() {
  return (
    <main>
      <section className="mx-auto max-w-[680px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,84px)]">
        <h1 className="mb-4 font-display text-[clamp(32px,4.6vw,50px)] font-extrabold leading-[1.05] tracking-[-.032em] text-balance">
          Payment canceled
        </h1>
        <p className="mb-7 text-[18px] leading-[1.6] text-muted text-pretty">
          No charge was made. You can return to your bill and try again.
        </p>
        <Link
          href="/billing"
          className="inline-block rounded-[12px] bg-[#e8342b] px-5 py-3.5 text-[17px] font-semibold text-white no-underline transition-colors hover:bg-[#ce291f]"
        >
          Back to my bill
        </Link>
      </section>
    </main>
  );
}
