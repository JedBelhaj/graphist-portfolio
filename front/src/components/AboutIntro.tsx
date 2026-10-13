import Link from "next/link";
import { ACCENT, ACCENT_TINT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT, INK } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";

/* The calm, editorial intro: one big two-tone headline, a single warm
   paragraph, one pill button, and a person on the right. Lots of air and
   nothing else competing.

   `page` is the full version that opens /about — it owns the h1, clears the
   fixed header and uses the transparent cut-out bleeding off the bottom edge.
   The home teaser uses a framed studio shot instead, since the cut-out is
   already the home hero. */
export default async function AboutIntro({ page = false }: { page?: boolean }) {
  const { about, brand, images } = await getContent();
  const { intro } = about;
  const Heading = page ? "h1" : "h2";

  return (
    <section
      id={page ? undefined : "about"}
      className={`relative overflow-hidden bg-white px-5 sm:px-8 ${page ? "pt-32 lg:pt-40" : "py-20 lg:py-28"}`}
    >
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className={page ? "pb-4 lg:pb-32" : ""}>
          <Reveal>
            <p
              className="mb-6 text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              {intro.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <Heading
              className={`font-semibold leading-[1.02] tracking-[-0.03em] text-[rgb(22,28,39)] ${
                page ? "text-5xl sm:text-6xl lg:text-[80px]" : "text-4xl sm:text-5xl lg:text-[64px]"
              }`}
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {intro.title}{" "}
              <span className="font-normal" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
                {intro.accent}
              </span>
            </Heading>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[rgb(51,51,51)]">{intro.body}</p>
          </Reveal>
          <Reveal delay={240}>
            {page ? (
              <a
                href="#contact"
                className="mt-10 inline-block rounded-full px-10 py-4 text-lg font-medium transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: ACCENT_TINT, color: INK }}
              >
                Work with us
              </a>
            ) : (
              <Link
                href="/about"
                className="mt-10 inline-block rounded-full px-10 py-4 text-lg font-medium transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: ACCENT_TINT, color: INK }}
              >
                More about us
              </Link>
            )}
          </Reveal>
        </div>

        {page ? (
          /* self-end so the cut-out sits on the section's bottom edge, the way
             a studio backdrop meets the floor. */
          <Reveal delay={120} className="relative self-end">
            <div
              className="absolute inset-x-[8%] bottom-0 top-[18%] rounded-t-[999px]"
              style={{ backgroundColor: ACCENT_WASH }}
            />
            <img
              src={images.hero}
              alt={`${brand.founder}, founder of ${brand.name}`}
              className="relative mx-auto max-h-[560px] lg:max-h-[680px]"
            />
          </Reveal>
        ) : (
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-[32px]">
              <img
                src={images.studio}
                alt="On set with the Soltani Media crew"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
