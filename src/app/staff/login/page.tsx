import Image from "next/image";
import { redirect } from "next/navigation";
import { StaffSignInForm } from "@/components/staff-entry";
import { CLINIC } from "@/lib/site-data";
import { getCurrentStaff } from "@/lib/staff/session";
import { hasStaffUsers } from "@/lib/staff/users";

export default async function StaffLoginPage() {
  let needsSetup = false;
  let signedIn = false;
  try {
    signedIn = (await getCurrentStaff()) !== null;
    needsSetup = !signedIn && !(await hasStaffUsers());
  } catch (error) {
    console.error("Staff: loading the sign-in page failed", error);
  }
  if (signedIn) redirect("/staff");
  if (needsSetup) redirect("/staff/setup");

  return (
    <div className="grid min-h-[100dvh] bg-white lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* The navy side carries the brand. Below the lg breakpoint it sits on top, without the photo. */}
      <aside className="relative isolate flex flex-col justify-between gap-8 overflow-hidden bg-ink px-[clamp(20px,4vw,56px)] py-[clamp(20px,3vw,40px)] text-cloud">
        <Image
          src="/stethoscope_desk.png"
          alt=""
          fill
          sizes="55vw"
          className="-z-20 object-cover max-lg:hidden"
        />
        <div
          className="absolute inset-0 -z-10 max-lg:hidden"
          style={{
            background: "linear-gradient(to top, #1b2a4a 0%, rgba(27,42,74,.93) 38%, rgba(27,42,74,.74) 100%)",
          }}
        />
        <Image
          src="/logo-light.png"
          alt={CLINIC.name}
          width={106}
          height={46}
          className="h-[46px] w-auto self-start"
        />

        <div className="staff-entry-rise max-w-[30em]">
          <div className="mb-3.5 font-mono text-[12.5px] uppercase tracking-[.11em] text-coral">Staff area</div>
          <h1 className="font-display text-[clamp(32px,4.6vw,58px)] font-extrabold leading-[1.02] tracking-[-.034em]">
            Good to see you.
          </h1>
          <p className="mt-4 text-[17px] leading-[1.55] text-cloud-soft">
            Sign in to open patient accounts, post charges and see what has been paid.
          </p>
        </div>

        <p className="font-mono text-[12px] uppercase tracking-[.09em] text-navy-label max-lg:hidden">
          Signs out after 30 minutes idle · Every action is logged
        </p>
      </aside>

      <main className="flex items-center justify-center px-[clamp(20px,4vw,56px)] py-[clamp(32px,6vw,72px)]">
        <div className="staff-entry-rise staff-entry-delay w-full max-w-[420px]">
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-.028em]">Sign in</h2>
          <p className="mb-7 mt-2 text-[15.5px] leading-[1.5] text-muted">Use the email your admin added you with.</p>
          <StaffSignInForm />
          <p className="mt-4 text-[14.5px] leading-[1.5] text-muted">
            Forgot your password? A clinic admin can reset it.
          </p>
        </div>
      </main>
    </div>
  );
}
