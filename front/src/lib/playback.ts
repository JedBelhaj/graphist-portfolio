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

   While someone scrolls fast, nothing new loads or starts playing either:
   every tile flying past the middle would otherwise connect, start
   decoding and be shut down a moment later, and that churn is what made a
   fast scroll stutter. Tiles already playing keep playing while they're on
   screen. SETTLE ms after the last fast scroll, the tiles on screen get
   their turn as usual.

   Re-ranked on scroll and resize, once per frame at most, and only while
   some tile is near the screen. */
export type Slot = { load: boolean; play: boolean };
type Entry = { el: Element; set: (s: Slot) => void; slot: Slot };

const KEEP = 2;
const OFF: Slot = { load: false, play: false };

/* Faster than this, in px per ms (about 30 px a frame at 60 Hz), is a fast
   scroll; SETTLE ms after the last one, it's over. */
const FAST = 2;
const SETTLE = 150;

const entries = new Set<Entry>();
let raf = 0;
let fast = false;
let settle = 0;
let lastY = 0;
let lastT = 0;
let listening = false;
let held = false;

type Nav = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  /* GB of RAM, rounded down. Only Chrome-based browsers report it. */
  deviceMemory?: number;
};

/* How many loops may load and play at once, by device:
   - data saver on, or a 2G-class connection: 1 playing, 2 loaded
   - phones and tablets: 4 playing, 8 loaded (1 and 3 with 2 GB of RAM or less)
   - computers: 4 playing, 12 loaded (2 and 4 with 2 GB or less); 8 playing
     made the Videography page lag on laptops */
function budget() {
  const nav = navigator as Nav;
  if (nav.connection?.saveData || /2g$/.test(nav.connection?.effectiveType ?? "")) return { play: 1, load: 2 };
  const low = (nav.deviceMemory ?? 8) <= 2;
  if (window.matchMedia("(hover: none)").matches) return low ? { play: 1, load: 3 } : { play: 4, load: 8 };
  if (low) return { play: 2, load: 4 };
  return { play: 4, load: 12 };
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
      /* Held or scrolling fast: loads stay as they are, and only a tile
         already playing may go on playing. */
      const frozen = held || fast;
      const loaded = frozen ? e.slot.load : i < load || (e.slot.load && i < load + KEEP);
      const plays = !held && (!fast || e.slot.play) && loaded && visible && playing < play;
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

/* Measures the scroll speed; a fast scroll freezes the gallery until SETTLE
   ms after the last fast step. Slowing down doesn't extend it, so it ends
   SETTLE ms after the scroll drops below FAST, even mid-scroll. */
function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const speed = Math.abs(y - lastY) / Math.max(now - lastT, 1);
  lastY = y;
  lastT = now;
  if (speed > FAST) {
    fast = true;
    clearTimeout(settle);
    settle = window.setTimeout(() => {
      fast = false;
      schedule();
    }, SETTLE);
  }
  schedule();
}

/* Call while the tile is near the screen; `set` is told whether it may load
   and play. The returned function withdraws it (and tells it neither). */
export function requestSlot(el: Element, set: (s: Slot) => void) {
  const entry: Entry = { el, set, slot: OFF };
  entries.add(entry);
  if (!listening) {
    lastY = window.scrollY;
    lastT = performance.now();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    listening = true;
  }
  schedule();

  return () => {
    entries.delete(entry);
    set(OFF);
    if (entries.size === 0 && listening) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      clearTimeout(settle);
      fast = false;
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
