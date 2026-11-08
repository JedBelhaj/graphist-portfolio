/* The Oussama Soltani Studios mark: a type-only logo set in the display face.

   Drawn as inline SVG text rather than a picture, so it uses the site's own
   font, stays sharp at any size and takes its colour from the parent.
   `textLength` pins every line to a fixed width in the viewBox, so the lockup
   keeps its proportions whatever the font's natural metrics are.

   `wordmark` is the one-line lockup for small sizes (header, loader, marquee):
   OUSSAMA SOLTANI | STUDIOS. `full` stacks a thin rule and STUDIOS under the
   name, ending flush with it, for larger spots like the footer.

   `tone="light"` sets it in white. Size it with a height class. */

const NAME = "OUSSAMA SOLTANI";
const STUDIO = "STUDIOS";
const LABEL = "Oussama Soltani Studios";

export default function Logo({
  variant = "wordmark",
  tone = "ink",
  className = "",
}: {
  variant?: "full" | "wordmark";
  tone?: "ink" | "light";
  className?: string;
}) {
  const color = tone === "light" ? "text-white" : "text-[rgb(10,11,16)]";
  const common = {
    role: "img" as const,
    "aria-label": LABEL,
    fill: "currentColor",
    className: `block w-auto shrink-0 select-none ${color} ${className}`,
    style: { fontFamily: "Vastagogrotesk, Arial, sans-serif" },
  };

  if (variant === "full") {
    return (
      <svg viewBox="0 0 900 124" {...common}>
        <text x="0" y="72" fontSize="100" fontWeight="700" textLength="900" lengthAdjust="spacingAndGlyphs">
          {NAME}
        </text>
        <rect x="2" y="104" width="520" height="4" />
        <text x="900" y="122" fontSize="40" fontWeight="400" textAnchor="end" textLength="330" lengthAdjust="spacing">
          {STUDIO}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1250 72" {...common}>
      <text x="0" y="72" fontSize="100" fontWeight="700" textLength="900" lengthAdjust="spacingAndGlyphs">
        {NAME}
      </text>
      <rect x="944" y="6" width="5" height="62" />
      <text x="992" y="58" fontSize="46" fontWeight="400" textLength="258" lengthAdjust="spacing">
        {STUDIO}
      </text>
    </svg>
  );
}
