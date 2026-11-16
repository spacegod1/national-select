import Link from "next/link";
import { signOut } from "@/app/staff/actions";
import { PasswordChange } from "@/components/staff-entry";
import { requireStaff } from "@/lib/staff/session";

const exitClass = "text-[14.5px] font-semibold text-muted no-underline hover:text-brand-dark hover:no-underline";

/**
 * Sits outside the staff menu on purpose: someone on a temporary password can't
 * go anywhere else until they have chosen their own.
 */
export default async function StaffPasswordPage() {
  const user = await requireStaff({ allowIssuedPassword: true });

  return (
    <PasswordChange
      temporary={user.mustChangePassword}
      exit={
        user.mustChangePassword ? (
          <form action={signOut}>
            <button type="submit" className={exitClass}>
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/staff" className={exitClass}>
            Cancel
          </Link>
        )
      }
    />
  );
}
