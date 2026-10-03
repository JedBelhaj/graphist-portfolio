import { CLIENT_LOGOS, COUNTRIES, HERO_BURST_CLS, HERO_PHOTO, HERO_STICKERS } from "@/lib/content";
import Button from "./Button";
import Eyebrow from "./Eyebrow";
import HeroBurst from "./HeroBurst";
import InViewGate from "./InViewGate";
import Viewfinder from "./Viewfinder";

/* The hero's own numbers. Two are counted from the data so they can't drift
   out of step with the logo band and the countries list. */
const STATS = [
  { figure: "120+", label: "Projects delivered" },
  { figure: String(CLIENT_LOGOS.length), label: "Brands on the roster" },
  { figure: String(COUNTRIES.length), label: "Countries shot in" },
  { figure: "72h", label: "Typical first cut" },
];

/* Entrance sequence for the viewfinder, in ms: the frame rises, then the
   burst lands on its corner, then the tool stickers pop in one by one. */
const T_FRAME = 200;
const T_BURST = 800;
const T_STICKERS = 1150;
const T_STICKER_STEP = 110;

/* Dark, full height, and built around a camera screen: the headline on the
   left, Soltani framed in a live viewfinder on the right, the numbers along
   the bottom like a status bar. */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* A low purple glow behind the viewfinder. */}
      <div
        className="pointer-events-none absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-brand/25 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1300px] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-36">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Eyebrow dark className="hero-rise mb-8">
              Photo · Video · Web · Marketing
            </Eyebrow>

            <h1
              className="display hero-rise text-[clamp(3.25rem,11vw,7rem)]"
              style={{ animationDelay: "80ms" }}
            >
              Shot it.
              <span className="block">Cut it.</span>
              <span className="script block text-[1.1em] text-brand">Sold it.</span>
            </h1>

            <p
              className="hero-rise mt-8 max-w-lg text-lg leading-relaxed text-white/65"
              style={{ animationDelay: "180ms" }}
            >
              Soltani Media is one studio for the photos, the video, the website and the campaigns
              that put them to work. One brief, one crew, no handoffs.
            </p>

            <div
              className="hero-rise mt-10 flex flex-wrap gap-3"
              style={{ animationDelay: "260ms" }}
            >
              <Button href="#contact" variant="brand">
                Book a discovery call
              </Button>
              <Button href="#work" variant="outline-light">
                See the work
              </Button>
            </div>
          </div>

          {/* Gated: on mobile the frame starts below the fold, and the sticker
              sequence would finish before anyone saw it. The box is narrower
              than the column on phones so the stickers hanging off its left
              edge stay on screen. */}
          <InViewGate className="lg:col-span-5">
            <div className="relative mx-auto w-[82%] max-w-[520px] sm:w-full">
              <div className="hero-rise" style={{ animationDelay: `${T_FRAME}ms` }}>
                <Viewfinder hud className="aspect-[4/5] w-full bg-ink-2">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(80% 60% at 50% 35%, rgb(64,48,140) 0%, rgb(28,24,52) 60%, rgb(10,11,16) 100%)",
                    }}
                  />
                  {/* The cut-out's top fifth is empty canvas, so anchoring it
                      to the bottom lets the subject fill the frame. */}
                  <img
                    src={HERO_PHOTO}
                    alt="Soltani on set with a clapperboard"
                    className="absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto max-w-none object-contain object-bottom"
                  />
                </Viewfinder>
              </div>

              <div
                className={`absolute z-10 ${HERO_BURST_CLS} hero-rise`}
                style={{ animationDelay: `${T_BURST}ms` }}
              >
                <HeroBurst className="w-full" />
              </div>

              {HERO_STICKERS.map((st, i) => (
                <div
                  key={st.src}
                  className={`absolute z-10 ${st.cls} pop-in`}
                  style={{ animationDelay: `${T_STICKERS + i * T_STICKER_STEP}ms` }}
                >
                  <img
                    src={st.src}
                    alt=""
                    className="w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
                  />
                </div>
              ))}
            </div>
          </InViewGate>
        </div>

        {/* Status bar */}
        <dl
          className="hero-rise mt-16 grid grid-cols-2 border-t border-white/10 lg:mt-20 lg:grid-cols-4"
          style={{ animationDelay: "340ms" }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col-reverse gap-2 py-6 lg:py-8 ${i % 2 ? "pl-5 lg:pl-8" : ""} ${
                i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""
              } ${i % 2 ? "border-l border-white/10" : ""} ${i < 2 ? "border-b border-white/10 lg:border-b-0" : ""}`}
            >
              <dt className="readout text-white/50">{s.label}</dt>
              <dd className="display text-4xl lg:text-5xl">{s.figure}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
