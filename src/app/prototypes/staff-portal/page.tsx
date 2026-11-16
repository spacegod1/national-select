"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "./picker.css";
import "./portal.css";
import { StaffPortal } from "./variants/portal";

/* The chosen direction is Bench on tablets and larger screens and Ledger on
   phones. "Portal" is that, at whatever size the window is. "Phone" shows the
   same thing at a phone's size, so the phone design can be judged on a
   computer. The Console and Desk designs are still in ./variants, unused. */
const VARIANTS: { name: string; render: () => ReactNode }[] = [
  { name: "Portal", render: () => <StaffPortal /> },
  { name: "Phone", render: () => <PhonePreview /> },
];

/** The same page inside a phone-sized frame. `frame=1` tells it to drop the picker. */
function PhonePreview() {
  const pathname = usePathname();
  return (
    <div className="grid h-full place-items-center overflow-auto bg-panel p-4 lg:pb-24">
      <div className="portal-rise h-[min(820px,100%)] w-[min(410px,100%)] overflow-hidden rounded-[42px] border-[10px] border-[#11141b] bg-white shadow-[0_34px_60px_-26px_rgba(27,42,74,.55)]">
        <iframe src={`${pathname}?frame=1`} title="The staff portal at a phone's size" className="block h-full w-full border-0" />
      </div>
    </div>
  );
}

export default function StaffPortalPrototypePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const framed = searchParams.get("frame") === "1";
  const initial = Math.min(
    Math.max((parseInt(searchParams.get("v") || "1", 10) || 1) - 1, 0),
    VARIANTS.length - 1,
  );

  const [current, setCurrent] = useState(initial);
  const [mountKey, setMountKey] = useState(0);
  const [ready, setReady] = useState(false);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveHighlight = useCallback(() => {
    const el = itemRefs.current[current];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [current]);

  const setActive = useCallback(
    (i: number) => {
      if (i < 0 || i >= VARIANTS.length) return;
      setCurrent(i);
      setMountKey((k) => k + 1);
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(i + 1));
      router.replace(`${pathname}?${url.searchParams.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const remount = useCallback(() => setMountKey((k) => k + 1), []);

  useLayoutEffect(() => {
    moveHighlight();
  }, [current, moveHighlight]);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  useEffect(() => {
    if (framed) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) setActive(num - 1);
      else if (e.key === "ArrowRight") setActive((current + 1) % VARIANTS.length);
      else if (e.key === "ArrowLeft")
        setActive((current - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === "r" || e.key === "R") remount();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, framed, remount, setActive]);

  if (framed) {
    return (
      <div className="portal-stage" data-frame="">
        <StaffPortal />
      </div>
    );
  }

  return (
    <>
      <div key={mountKey} className="portal-stage">
        {VARIANTS[current].render()}
      </div>
      <div className="portal-strip" aria-hidden="true" />

      <nav
        className="proto-picker"
        aria-label="Prototype variants"
        {...(ready ? { "data-ready": "" } : {})}
      >
        <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
        {VARIANTS.map((v, i) => (
          <button
            key={v.name}
            type="button"
            className="proto-picker-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-active={current === i ? "" : undefined}
            aria-current={current === i ? "true" : undefined}
            onClick={() => setActive(i)}
          >
            {v.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          type="button"
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={remount}
        >
          ↻
        </button>
      </nav>
    </>
  );
}
