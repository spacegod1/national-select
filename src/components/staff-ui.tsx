import Image from "next/image";
import type { ReactNode } from "react";

/*
 * The look of the staff area, shared by its pages and forms.
 *
 * Tablets and larger screens get a workbench: a navy rail, boxed cards and
 * compact type. Phones get a ledger: rules and type rather than boxes. Most
 * pieces here are one element that changes at the `md` breakpoint, so a form
 * is only ever on the page once.
 */

/** The page's side padding, and a way for a band of colour to run through it to both edges on a phone. */
export const gutter = "px-[clamp(16px,4vw,40px)] md:px-[clamp(16px,2.4vw,28px)]";
export const bleed = "max-md:-mx-[clamp(16px,4vw,40px)]";

/** A link that looks like its surroundings rather than like a red text link. */
export const plainLink = "no-underline hover:no-underline";

export const skin = {
  card: "border-line max-md:border-y max-md:py-5 md:rounded-[12px] md:border md:bg-white md:p-[clamp(14px,2vw,20px)]",
  heading:
    "max-md:font-mono max-md:text-[12px] max-md:font-medium max-md:uppercase max-md:tracking-[.1em] max-md:text-muted md:text-[15px] md:font-semibold",
  /** A `<label>` that stacks its text above its field. */
  label:
    "flex flex-col gap-1 text-muted max-md:font-mono max-md:text-[11.5px] max-md:uppercase max-md:tracking-[.08em] md:text-[12.5px] md:font-semibold",
  input:
    "w-full border-field font-sans font-normal normal-case tracking-normal text-ink max-md:rounded-none max-md:border-0 max-md:border-b-[1.5px] max-md:bg-transparent max-md:px-0 max-md:py-2 max-md:text-[16px] md:rounded-[8px] md:border md:bg-white md:px-2.5 md:py-2 md:text-[14.5px]",
  primary:
    "staff-entry-press bg-ink py-2 font-semibold text-white no-underline hover:no-underline disabled:opacity-70 max-md:rounded-full max-md:border-[1.5px] max-md:border-ink max-md:px-4 max-md:text-[14.5px] max-md:hover:bg-white max-md:hover:text-ink md:rounded-[8px] md:px-3.5 md:text-[14px] md:hover:bg-[#26375e] md:hover:text-white",
  /** A button or link that matters less than the primary one beside it. */
  secondary:
    "staff-entry-press inline-flex items-center gap-1.5 border font-semibold text-ink no-underline hover:text-ink hover:no-underline max-md:rounded-full max-md:border-[1.5px] max-md:border-ink max-md:px-4 max-md:py-2 max-md:text-[14.5px] md:rounded-[8px] md:border-line md:bg-white md:px-3 md:py-2 md:text-[13.5px] md:hover:border-field",
  /** A text-only button or link, with a tap area larger than its text. */
  quiet:
    "relative font-semibold after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-[''] hover:text-brand-dark max-md:text-[14px] max-md:text-ink max-md:underline max-md:decoration-brand max-md:decoration-2 max-md:underline-offset-4 md:text-[13.5px] md:text-brand md:no-underline md:hover:no-underline",
  /** The box around a list of rows. */
  list: "max-md:border-t max-md:border-ink md:overflow-hidden md:rounded-[12px] md:border md:border-line md:bg-white",
  row: "border-b max-md:border-line max-md:py-3.5 md:border-line-soft md:px-3.5 md:py-2.5 md:last:border-0",
  meta: "text-muted max-md:text-[13.5px] md:text-[12.5px]",
  code: "font-mono max-md:text-[13.5px] md:text-[12.5px]",
  /** A message that something couldn't be loaded. */
  alert: "rounded-[12px] border border-pink-line bg-pink p-4 text-pink-ink",
} as const;

