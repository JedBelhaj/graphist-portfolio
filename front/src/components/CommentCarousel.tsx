"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ACCENT, FONT_DISPLAY } from "@/lib/brand";
import type { Testimonial } from "@/lib/content";

/* Seconds each card takes to drift past, so the speed stays the same however
   many testimonials there are. Higher = slower. */
const SECONDS_PER_CARD = 6;

/* A Row needs at least this many cards to stay wider than a wide monitor
   (~3,000px); below that the right edge runs out of cards once the track has
   slid halfway. Short lists repeat inside the Row until they reach it. */
const MIN_CARDS = 6;

/* Five grey stars with five purple ones clipped over them, so a rating like 4.6
   shows its true share of the last star. */
function Stars({ rating }: { rating: number }) {
  const row = Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={15} fill="currentColor" strokeWidth={0} className="shrink-0" />
  ));
  return (
    <span className="flex items-center gap-2">
      <span className="relative inline-flex" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
        <span className="flex gap-0.5 text-black/10">{row}</span>
        <span
          className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${(rating / 5) * 100}%`, color: ACCENT }}
        >
          {row}
        </span>
      </span>
      <span className="text-sm font-semibold text-[rgb(10,11,16)]" aria-hidden="true">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function Card({ t, hidden }: { t: Testimonial; hidden: boolean }) {
  const stats = [
    { label: "Earned", value: t.earned },
    { label: "Rate", value: t.rate },
    { label: "Dates", value: t.dates },
  ].filter((s) => s.value);

  return (
    <figure
      aria-hidden={hidden || undefined}
      className="mr-5 flex w-[85vw] shrink-0 flex-col rounded-2xl border border-black/6 bg-white p-6 shadow-[0_8px_30px_rgba(10,11,16,0.05)] sm:w-[400px] lg:w-[440px]"
    >
      <figcaption className="mb-4 flex items-center justify-between gap-4">
        {typeof t.rating === "number" && <Stars rating={t.rating} />}
        <div className="ml-auto flex min-w-0 items-center gap-2 text-right">
          <div className="min-w-0">
            <div className="text-xs text-[rgb(122,122,132)]">{t.name ?? "Client, name withheld"}</div>
            {(t.tag || t.handle) && <div className="text-xs text-[rgb(122,122,132)]">{t.tag ?? t.handle}</div>}
          </div>
          {t.avatar && <img src={t.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />}
        </div>
      </figcaption>

      {t.jobTitle && (
        <div
          className="mb-2 text-base font-bold leading-snug tracking-tight text-[rgb(10,11,16)]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {t.jobTitle}
        </div>
      )}

      <blockquote className="text-[15px] leading-relaxed text-[rgb(74,74,86)]">{t.quote}</blockquote>

      {stats.length > 0 && (
        <dl className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-5">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-[rgb(122,122,132)]">{s.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-[rgb(10,11,16)]">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}

/* One set of cards. Rendered twice so the track wraps seamlessly after one
   Row's width; spacing lives on the cards (mr-5) rather than a container gap,
   or the wrap point would land mid-gap and the loop would visibly jump. */
const passes = (count: number) => Math.max(1, Math.ceil(MIN_CARDS / count));

function Row({ items, duplicate = false }: { items: Testimonial[]; duplicate?: boolean }) {
  const cards = Array.from({ length: passes(items.length) }, () => items).flat();
  return (
    /* Only the first pass of the first Row is announced; every repeat is
       decoration for the loop. */
    <div className="flex shrink-0 items-stretch">
      {cards.map((t, i) => (
        <Card key={i} t={t} hidden={duplicate || i >= items.length} />
      ))}
    </div>
  );
}

/* Card width plus its mr-5, and one Row's width, read off the DOM so they
   follow the breakpoints. */
function measure(track: HTMLElement | null) {
  const row = track?.firstElementChild as HTMLElement | null;
  const card = row?.firstElementChild as HTMLElement | null;
  const width = card?.offsetWidth ?? 0;
  return { card: width, step: width + 20, row: row?.offsetWidth ?? 0 };
}

const NAV =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(10,11,16,0.18)] ring-1 ring-black/5 transition-[opacity,transform] duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex";

/* The drifting testimonial rail. Light cards, made for a pale ground.

   Driven from a frame loop rather than a CSS animation, because hovering
   has to do more than pause: the nearest card eases into the exact centre,
   and two buttons beside it step one card at a time. Leaving lets it drift on
   from wherever it stopped. `x` is how far the track has moved left; it
   wraps after one Row, where the duplicate Row looks identical. */
export default function CommentCarousel({ items }: { items: Testimonial[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  /* Where the track is easing to while held; null while drifting. */
  const target = useRef<number | null>(null);
  const hovering = useRef(false);
  const [held, setHeld] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    /* Reduced motion: no drift at all. globals.css makes the rail scrollable
       instead, and the buttons scroll it. */
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const { step, row } = measure(trackRef.current);
      if (target.current !== null) {
        const d = target.current - x.current;
        x.current = Math.abs(d) < 0.5 ? target.current : x.current + d * Math.min(1, dt * 9);
      } else {
        x.current += (step / SECONDS_PER_CARD) * dt;
      }
      if (row > 0) {
        const wrap = x.current >= row ? -row : x.current < 0 ? row : 0;
        x.current += wrap;
        if (target.current !== null) target.current += wrap;
      }
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-x.current}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* The offset that puts the card nearest the middle exactly in the middle. */
  const centred = () => {
    const { card, step } = measure(trackRef.current);
    const half = (viewportRef.current?.offsetWidth ?? 0) / 2;
    const i = Math.round((x.current + half - card / 2) / step);
    return i * step + card / 2 - half;
  };

  const hold = () => {
    if (still || held) return;
    setHeld(true);
    target.current = centred();
  };
  const release = () => {
    setHeld(false);
    target.current = null;
  };
  const go = (dir: 1 | -1) => {
    const { step } = measure(trackRef.current);
    if (still) {
      viewportRef.current?.scrollBy({ left: dir * step });
      return;
    }
    target.current = (target.current ?? centred()) + dir * step;
  };

  return (
    <div
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = true;
        hold();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = false;
        release();
      }}
      onFocus={hold}
      onBlur={(e) => !hovering.current && !e.currentTarget.contains(e.relatedTarget) && release()}
    >
      <div ref={viewportRef} className="testimonial-viewport overflow-hidden py-4">
        <div ref={trackRef} className="flex w-max will-change-transform">
          <Row items={items} />
          <Row items={items} duplicate />
        </div>
      </div>

      {/* Just outside the centred card's edges (half a card + a gap + the
          button). Hidden on touch screens, which can't hover; there the rail
          just drifts. */}
      {(
        [
          [-1, "Previous review", ChevronLeft, "sm:left-[calc(50%-266px)] lg:left-[calc(50%-306px)]"],
          [1, "Next review", ChevronRight, "sm:right-[calc(50%-266px)] lg:right-[calc(50%-306px)]"],
        ] as const
      ).map(([dir, label, Icon, place]) => (
        <button
          key={dir}
          type="button"
          aria-label={label}
          onClick={() => go(dir)}
          className={`${NAV} ${place} ${held || still ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{ color: ACCENT, outlineColor: ACCENT }}
        >
          <Icon size={22} />
        </button>
      ))}
    </div>
  );
}
