import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import CommentCarousel from "./CommentCarousel";
import Reveal from "./Reveal";

/* Written testimonials, after the Results screenshots. A pale ground so the
   dark Results block above it gets a clean break rather than running on. */
export default async function Testimonials() {
  const { home, testimonials } = await getContent();
  const h = home.testimonials;

  return (
    <section id="testimonials" className="py-20 lg:py-28" style={{ backgroundColor: ACCENT_WASH }}>
      <div className="mx-auto mb-10 max-w-[1180px] px-5 text-center sm:px-8 lg:mb-14">
        <Reveal>
          <p
            className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: ACCENT }}
          >
            {h.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="text-4xl font-bold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {h.title}
            <span
              className="block text-3xl font-normal sm:text-4xl lg:text-5xl"
              style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}
            >
              {h.accent}
            </span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={140}>
        <CommentCarousel items={testimonials} />
      </Reveal>
    </section>
  );
}
