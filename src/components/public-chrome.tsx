"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Shows the public site header and footer everywhere except the staff area. */
export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/staff" || pathname.startsWith("/staff/")) return null;
  return children;
}
