"use client";

import { useState } from "react";
import { FAQS } from "@/lib/site-data";

export function FaqList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-2">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q} className="overflow-hidden rounded-[14px] border border-line bg-white">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3.5 px-[18px] py-[17px] text-left text-[16.5px] font-semibold"
            >
              {f.q}
              <span className="flex-none text-[20px] leading-none text-[#e8342b]">
                {isOpen ? "–" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-[18px] pb-[18px] text-[16px] leading-[1.6] text-muted text-pretty">
                {f.a}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
