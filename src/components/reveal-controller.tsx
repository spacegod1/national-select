"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals [data-reveal] elements as they scroll into view, mirroring the
 * IntersectionObserver behaviour in the original design. Mounted once; it
 * re-scans on every route change so freshly-rendered pages animate in.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const raf = requestAnimationFrame(() => {
      document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
