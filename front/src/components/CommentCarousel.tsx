import { Quote, User } from "lucide-react";
import { ACCENT, ACCENT_WASH } from "@/lib/brand";
import type { Testimonial } from "@/lib/content";

/* Seconds each card takes to drift past, so the speed stays the same however
   many testimonials there are. Higher = slower. */
const SECONDS_PER_CARD = 18;

/* A Row needs at least this many cards to stay wider than a wide monitor
   (~3,000px); below that the right edge runs out of cards once the track has
   slid halfway. Short lists repeat inside the Row until they reach it. */
const MIN_CARDS = 6;

function Card({ t, hidden }: { t: Testimonial; hidden: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="mr-5 flex w-[85vw] shrink-0 flex-col rounded-[24px] border border-black/6 bg-white p-7 shadow-[0_14px_40px_rgba(10,11,16,0.06)] sm:w-[420px] lg:w-[500px] lg:p-8"
    >
      <span
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: ACCENT_WASH, color: ACCENT }}
      >
        <Quote size={18} fill="currentColor" strokeWidth={0} />
      </span>
      <blockquote className="mb-6 text-[15px] leading-relaxed text-[rgb(51,51,60)] lg:text-base">
        {t.quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-black/6 pt-5">
        {t.avatar ? (
          <img src={t.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: ACCENT_WASH, color: ACCENT }}
            aria-hidden="true"
          >
            <User size={20} />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[rgb(10,11,16)]">
            {t.name ?? "Client, name withheld"}
          </div>
          {(t.tag || t.handle) && (
            <div className="truncate text-sm text-[rgb(122,122,132)]">{t.tag ?? t.handle}</div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

/* One set of cards. Rendered twice so the -50% translate wraps seamlessly;
   spacing lives on the cards (mr-5) rather than a container gap, or the
   halfway point would land mid-gap and the loop would visibly jump. */
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

/* The drifting testimonial rail. Light cards, made for a pale ground. */
export default function CommentCarousel({ items }: { items: Testimonial[] }) {
  const loop = items.length * passes(items.length) * SECONDS_PER_CARD;
  return (
    <div className="testimonial-viewport overflow-hidden py-4">
      <div className="testimonial-track flex w-max" style={{ ["--loop" as string]: `${loop}s` }}>
        <Row items={items} />
        <Row items={items} duplicate />
      </div>
    </div>
  );
}
