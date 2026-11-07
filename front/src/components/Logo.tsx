import { useId } from "react";

/* The Soltani Studios identity.

   The mark is a geometric S, two stacked three-quarter rings, cut out of a
   rounded tile, so the page shows through it on any background. Beside it,
   SOLTANI in the display face's black weight over STUDIOS in the body face,
   tracked out to the same width, so the two lines read as one block.

   Drawn as inline SVG: it uses the site's own fonts, stays sharp at any size
   and takes its colour from the parent. Every `textLength` matches the
   word's natural width in that font (measured), so nothing is stretched.

   `full`: mark + stacked name. The main lockup (header, footer, loader).
   `wordmark`: SOLTANI STUDIOS on one line, no mark, for tiny spots where the
   stacked line would blur (the marquee separator).

   `tone="light"` sets it in white. Size it with a height class. */

const LABEL = "Soltani Studios";
const DISPLAY = "Vastagogrotesk, Arial, sans-serif";
const BODY = '"Acumin Variable Concept", Arial, sans-serif';

export default function Logo({
  variant = "full",
  tone = "ink",
  className = "",
}: {
  variant?: "full" | "wordmark";
  tone?: "ink" | "light";
  className?: string;
}) {
  const maskId = useId();
  const color = tone === "light" ? "text-white" : "text-[rgb(10,11,16)]";
  const common = {
    role: "img" as const,
    "aria-label": LABEL,
    fill: "currentColor",
    className: `block w-auto shrink-0 select-none ${color} ${className}`,
  };

  if (variant === "wordmark") {
    return (
      <svg viewBox="0 0 950 72" {...common}>
        <text x="0" y="72" fontSize="100" fontWeight="900" textLength="441" style={{ fontFamily: DISPLAY }}>
          SOLTANI
        </text>
        <text
          x="476"
          y="72"
          fontSize="104"
          fontWeight="400"
          textLength="474"
          lengthAdjust="spacing"
          style={{ fontFamily: BODY }}
        >
          STUDIOS
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 593 122" {...common}>
      <defs>
        <mask id={maskId}>
          <rect width="122" height="122" fill="#fff" />
          <path
            d="M80 42A19 19 0 1 0 61 61A19 19 0 1 1 42 80"
            fill="none"
            stroke="#000"
            strokeWidth="13"
          />
        </mask>
      </defs>
      <rect width="122" height="122" rx="28" mask={`url(#${maskId})`} />

      <text x="150" y="72" fontSize="100" fontWeight="900" textLength="441" style={{ fontFamily: DISPLAY }}>
        SOLTANI
      </text>
      <text
        x="152"
        y="122"
        fontSize="52"
        fontWeight="600"
        textLength="437"
        lengthAdjust="spacing"
        style={{ fontFamily: BODY }}
      >
        STUDIOS
      </text>
    </svg>
  );
}
