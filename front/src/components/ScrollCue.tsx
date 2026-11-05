"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ACCENT } from "@/lib/brand";

/* A small "there's more below" pill, only while the page sits at the very top.
   It lives in the layout, so it survives navigation: the pathname re-checks it
   on each new page. Decorative, so it stays out of the way of clicks and screen
   readers. */
export default function ScrollCue() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () =>
      setShow(window.scrollY <= 8 && document.documentElement.scrollHeight > window.innerHeight + 8);

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
      <div
        className={`scroll-cue relative h-9 w-[22px] overflow-hidden rounded-full shadow-[0_8px_24px_rgba(124,92,252,0.45)] ring-1 ring-white/60 ${
          show ? "" : "is-hidden"
        }`}
        style={{ backgroundColor: ACCENT }}
      >
        <span className="scroll-cue-dot absolute bottom-1.5 left-1/2 -ml-[3px] h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
}
