"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/clinic_front_desk.png",
    alt: "Clinic front desk",
    position: "object-[center_30%] sm:object-[center_38%] lg:object-center",
  },
  {
    src: "/clinician_consultation.png",
    alt: "Clinician consulting with a patient",
    position: "object-[center_40%] lg:object-center",
  },
  {
    src: "/xray_room.png",
    alt: "Clinic X-ray room",
    position: "object-center",
  },
  {
    src: "/doctor-writing-notes.jpg",
    alt: "Doctor reviewing notes",
    position: "object-[center_35%] lg:object-[center_45%]",
  },
  {
    src: "/doctors-meeting.jpg",
    alt: "Care team in discussion",
    position: "object-center",
  },
] as const;

const INTERVAL_MS = 5600;

export function HeroBackground() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let id: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      id = setInterval(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
      }, INTERVAL_MS);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (id) clearInterval(id);
        id = undefined;
      } else if (!id) {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (id) clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {SLIDES.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.src}
            className={`home-hero-slide${active ? " is-active" : ""}`}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={i === 0}
              className={`object-cover ${slide.position}`}
              sizes="100vw"
            />
          </div>
        );
      })}
      <p className="sr-only">{SLIDES[index].alt}</p>
    </div>
  );
}
