import { BRAND } from "@/lib/brand";
import { LOGO_FULL, LOGO_WORDMARK } from "@/lib/content";

/* The Soltani Media mark, from public/soltani_logo.png.

   The delivered file is black on a solid white canvas, so it can't sit on any
   other surface. The two files used here are cut from it with the white keyed
   out to transparency and the margins trimmed: `full` keeps the "Only the best
   results" tagline, `wordmark` drops it for small sizes where the tagline
   would blur into a grey line.

   The artwork is ink-coloured; `tone="light"` flips it to white with a filter
   rather than shipping a second file. Size it with a height class. */
export default function Logo({
  variant = "wordmark",
  tone = "ink",
  className = "",
}: {
  variant?: "full" | "wordmark";
  tone?: "ink" | "light";
  className?: string;
}) {
  return (
    <img
      src={variant === "full" ? LOGO_FULL : LOGO_WORDMARK}
      alt={BRAND.short}
      className={`block w-auto select-none ${tone === "light" ? "brightness-0 invert" : ""} ${className}`}
      draggable={false}
    />
  );
}
