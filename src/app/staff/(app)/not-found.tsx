import Link from "next/link";
import { gutter, skin } from "@/components/staff-ui";

/** Shown inside the staff menu when an account number in the address doesn't exist. */
export default function StaffNotFound() {
  return (
    <main className={`py-10 md:min-h-0 md:flex-1 md:bg-mist ${gutter}`}>
      <h1 className="font-display text-[clamp(26px,3.4vw,34px)] font-extrabold leading-[1.08] tracking-[-.03em]">
        There&apos;s no account with that number.
      </h1>
      <p className="mt-2 max-w-[520px] text-muted">
        Check the number against the patient&apos;s statement. It looks like NS-123456.
      </p>
      <Link href="/staff" className={`${skin.primary} mt-6 inline-block`}>
        Back to accounts
      </Link>
    </main>
  );
}