const ICONS = {
  accounts:
    "M3 6.5A1.5 1.5 0 014.5 5h3.2l1.6 1.8h6.2A1.5 1.5 0 0117 8.3v6.2a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5z",
  plus: "M10 4v12M4 10h12",
  users:
    "M7.5 9a2.75 2.75 0 100-5.5A2.75 2.75 0 007.5 9zM2.5 16.5c0-2.6 2.2-4.5 5-4.5s5 1.9 5 4.5M13.5 9.2a2.4 2.4 0 000-4.7M14.8 12.3c1.7.5 2.7 2 2.7 4.2",
  activity: "M2.5 10h3.2l2-5.5 4 11 2-5.5h3.8",
  search: "M9 15A6 6 0 109 3a6 6 0 000 12zM13.5 13.5L17 17",
  out: "M8 4H5.5A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8M12.5 6.5L16 10l-3.5 3.5M16 10H8",
  lock: "M5.5 9h9v7.5h-9zM7.5 9V6.5a2.5 2.5 0 015 0V9",
  card: "M3 5.5h14v9H3zM3 8.75h14",
  receipt: "M6 3.5h8v13l-2-1.3-2 1.3-2-1.3-2 1.3zM8.3 7.5h3.4M8.3 10.5h3.4",
  phone:
    "M6.2 3.5h2l1 3.2-1.6 1.1a8.2 8.2 0 004.6 4.6l1.1-1.6 3.2 1v2a1.6 1.6 0 01-1.7 1.6A12.3 12.3 0 014.6 5.2 1.6 1.6 0 016.2 3.5z",
  mail: "M3 5.5h14v9H3zM3.5 6l6.5 5 6.5-5",
  calendar: "M4 5.5h12v10.5H4zM4 8.8h12M7 3.5v3M13 3.5v3",
  check: "M4.5 10.5l3.5 3.5 7.5-8",
  down: "M5.5 8l4.5 4.5L14.5 8",
  chart: "M3.5 16.5h13M6 13.5v-3.5M10 13.5v-8M14 13.5V8",
  download: "M10 3.5v9M6.5 9.5L10 13l3.5-3.5M4 16.5h12",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`flex-none ${className}`}>
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const AVATAR_TINTS = [
  "bg-panel text-ink",
  "bg-pink text-pink-ink",
  "bg-[#e2f1e7] text-[#22693a]",
  "bg-[#fbf0dc] text-[#7a5310]",
  "bg-slate-chip text-ink",
];

