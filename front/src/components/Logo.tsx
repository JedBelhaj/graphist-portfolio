/* The Oussama Soltani Studios mark: a type-only logo set in the display face.

   Drawn as inline SVG text rather than a picture, so it uses the site's own
   font, stays sharp at any size and takes its colour from the parent.
   `textLength` pins every line to a fixed width in the viewBox (set to the
   words' natural width in this font), so the lockup keeps its proportions.

   Heavy weights throughout (900 for the name, 700 for STUDIOS) so it holds
   its presence at the small sizes it's used at.

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
      <svg viewBox="0 0 940 124" {...common}>
        <text x="0" y="72" fontSize="100" fontWeight="900" textLength="940" lengthAdjust="spacingAndGlyphs">
          {NAME}
        </text>
        <rect x="2" y="103" width="540" height="6" />
        <text x="940" y="122" fontSize="40" fontWeight="700" textAnchor="end" textLength="340" lengthAdjust="spacing">
          {STUDIO}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1300 72" {...common}>
      <text x="0" y="72" fontSize="100" fontWeight="900" textLength="940" lengthAdjust="spacingAndGlyphs">
        {NAME}
      </text>
      <rect x="982" y="6" width="7" height="62" />
      <text x="1030" y="58" fontSize="46" fontWeight="700" textLength="270" lengthAdjust="spacing">
        {STUDIO}
      </text>
    </svg>
  );
}
