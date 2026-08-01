import { Suspense, type ReactNode } from "react";

export default function InsurancePrototypeLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-mist" />}>{children}</Suspense>;
}