/** Initials on a soft tint. The same name always gets the same tint. */
export function Avatar({ name, className = "h-9 w-9 text-[12.5px]" }: { name: string; className?: string }) {
  const sum = [...name].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center rounded-full font-bold ${AVATAR_TINTS[sum % AVATAR_TINTS.length]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

const CHIP_TONES = {
  due: "bg-pink text-pink-ink",
  ok: "bg-open/15 text-[#22693a]",
  off: "bg-line-soft text-muted",
  info: "bg-panel text-ink",
} as const;

export function Chip({ tone, children }: { tone: keyof typeof CHIP_TONES; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12.5px] font-semibold ${CHIP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** How a charge's status is worded and coloured, as a chip and as plain text. */
export const CHARGE_STATUS = {
  unpaid: { label: "Unpaid", chip: "due", ink: "text-brand-dark" },
  paid: { label: "Paid", chip: "ok", ink: "text-[#22693a]" },
  void: { label: "Void", chip: "off", ink: "text-muted" },
} as const;

/** A figure with a label above it and a note below, beside a tinted icon. */
export function Stat({
  icon,
  tint,
  label,
  value,
  note,
}: {
  icon: IconName;
  tint: string;
  label: string;
  value: ReactNode;
  note: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3.5 shadow-[0_14px_28px_-22px_rgba(27,42,74,.55)]">
      <span className={`grid h-10 w-10 flex-none place-items-center rounded-[11px] ${tint}`}>
        <Icon name={icon} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-muted">{label}</span>
        <span className="block font-display text-[21px] font-extrabold leading-[1.15] tracking-[-.02em] tabular-nums">
          {value}
        </span>
        <span className="block text-[12px] text-muted">{note}</span>
      </span>
    </div>
  );
}

/**
 * A link that downloads an Excel file. A plain `<a>`, not a `<Link>`: the
 * address answers with a file, not a page. It has no `download` attribute, so
 * that when there is no file to send (the session ended, or the dates were
 * bad) the browser shows the reason rather than saving it as a file.
 */
export function DownloadLink({
  href,
  children,
  className = skin.secondary,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={className}>
      <Icon name="download" className="h-4 w-4" />
      {children}
    </a>
  );
}

/* Photos the site already has, and where to crop each one when it sits in a
   wide band behind a heading. The front desk photo is cropped below the sign
   on its back wall. */
export type Art = { src: string; position: string; eyebrow: string };

export const ART = {
  home: { src: "/clinic_front_desk.png", position: "50% 70%", eyebrow: "Front desk" },
  new: { src: "/clinician_consultation.png", position: "50% 36%", eyebrow: "Front desk" },
  users: { src: "/doctors-meeting.jpg", position: "50% 32%", eyebrow: "Team" },
  activity: { src: "/doctor-writing-notes.jpg", position: "50% 55%", eyebrow: "Audit log" },
  reports: { src: "/stethoscope_desk.png", position: "50% 66%", eyebrow: "Billing" },
} satisfies Record<string, Art>;

/**
 * A decorative photo that fills its positioned parent. Pass `position`, or crop
 * with a class. Leave `eager` off for a photo that only one screen size shows,
 * so the other sizes don't download it.
 */
export function Photo({
  src,
  sizes,
  position,
  eager = false,
  className = "",
}: {
  src: string;
  sizes: string;
  position?: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className={`object-cover ${className}`}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}

/**
 * The band at the top of New patient, Users and Activity. On a phone the photo
 * runs edge to edge under the title; on larger screens it shows through the
 * right of a navy card.
 */
export function PageHead({ art, title, lead }: { art: Art; title: string; lead: string }) {
  return (
    <div className={`relative isolate overflow-hidden bg-ink text-white md:rounded-[16px] ${bleed}`}>
      <div className="absolute inset-0 -z-20 md:left-auto md:w-[64%]">
        <Photo src={art.src} position={art.position} sizes="(min-width: 768px) 600px, 100vw" eager />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(27,42,74,.5)_0%,rgba(27,42,74,.9)_62%,rgba(27,42,74,.96)_100%)] md:bg-[linear-gradient(90deg,#1b2a4a_36%,rgba(27,42,74,.8)_60%,rgba(27,42,74,.28)_100%)]"
      />
      <div className="px-[clamp(16px,4vw,40px)] pb-5 pt-16 md:px-[clamp(18px,2.6vw,28px)] md:py-[clamp(20px,2.8vw,30px)]">
        <div className="font-mono text-[11.5px] uppercase tracking-[.12em] text-coral">{art.eyebrow}</div>
        <h1 className="mt-2 font-display text-[30px] font-extrabold leading-[1.04] tracking-[-.035em] md:text-[clamp(24px,2.8vw,32px)] md:leading-[1.08] md:tracking-[-.03em]">
          {title}
        </h1>
        <p className="mt-2 text-[15px] leading-[1.5] text-cloud md:max-w-[430px] md:text-[14.5px]">{lead}</p>
      </div>
    </div>
  );
}

/** A whole page that only says something couldn't be loaded. */
export function StaffAlertPage({ children }: { children: ReactNode }) {
  return (
    <main className={`py-6 md:min-h-0 md:flex-1 md:bg-mist ${gutter}`}>
      <p role="alert" className={`${skin.alert} max-w-[640px]`}>
        {children}
      </p>
    </main>
  );
}

/** The frame around New patient, Users and Activity. On larger screens it is the pane that scrolls. */
export function StaffPage({ children }: { children: ReactNode }) {
  return (
    <main className="md:min-h-0 md:flex-1 md:overflow-y-auto md:bg-mist">
      <div className={`staff-entry-rise mx-auto max-w-[940px] pb-12 md:pb-10 md:pt-[clamp(16px,2.4vw,28px)] ${gutter}`}>
        {children}
      </div>
    </main>
  );
}
