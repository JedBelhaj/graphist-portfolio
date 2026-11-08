/* The Soltani Studios wordmark: one line, type only.

   SOLTANI in the display face (bold), STUDIOS in the body face (light), both
   at the same cap height, so the contrast in weight is the only ornament.

   Drawn as inline SVG text: it uses the site's own fonts, stays sharp at any
   size and takes its colour from the parent. Sizes and widths are measured
   from the fonts (cap height 69 at the display size), so nothing is
   stretched; the viewBox leaves 2 units for the round letters' overshoot.

   `tone="light"` sets it in white. Size it with a height class. */

export default function Logo({
  tone = "ink",
  className = "",
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const color = tone === "light" ? "text-white" : "text-[rgb(10,11,16)]";

  return (
    <svg
      viewBox="0 -2 894 73"
      role="img"
      aria-label="Soltani Studios"
      fill="currentColor"
      className={`block w-auto shrink-0 select-none ${color} ${className}`}
    >
      <text
        x="0"
        y="69"
        fontSize="100"
        fontWeight="700"
        textLength="424"
        style={{ fontFamily: "Vastagogrotesk, Arial, sans-serif" }}
      >
        SOLTANI
      </text>
      <text
        x="454"
        y="69"
        fontSize="99"
        fontWeight="300"
        textLength="440"
        lengthAdjust="spacing"
        style={{ fontFamily: '"Acumin Variable Concept", Arial, sans-serif' }}
      >
        STUDIOS
      </text>
    </svg>
  );
}
