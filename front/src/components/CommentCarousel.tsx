"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
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
  return { step: width + 20, row: row?.offsetWidth ?? 0 };
}

/* The drifting testimonial rail. Light cards, made for a pale ground.

   It drifts continuously: no pause on hover and no arrows. Driven from a
   frame loop so the speed stays one card per SECONDS_PER_CARD at every
   breakpoint. `x` is how far the track has moved left; it wraps after one
   Row, where the duplicate Row looks identical. Under reduced motion it
   doesn't move at all, and globals.css makes the rail scrollable instead. */
export default function CommentCarousel({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useRef(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const { step, row } = measure(trackRef.current);
      x.current += (step / SECONDS_PER_CARD) * dt;
      if (row > 0 && x.current >= row) x.current -= row;
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-x.current}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="testimonial-viewport overflow-hidden py-4">
      <div ref={trackRef} className="flex w-max will-change-transform">
        <Row items={items} />
        <Row items={items} duplicate />
      </div>
    </div>
  );
}
