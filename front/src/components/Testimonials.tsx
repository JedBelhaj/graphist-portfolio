import CommentCarousel from "./CommentCarousel";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* Written testimonials, after the Results screenshots. Back on ink, so the
   page alternates dark and light in long beats instead of every section. */
export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-ink py-20 lg:py-28">
      <div className="mx-auto max-w-[1300px] px-5 sm:px-8 lg:px-10">
        <SectionHead
          dark
          index="02"
          label="Testimonials"
          title="In their"
          script="own words."
          aside="What clients say once the shoot is over and the numbers are in."
        />
      </div>

      <Reveal delay={140}>
        <CommentCarousel />
      </Reveal>
    </section>
  );
}
