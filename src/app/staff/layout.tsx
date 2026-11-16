import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Staff — National Select Urgent Care",
  robots: { index: false, follow: false },
};

export default function StaffRootLayout({ children }: { children: ReactNode }) {
  return children;
}
