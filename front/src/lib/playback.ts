"use client";

/* Decides, for the gallery tiles near the screen, which ones load their
   preview loop and which ones play it.

   The two have separate budgets. Playing is what makes a page lag: every
   playing video is decoded on every frame, and a dozen at once made the page
   stutter, phones most of all. Loading only costs bandwidth and a little
   memory, so more tiles load than play. The tiles just above and below the
   screen fetch their few seconds ahead of time, and they're ready the moment
   they scroll into view.

   Both go to the tiles nearest the middle of the screen first, and only
   tiles on screen play. A loaded tile keeps its stream until it falls
   KEEP places past the budget, so tiles at the edge don't keep reconnecting
   while someone scrolls back and forth.

   While the Lightbox is open (holdGallery), nothing plays and nothing new
   loads, so the film has the connection to itself.

   Re-ranked on scroll and resize, once per frame at most, and only while
   some tile is near the screen. */
export type Slot = { load: boolean; play: boolean };
type Entry = { el: Element; set: (s: Slot) => void; slot: Slot };

const KEEP = 2;
const OFF: Slot = { load: false, play: false };

const entries = new Set<Entry>();
let raf = 0;
let listening = false;
let held = false;

type Nav = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  /* GB of RAM, rounded down. Only Chrome-based browsers report it. */
  deviceMemory?: number;
};

/* How many loops may load and play at once, by device:
   - data saver on, or a 2G-class connection: 1 playing, 2 loaded
   - phones and tablets: 2 playing, 6 loaded (1 and 3 with 2 GB of RAM or less);
     on phones the Videography tiles are sized so about two fit on screen
   - computers: 8 playing, 12 loaded (2 and 4 with 2 GB or less) */
function budget() {
  const nav = navigator as Nav;
  if (nav.connection?.saveData || /2g$/.test(nav.connection?.effectiveType ?? "")) return { play: 1, load: 2 };
  const low = (nav.deviceMemory ?? 8) <= 2;
  if (window.matchMedia("(hover: none)").matches) return low ? { play: 1, load: 3 } : { play: 2, load: 6 };
  if (low) return { play: 2, load: 4 };
  return { play: 8, load: 12 };
}

function rank() {
  raf = 0;
  const { play, load } = budget();
  const h = window.innerHeight;
  let playing = 0;
  [...entries]
    .map((e) => {
      const r = e.el.getBoundingClientRect();
      return { e, d: Math.abs(r.top + r.height / 2 - h / 2), visible: r.bottom > 0 && r.top < h };
    })
    .sort((a, b) => a.d - b.d)
    .forEach(({ e, visible }, i) => {
      const loaded = held ? e.slot.load : i < load || (e.slot.load && i < load + KEEP);
      const plays = !held && loaded && visible && playing < play;
      if (plays) playing++;
      /* Only tell the tile when something changed: this runs on every
         scroll frame, and each call re-renders the tile. */
      if (loaded !== e.slot.load || plays !== e.slot.play) {
        e.slot = { load: loaded, play: plays };
        e.set(e.slot);
      }
    });
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(rank);
}

/* Call while the tile is near the screen; `set` is told whether it may load
   and play. The returned function withdraws it (and tells it neither). */
export function requestSlot(el: Element, set: (s: Slot) => void) {
  const entry: Entry = { el, set, slot: OFF };
  entries.add(entry);
  if (!listening) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    listening = true;
  }
  schedule();

  return () => {
    entries.delete(entry);
    set(OFF);
    if (entries.size === 0 && listening) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      listening = false;
    }
    schedule();
  };
}

/* Pauses the gallery (on) or lets it carry on (off). */
export function holdGallery(on: boolean) {
  held = on;
  schedule();
}
