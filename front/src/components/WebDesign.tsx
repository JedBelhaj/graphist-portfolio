import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { WEB_CAPABILITIES, WEB_PROCESS, WEB_SHOTS } from "@/lib/content";
import BrowserFrame from "./BrowserFrame";
import Reveal from "./Reveal";

/* Web design. Same three-part shape as the photo and video pages — intro,
   visual, detail — but the visual is a fanned stack of browser windows
   rather than a mosaic, since a site is one thing you scroll, not a set of
   frames. */
export default function WebDesign() {
  return (
    <>
      <section
        id="web-design"
        className="overflow-hidden px-5 pb-20 pt-20 sm:px-8 lg:pb-28 lg:pt-28"
        style={{
          background: `radial-gradient(90% 70% at 50% 0%, rgb(60,40,150) 0%, rgb(10,11,16) 70%)`,
        }}
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-20">
            <Reveal>
              <h2
                className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Where the content
                <span className="block" style={{ fontFamily: FONT_SCRIPT }}>
                  gets to live.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[rgb(176,176,186)]">
                The photos and video are built to travel; the website is where they land. We design
                and build it around the shoot, so the site looks like the brand on day one.
              </p>
            </Reveal>
          </div>

          {/* The fan: one window front and centre, two set back behind it.
              The side windows only appear from sm up — on a phone there is no
              room for them to read as anything but clutter. */}
          <Reveal delay={200}>
            <div className="relative mx-auto aspect-[16/10] max-w-[880px]">
              <div className="absolute left-[-6%] top-[8%] hidden h-[78%] w-[62%] -rotate-6 opacity-60 sm:block">
                <BrowserFrame src={WEB_SHOTS[1]} url="studio.example" className="h-full" />
              </div>
              <div className="absolute right-[-6%] top-[8%] hidden h-[78%] w-[62%] rotate-6 opacity-60 sm:block">
                <BrowserFrame src={WEB_SHOTS[2]} url="shop.example" className="h-full" />
              </div>
              <div className="absolute inset-0 z-10 sm:inset-x-[12%]">
                <BrowserFrame src={WEB_SHOTS[0]} url="yourbrand.com" className="h-full" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <h2
              className="mb-12 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-[rgb(10,11,16)] sm:text-4xl lg:mb-14 lg:text-5xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              What we build
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WEB_CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className="flex h-full flex-col rounded-3xl border border-black/10 p-7 transition-colors duration-300 hover:border-[rgb(124,92,252)]">
                  <span className="mb-8 text-sm tabular-nums text-[rgb(122,122,132)]">0{i + 1}</span>
                  <h3
                    className="mb-3 text-xl font-bold tracking-tight text-[rgb(10,11,16)]"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    {c.title}
                  </h3>
                  <p className="text-base leading-relaxed text-[rgb(74,74,86)]">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28" style={{ backgroundColor: ACCENT_WASH }}>
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <h2
              className="mb-12 text-3xl font-semibold leading-[1.1] tracking-tight text-[rgb(10,11,16)] sm:text-4xl lg:mb-14 lg:text-5xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              How a build runs
              <span className="block" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
                four steps, no surprises.
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {WEB_PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 90}>
                <div className="h-full border-t-2 pt-6" style={{ borderColor: ACCENT }}>
                  <div className="mb-3 flex items-baseline gap-3">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: ACCENT }}>
                      0{i + 1}
                    </span>
                    <span
                      className="text-2xl font-bold tracking-tight text-[rgb(10,11,16)]"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {p.step}
                    </span>
                  </div>
                  <p className="text-base leading-relaxed text-[rgb(74,74,86)]">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
