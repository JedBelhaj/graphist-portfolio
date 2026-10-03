import { TESTIMONIALS, type Testimonial } from "@/lib/content";

/* Seconds for one full pass of the card set. Higher = slower. */
const LOOP_SECONDS = 60;

/* How many times the testimonials repeat inside one Row. With only three
   cards, a single pass is ~1,700px — narrower than a wide monitor, so once
   the track slid halfway the right edge ran out of cards. Two passes per
   Row keeps it full past 3,000px. */
const PASSES = 2;

function Card({ t, n, hidden }: { t: Testimonial; n: number; hidden: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="mr-5 flex w-[85vw] shrink-0 flex-col border border-white/10 bg-ink-2 p-7 transition-colors duration-300 hover:border-white/30 sm:w-[420px] lg:w-[500px] lg:p-9"
    >
      <div className="readout mb-8 flex items-center justify-between text-white/40">
        <span>Take {String(n + 1).padStart(2, "0")}</span>
        <span className="display text-5xl leading-none text-brand">&ldquo;</span>
      </div>
      <blockquote className="mb-8 text-[15px] leading-relaxed text-white/80 lg:text-base">
        {t.quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
        {t.avatar && (
          <img src={t.avatar} alt="" className="h-11 w-11 shrink-0 object-cover grayscale" />
        )}
        <div className="min-w-0">
          <div className="display text-base text-white">{t.name ?? "Client, name withheld"}</div>
          {(t.tag || t.handle) && (
            <div className="readout mt-1 truncate text-white/45">{t.tag ?? t.handle}</div>
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
        <Card
          key={i}
          t={t}
          n={i % TESTIMONIALS.length}
          hidden={duplicate || i >= TESTIMONIALS.length}
        />
      ))}
    </div>
  );
}

/* The drifting testimonial rail. Dark cards, made for the ink ground. */
export default function CommentCarousel() {
  return (
    <div className="testimonial-viewport overflow-hidden">
      <div className="testimonial-track flex w-max" style={{ ["--loop" as string]: `${LOOP_SECONDS}s` }}>
        <Row />
        <Row duplicate />
      </div>
    </div>
  );
}
