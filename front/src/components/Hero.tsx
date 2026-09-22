import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { HERO_ARROW, HERO_BURST_CLS, HERO_PHOTO, HERO_STICKERS } from "@/lib/content";
import HeroBurst from "./HeroBurst";

/* Entrance sequence, in ms: the left column rises first, then the photo slides
   in from the right, then the burst behind it, then the logos pop one by one. */
const T_PHOTO = 100;
const T_BURST = 800;
const T_LOGOS = 1250;
const T_LOGO_STEP = 110;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[rgb(254,254,254)] pt-28 lg:pt-15">
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:min-h-screen lg:grid-cols-2 lg:gap-6 lg:px-[43px]">
        <div className="order-2 py-6 lg:order-1 lg:py-40">
          <div className="hero-rise mb-8 flex flex-wrap gap-x-3">
            <h1
              className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-[rgb(22,28,39)] sm:text-5xl lg:text-[53px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Sharp visuals.
            </h1>
            <h1
              className="text-[40px] font-black leading-[1.1] tracking-[-0.03em] text-[rgb(22,28,39)] sm:text-5xl lg:text-[53px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Sharper strategy.
            </h1>
            <div className="flex items-center gap-3">
              <h1
                className="text-[40px] leading-[1.1] tracking-[-0.03em] text-[rgb(22,28,39)] sm:text-5xl lg:text-[53px]"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                All under one roof.
              </h1>
              <img src={HERO_ARROW} alt="" className="hidden h-10 sm:block lg:h-12" />
            </div>
          </div>

          <p
            className="hero-rise mb-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
            style={{ color: ACCENT, animationDelay: "120ms" }}
          >
            Shot It, Cut It, Marketed It &nbsp;&mdash;&nbsp; Across 120+ Projects and Counting
          </p>
          <p
            className="hero-rise mb-8 max-w-xl text-lg leading-relaxed tracking-tight text-[rgb(10,11,16)] sm:text-xl"
            style={{ animationDelay: "200ms" }}
          >
            Photo, video, and the campaigns that actually put them to work. One studio, one brief,
            no handoffs. What you see below is just a taste &mdash; there&apos;s a lot more where
            that came from.
          </p>

          <a
            href="#contact"
            className="hero-rise inline-block rounded-full bg-[rgb(10,11,16)] px-5 py-2.5 text-base font-medium text-white transition-transform hover:scale-[1.03]"
            style={{ animationDelay: "280ms" }}
          >
            Book A Discovery Call
          </a>
        </div>

        {/* Hero image panel */}
        <div className="order-1 lg:order-2 lg:hidden">
          <div className="relative mx-auto flex max-w-md items-end justify-center overflow-hidden rounded-3xl bg-[rgb(238,234,255)] pt-8">
            <img
              src={HERO_PHOTO}
              alt="Soltani on set with a clapperboard"
              className="hero-rise relative z-[5] max-h-[460px]"
            />
          </div>
        </div>
      </div>

      {/* Desktop full-height photo panel */}
      <div className="absolute inset-y-0 right-0 hidden w-[42%] items-end justify-center bg-[rgb(238,234,255)] lg:flex">
        <div className="relative left-[-8%] flex items-end justify-center xl:left-[-18%]">
          <img
            src={HERO_PHOTO}
            alt="Soltani on set with a clapperboard"
            className="hero-in-right relative z-[5] max-h-[640px] xl:max-h-[760px]"
            style={{ animationDelay: `${T_PHOTO}ms` }}
          />
          {/* Burst behind the subject, then the tool logos pop in over it. */}
          <div
            className={`absolute ${HERO_BURST_CLS} hero-in-right`}
            style={{ animationDelay: `${T_BURST}ms` }}
          >
            <HeroBurst className="w-full" />
          </div>

          {HERO_STICKERS.map((s, i) => (
            <div
              key={i}
              className={`absolute ${s.cls} pop-in`}
              style={{ animationDelay: `${T_LOGOS + i * T_LOGO_STEP}ms` }}
            >
              <img src={s.id} alt="" className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
