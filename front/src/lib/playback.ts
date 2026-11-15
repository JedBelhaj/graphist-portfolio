"use client";

/* Decides which gallery loops play. Every tile on screen asks; only the few
   nearest the middle of the screen get to play (MAX: 4 on desktop, 2 on
   touch screens), and the rest keep their still. Decoding a dozen videos at
   once is what made the page stutter, on phones most of all.

   Re-ranked on scroll and resize, once per frame at most, and only while
   some tile is asking. */
type Entry = { el: Element; allow: (on: boolean) => void };

const entries = new Set<Entry>();
let raf = 0;
let listening = false;

const max = () => (window.matchMedia("(hover: none)").matches ? 2 : 4);

function rank() {
  raf = 0;
  const mid = window.innerHeight / 2;
  const limit = max();
  [...entries]
    .map((e) => {
      const r = e.el.getBoundingClientRect();
      return { e, d: Math.abs(r.top + r.height / 2 - mid) };
    })
    .sort((a, b) => a.d - b.d)
    .forEach(({ e }, i) => e.allow(i < limit));
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(rank);
}

/* Call while the tile is on screen; `allow` is told whether it may play.
   The returned function withdraws it (and tells it no). */
export function requestPlay(el: Element, allow: (on: boolean) => void) {
  const entry = { el, allow };
  entries.add(entry);
  if (!listening) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    listening = true;
  }
  schedule();

  return () => {
    entries.delete(entry);
    allow(false);
    if (entries.size === 0 && listening) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      listening = false;
    }
    schedule();
  };
}
