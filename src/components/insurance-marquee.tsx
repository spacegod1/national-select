"use client";

import { useCallback, useRef, useState } from "react";
import { INSURER_LOGOS } from "@/lib/site-data";

export function InsuranceMarquee() {
  const [active, setActive] = useState<string | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activate = useCallback((name: string) => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    setActive(name);
  }, []);

  const deactivate = useCallback(() => {
    setActive(null);
  }, []);

  const onTouch = useCallback(
    (name: string) => {
      activate(name);
      if (touchTimer.current) clearTimeout(touchTimer.current);
      touchTimer.current = setTimeout(() => setActive(null), 1400);
    },
    [activate],
  );

  // Duplicate the strip so the CSS marquee can loop seamlessly.
  const strip = [...INSURER_LOGOS, ...INSURER_LOGOS];

  return (
    <div className="insurer-marquee" data-reveal>
      <div className="insurer-marquee-track">
        {strip.map((logo, i) => (
          <button
            key={`${logo.name}-${i}`}
            type="button"
            className={`insurer-logo${active === logo.name ? " is-color" : ""}`}
            aria-label={logo.name}
            onMouseEnter={() => activate(logo.name)}
            onMouseLeave={deactivate}
            onFocus={() => activate(logo.name)}
            onBlur={deactivate}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") onTouch(logo.name);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt=""
              width={logo.width}
              height={48}
              draggable={false}
              className="insurer-logo-img"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
