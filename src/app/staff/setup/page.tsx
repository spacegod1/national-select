import { redirect } from "next/navigation";
import { FirstAdminSetup, GuidedShell } from "@/components/staff-entry";
import { hasStaffUsers } from "@/lib/staff/users";

/** Creates the first admin. Closed for good once any staff user exists. */
export default async function StaffSetupPage() {
  let alreadySetUp: boolean | null = null;
  try {
    alreadySetUp = await hasStaffUsers();
  } catch (error) {
    console.error("Staff: loading the setup page failed", error);
  }
  if (alreadySetUp) redirect("/staff/login");

  if (alreadySetUp === null) {
    return (
      <GuidedShell status="First-time setup" progress={0}>
        <h1 className="font-display text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.05] tracking-[-.032em]">
          Setup can&apos;t start right now.
        </h1>
        <p role="alert" className="mt-3 text-[16.5px] leading-[1.5] text-muted">
          The staff database didn&apos;t respond. Reload this page to try again.
        </p>
      </GuidedShell>
    );
  }

  return <FirstAdminSetup />;
}
