"use client";

import { useEffect, useState } from "react";
import { PlusMark, PlusOutline } from "@/components/icons";
import { HOURS, activeHourIndex, getStatus, type ClinicStatus } from "@/lib/site-data";

function useLive() {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Small "● Open now until 8pm" inline status line. */
export function StatusInline({ status }: { status?: ClinicStatus }) {
  const now = useLive();
  const s = status ?? getStatus(now);
  return (
    <span className="flex items-center gap-2 font-semibold" suppressHydrationWarning>
      <span
        className="h-2 w-2 rounded-full [animation:nsuc-pulse_2.4s_ease-in-out_infinite]"
        style={{ background: s.isOpen ? "var(--color-open)" : "var(--color-closed)" }}
      />
      {s.line}
    </span>
  );
}

/** Hero status strip: open state · typical wait · no appointment needed. */
export function HeroStatusStrip() {
  const now = useLive();
  const s = getStatus(now);
  const wait = 12 + (now.getDate() % 9);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 rounded-[14px] border border-line bg-white px-[18px] py-3.5 text-[14.5px]">
      <StatusInline status={s} />
      <span className="h-4 w-px bg-line" />
      <span className="text-muted" suppressHydrationWarning>
        {s.isOpen ? "Typical wait right now:" : "Typical wait once we open:"}{" "}
        <strong className="text-ink">{wait} min</strong>
      </span>
      <span className="h-4 w-px bg-line" />
      <span className="text-muted">No appointment needed</span>
    </div>
  );
}

/** The navy "Today at the clinic" hero card. */
export function TodayCard() {
  const now = useLive();
  const s = getStatus(now);
  const wait = 12 + (now.getDate() % 9);
  const queue = s.isOpen ? String(Math.max(1, Math.round(wait / 6))) : "None";
  const queueLabel = s.isOpen ? "People ahead of you" : "Waiting when we open";

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-ink p-[clamp(26px,3.4vw,40px)] text-cloud">
      <div className="absolute -right-[70px] -top-[70px] h-[260px] w-[260px] rounded-full bg-[#e8342b]/15" />
      <div className="absolute -bottom-[90px] -left-[50px] h-[200px] w-[200px] rounded-full border-[1.5px] border-cloud/20" />
      <PlusOutline
        fill="#F2F5FA"
        className="absolute bottom-5 right-[26px] h-[150px] w-[150px] opacity-[.13]"
      />

      <div className="relative mb-[18px] font-mono text-[12.5px] uppercase tracking-[.09em] opacity-65">
        Today at the clinic
      </div>
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 rounded-[16px] bg-mist px-5 py-[18px] text-ink">
          <div>
            <div className="mb-0.5 text-[13px] text-muted" suppressHydrationWarning>
              {s.cardLabel}
            </div>
            <div className="font-display text-[26px] font-extrabold tracking-[-.02em]" suppressHydrationWarning>
              {s.cardTime}
            </div>
          </div>
          <div className="text-right">
            <div className="mb-0.5 text-[13px] text-muted" suppressHydrationWarning>
              {queueLabel}
            </div>
            <div
              className="font-display text-[26px] font-extrabold tracking-[-.02em] text-[#e8342b]"
              suppressHydrationWarning
            >
              {queue}
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-cloud/15 bg-cloud/[.09] px-5 py-4">
          <div className="mb-2 text-[13px] opacity-70">On site today</div>
          <div className="flex flex-wrap gap-2">
            {["Digital X-ray", "Rapid labs", "Stitches", "Physicals"].map((t) => (
              <span key={t} className="rounded-full bg-cloud/15 px-3 py-1.5 text-[13.5px]">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-[16px] bg-[#e8342b]/90 px-5 py-4">
          <PlusMark cross="#fff" check="#E8342B" className="h-[22px] w-[22px] flex-none" />
          <div className="text-[15px] font-medium leading-[1.4]">
            Most patients are seen, treated and back home within an hour.
          </div>
        </div>
      </div>
    </div>
  );
}

/** Today's opening span, e.g. "8am – 8pm" — recomputed live. */
export function TodayHours() {
  const now = useLive();
  return <span suppressHydrationWarning>{getStatus(now).today}</span>;
}

/** Hours rows with today's row emphasised. Used on Home and Contact. */
export function HoursTable({ note = false }: { note?: boolean }) {
  const now = useLive();
  const active = activeHourIndex(now);
  return (
    <>
      {HOURS.map((h, i) => {
        const on = i === active;
        return (
          <div
            key={h.day}
            className="flex justify-between gap-4 border-b border-line-soft py-[13px] text-[16px]"
            suppressHydrationWarning
          >
            <span style={{ fontWeight: on ? 600 : 400, color: on ? "#1b2a4a" : "#4a5a78" }}>
              {h.day}
            </span>
            <span
              className="font-mono text-[15px]"
              style={{ fontWeight: on ? 600 : 400, color: on ? "#1b2a4a" : "#4a5a78" }}
            >
              {h.time}
            </span>
          </div>
        );
      })}
      {note && (
        <div className="py-4 text-[14.5px] leading-[1.5] text-muted">
          Last check-in is 30 minutes before closing. Closed Thanksgiving and Christmas Day.
        </div>
      )}
    </>
  );
}
