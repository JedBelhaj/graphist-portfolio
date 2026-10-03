import type { ReactNode } from "react";
import Timecode from "./Timecode";

/* Full class names, not built from the prop, so Tailwind's scanner sees them. */
const CORNER_COLOR = {
  white: "border-white",
  ink: "border-ink",
  brand: "border-brand",
} as const;

/* Four L-shaped corner marks, the way a camera frames its active area. */
function Corners({ color }: { color: keyof typeof CORNER_COLOR }) {
  const base = `pointer-events-none absolute h-5 w-5 ${CORNER_COLOR[color]} lg:h-7 lg:w-7`;
  return (
    <div aria-hidden="true">
      <span className={`${base} left-3 top-3 border-l-2 border-t-2`} />
      <span className={`${base} right-3 top-3 border-r-2 border-t-2`} />
      <span className={`${base} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${base} bottom-3 right-3 border-b-2 border-r-2`} />
    </div>
  );
}

/* Wraps media in a camera viewfinder. The corners always show; `hud` adds the
   rest of the screen — rule-of-thirds lines, a blinking REC light with a
   running timecode, and the capture settings along the bottom. Keep the HUD
   for the one or two images that should feel live (the hero); the corners
   alone are enough everywhere else.

   The children are the picture; size the frame from outside. */
export default function Viewfinder({
  children,
  hud = false,
  specs = ["4K", "24 FPS", "ISO 800", "1/50"],
  corners = "white",
  className = "",
}: {
  children: ReactNode;
  hud?: boolean;
  specs?: string[];
  /* Tailwind border colour name for the corner marks. */
  corners?: keyof typeof CORNER_COLOR;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}

      {hud && (
        <div className="readout pointer-events-none absolute inset-0 text-white" aria-hidden="true">
          {/* Thirds */}
          <span className="absolute inset-y-0 left-1/3 w-px bg-white/15" />
          <span className="absolute inset-y-0 left-2/3 w-px bg-white/15" />
          <span className="absolute inset-x-0 top-1/3 h-px bg-white/15" />
          <span className="absolute inset-x-0 top-2/3 h-px bg-white/15" />

          <div className="absolute left-6 top-6 flex items-center gap-2 lg:left-9 lg:top-9">
            <span className="rec-blink h-2.5 w-2.5 rounded-full bg-[rgb(255,59,48)]" />
            <span>REC</span>
            <Timecode className="ml-2 text-white/80" />
          </div>
          <div className="absolute right-6 top-6 flex items-center gap-1.5 lg:right-9 lg:top-9">
            {/* Battery */}
            <span className="relative h-2.5 w-5 border border-white/80 after:absolute after:-right-[3px] after:top-[2px] after:h-1 after:w-[2px] after:bg-white/80">
              <span className="absolute inset-[1px] right-[6px] bg-white/80" />
            </span>
          </div>
          <div className="absolute inset-x-6 bottom-6 flex justify-between text-white/80 lg:inset-x-9 lg:bottom-9">
            {specs.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <Corners color={corners} />
    </div>
  );
}
