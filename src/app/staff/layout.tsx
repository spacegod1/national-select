import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/staff-toast";

export const metadata: Metadata = {
  title: "Staff — National Select Urgent Care",
  robots: { index: false, follow: false },
};

// Toasts live here, above every staff page, so one raised as a page changes is still there on the next.
export default function StaffRootLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
