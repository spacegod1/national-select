import type { ReactNode } from "react";

/** Centered 1240px content column with the site's fluid gutters. */
export function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag className={`mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] ${className}`}>
      {children}
    </Tag>
  );
}

/** Mono, upper-case section label. `tone` picks the accent for light vs navy. */
export function Eyebrow({
  children,
  tone = "red",
  className = "",
}: {
  children: ReactNode;
  tone?: "red" | "coral";
  className?: string;
}) {
  return (
    <div
      className={`mb-3.5 font-mono text-[12.5px] uppercase tracking-[.11em] ${
        tone === "coral" ? "text-coral" : "text-[#e8342b]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** The tinted page header used by interior pages (eyebrow + h1 + lede). */
export function PageHero({
  eyebrow,
  title,
  lede,
  titleMax = "15em",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  titleMax?: string;
}) {
  return (
    <section className="border-b border-[#E1E8F2] bg-panel">
      <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,76px)]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1
          className="mb-[18px] font-display text-[clamp(36px,5.4vw,62px)] font-extrabold leading-[1.03] tracking-[-.032em] text-balance"
          style={{ maxWidth: titleMax }}
        >
          {title}
        </h1>
        {lede && (
          <p className="max-w-[38em] text-[18.5px] leading-[1.55] text-muted text-pretty">{lede}</p>
        )}
      </div>
    </section>
  );
}
