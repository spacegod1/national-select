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
import "./insurance.css";
import { LedgerInsurance } from "./variants/ledger";
import { GalleryInsurance } from "./variants/gallery";
import { ForkInsurance } from "./variants/fork";

const VARIANTS: { name: string; render: () => ReactNode }[] = [
  { name: "Ledger", render: () => <LedgerInsurance /> },
  { name: "Gallery", render: () => <GalleryInsurance /> },
  { name: "Fork", render: () => <ForkInsurance /> },
];

export default function InsurancePrototypePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [pathname, router],
  );

  const remount = useCallback(() => {
    setMountKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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
  }, [current, remount, setActive]);

  return (
    <>
      <div key={mountKey}>{VARIANTS[current].render()}</div>

      <nav
        className="proto-picker"
        aria-label="Prototype variants"
        data-position="top"
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
