import { StaffUsers, type StaffUserRow } from "@/components/staff-users";
import { ART, PageHead, StaffPage } from "@/components/staff-ui";
import { formatStamp } from "@/lib/staff/format";
import { requireAdmin } from "@/lib/staff/session";
import { listStaffUsers } from "@/lib/staff/users";

export default async function StaffUsersPage() {
  const admin = await requireAdmin();

  let users: StaffUserRow[] | null = null;
  try {
    users = (await listStaffUsers()).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: !user.active ? "deactivated" : user.mustChangePassword ? "temporary" : "active",
      lastSignIn: user.lastSignInAt ? formatStamp(user.lastSignInAt) : null,
    }));
  } catch (error) {
    console.error("Staff: listing staff users failed", error);
  }

  return (
    <StaffPage>
      <PageHead
        art={ART.users}
        title="Staff users"
        lead="Everyone signs in with their own email and password. Deactivate someone when they leave: it signs them out and keeps their history."
      />
      <StaffUsers users={users} currentUserId={admin.id} />
    </StaffPage>
  );
}
