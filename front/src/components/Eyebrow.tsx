import type { ReactNode } from "react";
import PlayMark from "./PlayMark";

/* The small label over a section: a red play mark, an optional scene number,
   then the name — "▶ 02 / Results". Reads like a slate or a camera readout
   rather than a marketing kicker. */
export default function Eyebrow({
  index,
  children,
  dark = false,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <p className={`readout flex items-center gap-2 ${dark ? "text-white/70" : "text-muted"} ${className}`}>
      <PlayMark className="text-[10px] text-brand" />
      {index && (
        <>
          <span className={dark ? "text-white" : "text-ink"}>{index}</span>
          <span aria-hidden="true">/</span>
        </>
      )}
      <span>{children}</span>
    </p>
  );
}
