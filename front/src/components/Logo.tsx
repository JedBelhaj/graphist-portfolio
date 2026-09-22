import { FONT_DISPLAY } from "@/lib/brand";

/* Typographic wordmark. Rendered inline rather than as an <img> so it picks up
   the display face and can be recoloured per surface. */
export default function Logo({
  className = "",
  color = "rgb(10,11,16)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span className={`block leading-none ${className}`} style={{ color }}>
      <span
        className="block text-[26px] font-black tracking-[-0.03em] lg:text-[30px]"
        style={{ fontFamily: FONT_DISPLAY }}
      >
        SOLTANI
      </span>
      <span
        className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.2em] lg:text-[9px]"
        style={{ fontFamily: FONT_DISPLAY }}
      >
        Media &amp; Marketing
      </span>
    </span>
  );
}
