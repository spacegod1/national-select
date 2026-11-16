import type { ReactNode } from "react";
import { AccountsStateProvider } from "@/components/staff-accounts";
import { StaffRail, StaffTopBar } from "@/components/staff-shell";
import { getCurrentStaff } from "@/lib/staff/session";

// Each page checks the sign-in itself. The layout only reads who is signed in to draw the menu.
export default async function StaffAppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentStaff().catch(() => null);
  // Nobody to draw a menu for: the page is about to send them to sign in or to choose a password.
  if (!user || user.mustChangePassword) return children;

  const admin = user.role === "admin";

  return (
    <AccountsStateProvider>
      {/* Tablets and larger: the window is the frame and each pane scrolls on its own.
          Phones: the page scrolls as usual. */}
      <div className="min-h-dvh bg-white text-[16px] leading-[1.5] md:flex md:h-dvh md:overflow-hidden md:text-[14.5px] md:leading-[1.45]">
        <StaffRail name={user.name} admin={admin} />
        <div className="min-w-0 md:flex md:min-h-0 md:flex-1 md:flex-col">
          <StaffTopBar admin={admin} />
          {children}
        </div>
      </div>
    </AccountsStateProvider>
  );
}
