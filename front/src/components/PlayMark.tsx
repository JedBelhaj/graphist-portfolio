/* The play triangle from the logo (the O in SOLTANI and the A in MEDIA), with
   the same softened corners. Used as the bullet, the button glyph and the
   ticker separator — the one shape that ties the site back to the mark.

   Sized with font-size by default (1em square), so it tracks the text it
   sits in; pass a width class to size it on its own. */
export default function PlayMark({
  className = "",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`inline-block h-[1em] w-[1em] shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M5.2 2.6c0-1.2 1.3-1.9 2.3-1.3l10.6 7.4c.9.6.9 2 0 2.6L7.5 18.7c-1 .6-2.3-.1-2.3-1.3V2.6Z"
        fill={color}
      />
    </svg>
  );
}
