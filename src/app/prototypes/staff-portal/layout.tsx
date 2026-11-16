import { Suspense, type ReactNode } from "react";

export default function StaffPortalPrototypeLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-mist" />}>{children}</Suspense>;
}
