"use client";

import { BenchPortal } from "./bench";
import { LedgerPortal } from "./ledger";

/**
 * The chosen direction: Ledger on phones, Bench on tablets and larger screens.
 * Both are mounted and the window's width decides which one shows, so nothing
 * flashes while the page loads. Each keeps its own made-up data.
 */
export function StaffPortal() {
  return (
    <>
      <div className="h-full md:hidden">
        <LedgerPortal />
      </div>
      <div className="hidden h-full md:block">
        <BenchPortal />
      </div>
    </>
  );
}
