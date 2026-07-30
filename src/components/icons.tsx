// Brand icons ported from the National Select design.

type PlusMarkProps = {
  /** Fill of the cross body. */
  cross?: string;
  /** Stroke of the check mark. */
  check?: string;
  className?: string;
  style?: React.CSSProperties;
};

/** The medical "+" cross with an inset check — the site's core motif. */
export function PlusMark({
  cross = "#E8342B",
  check = "#FCEEED",
  className,
  style,
}: PlusMarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M9.5 1h5a2 2 0 0 1 2 2v5.5H22a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5.5V23h-9v-6.5H1a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h6.5V3a2 2 0 0 1 2-2Z"
        fill={cross}
      />
      <path
        d="M7 12.6 10.6 16.2 17 9.4"
        fill="none"
        stroke={check}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The large decorative outline plus used as a watermark. */
export function PlusOutline({
  fill = "#F2F5FA",
  className,
  style,
}: {
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path
        d="M40 4h26a8 8 0 0 1 8 8v22h22a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H74v22a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V76H10a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8h22V12a8 8 0 0 1 8-8Z"
        fill={fill}
      />
    </svg>
  );
}
