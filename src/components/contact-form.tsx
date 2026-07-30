"use client";

import { useState } from "react";
import { PlusMark } from "@/components/icons";

const field =
  "rounded-[11px] border-[1.5px] border-field bg-mist px-3.5 py-[13px] text-[16px] font-normal";
const label = "flex flex-col gap-[7px] text-[14.5px] font-semibold";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="px-2.5 py-[30px] text-center">
        <PlusMark cross="#E8342B" check="#fff" className="mx-auto mb-4 h-11 w-11" />
        <h2 className="mb-2.5 font-display text-[24px] font-bold tracking-[-.02em]">
          Thanks — we&apos;ve got your message.
        </h2>
        <p className="mb-5 text-[16.5px] leading-[1.6] text-muted">
          Someone from the front desk will reply within one business day. If it&apos;s urgent, please
          call us instead.
        </p>
        <button
          onClick={() => setSent(false)}
          className="font-semibold text-[#e8342b] hover:text-[#b4231c]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <h2 className="mb-2 font-display text-[24px] font-bold tracking-[-.02em]">Send us a message</h2>
      <p className="mb-[22px] text-[15.5px] leading-[1.55] text-muted">
        For non-urgent questions about billing, records or a past visit. Please don&apos;t include
        medical details you&apos;d rather keep private.
      </p>
      <div className="flex flex-col gap-4">
        <label className={label}>
          Your name
          <input type="text" name="name" required className={field} />
        </label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          <label className={label}>
            Email
            <input type="email" name="email" required className={field} />
          </label>
          <label className={label}>
            Phone
            <input type="tel" name="phone" className={field} />
          </label>
        </div>
        <label className={label}>
          What&apos;s this about?
          <select name="topic" className={field}>
            <option>A bill or payment</option>
            <option>Medical records</option>
            <option>A past visit</option>
            <option>Insurance question</option>
            <option>Something else</option>
          </select>
        </label>
        <label className={label}>
          Message
          <textarea name="message" rows={5} required className={`${field} resize-y`} />
        </label>
        <button
          type="submit"
          className="rounded-[12px] bg-[#e8342b] p-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#ce291f]"
        >
          Send message
        </button>
        <p className="text-[13.5px] leading-[1.5] text-muted">
          This form isn&apos;t monitored after hours and isn&apos;t for medical emergencies. Call 911
          if you need emergency help.
        </p>
      </div>
    </form>
  );
}
