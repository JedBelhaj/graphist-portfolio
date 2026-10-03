import { Quote, User } from "lucide-react";
import { ACCENT, ACCENT_WASH } from "@/lib/brand";
import { TESTIMONIALS, type Testimonial } from "@/lib/content";

/* Seconds for one full pass of the card set. Higher = slower. */
const LOOP_SECONDS = 60;

/* How many times the testimonials repeat inside one Row. With only three
   cards, a single pass is ~1,700px — narrower than a wide monitor, so once
   the track slid halfway the right edge ran out of cards. Two passes per
   Row keeps it full past 3,000px. */
const PASSES = 2;

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
function Row({ duplicate = false }: { duplicate?: boolean }) {
  const cards = Array.from({ length: PASSES }, () => TESTIMONIALS).flat();
  return (
    /* Only the first pass of the first Row is announced; every repeat is
       decoration for the loop. */
    <div className="flex shrink-0 items-stretch">
      {cards.map((t, i) => (
        <Card key={i} t={t} hidden={duplicate || i >= TESTIMONIALS.length} />
      ))}
    </div>
  );
}

/* The drifting testimonial rail. Light cards, made for a pale ground. */
export default function CommentCarousel() {
  return (
    <div className="testimonial-viewport overflow-hidden py-4">
      <div className="testimonial-track flex w-max" style={{ ["--loop" as string]: `${LOOP_SECONDS}s` }}>
        <Row />
        <Row duplicate />
      </div>
    </div>
  );
}
