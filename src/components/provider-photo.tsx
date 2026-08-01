import Image from "next/image";

type Props = {
  name: string;
  initials: string;
  /** Path under /public, e.g. `/providers/okafor.jpg`. Omit until the file exists. */
  photo?: string;
  ink?: string;
  size?: "card" | "hero";
  className?: string;
};

const SIZES = {
  card: {
    box: "h-[72px] w-[72px] rounded-[14px]",
    initials: "text-[22px]",
    px: 72,
  },
  hero: {
    box: "h-[110px] w-[110px] rounded-[26px]",
    initials: "text-[38px]",
    px: 110,
  },
} as const;

/**
 * Reserved headshot frame for clinicians.
 * Drop files into `public/providers/{id}.jpg` and set `photo` on the provider
 * record — the image will render here automatically; initials show until then.
 */
export function ProviderPhoto({
  name,
  initials,
  photo,
  ink = "#1B2A4A",
  size = "card",
  className = "",
}: Props) {
  const s = SIZES[size];

  return (
    <span
      className={`relative grid flex-none place-items-center overflow-hidden bg-white font-display font-extrabold tracking-[-.02em] shadow-[0_1px_0_rgba(27,42,74,.04)] ${s.box} ${s.initials} ${className}`}
      style={{ color: ink }}
      aria-hidden={!!photo}
    >
      {photo ? (
        <Image
          src={photo}
          alt={`Portrait of ${name}`}
          width={s.px}
          height={s.px}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          {/* Soft photo-frame cue so the slot reads as an image area, not a badge */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f7f9fc] to-[#e8eef6]" />
          <span className="relative z-[1]">{initials}</span>
        </>
      )}
    </span>
  );
}
