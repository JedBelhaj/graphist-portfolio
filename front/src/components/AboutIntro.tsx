import { BRAND } from "@/lib/brand";
import { HERO_PHOTO, STUDIO_PHOTO } from "@/lib/content";
import Button from "./Button";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import Viewfinder from "./Viewfinder";

/* One statement, one paragraph, one picture.

   `page` is the full version that opens /about — it owns the h1, clears the
   fixed header and frames the cut-out in a live viewfinder. The home teaser
   uses a framed on-set shot instead, since the cut-out is already the home
   hero. */
export default function AboutIntro({ page = false, index }: { page?: boolean; index?: string }) {
  const Heading = page ? "h1" : "h2";

  return (
    <section
      id={page ? undefined : "about"}
      className={`relative overflow-hidden bg-ink px-5 text-white sm:px-8 lg:px-10 ${
        page ? "pb-20 pt-32 lg:pb-28 lg:pt-44" : "py-20 lg:py-28"
      }`}
    >
      <div className="mx-auto grid max-w-[1220px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow dark index={index} className="mb-8">
              About us
            </Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <Heading
              className={`display ${page ? "text-[clamp(2.75rem,7.5vw,5.75rem)]" : "text-[clamp(2.25rem,5.5vw,4.25rem)]"}`}
            >
              A studio built to make your brand{" "}
              <span className="script text-brand">worth watching.</span>
            </Heading>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">
              Hi, we&apos;re {BRAND.name}. We started behind a camera and built the marketing side
              so great footage stops dying in a folder. Photo, video, web, social and paid — one
              small team that shoots it, cuts it and makes sure it gets seen, for brands from
              clinics and gyms to cafés and barbershops.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10">
              {page ? (
                <Button href="#contact" variant="brand">
                  Work with us
                </Button>
              ) : (
                <Button href="/about" variant="outline-light">
                  More about us
                </Button>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:col-span-5">
          {page ? (
            <Viewfinder hud className="mx-auto aspect-[4/5] w-full max-w-[480px] bg-ink-2">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(80% 60% at 50% 35%, rgb(58,56,54) 0%, rgb(24,24,26) 60%, rgb(12,12,13) 100%)",
                }}
              />
              <img
                src={HERO_PHOTO}
                alt={`${BRAND.founder}, founder of ${BRAND.name}`}
                className="absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto max-w-none object-contain object-bottom"
              />
            </Viewfinder>
          ) : (
            <figure>
              <Viewfinder className="aspect-[4/5] w-full">
                <img
                  src={STUDIO_PHOTO}
                  alt="On set with the Soltani Media crew"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </Viewfinder>
              <figcaption className="readout mt-4 flex justify-between text-white/45">
                <span>On set</span>
                <span>Always rolling</span>
              </figcaption>
            </figure>
          )}
        </Reveal>
      </div>
    </section>
  );
}
