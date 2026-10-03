import { WEB_CAPABILITIES, WEB_PROCESS, WEB_SHOTS } from "@/lib/content";
import BrowserFrame from "./BrowserFrame";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* Web design. Same three-part shape as the photo and video pages — intro,
   visual, detail — but the visual is a fanned stack of browser windows
   rather than a mosaic, since a site is one thing you scroll, not a set of
   frames. */
export default function WebDesign() {
  return (
    <>
      <section id="web-design" className="relative overflow-hidden bg-ink px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand/20 blur-[160px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1220px]">
          <SectionHead
            dark
            label="Web design"
            title="Where the content"
            script="gets to live."
            aside="The photos and video are built to travel; the website is where they land. We design and build it around the shoot, so the site looks like the brand on day one."
          />

          {/* The fan: one window front and centre, two set back behind it.
              The side windows only appear from sm up — on a phone there is no
              room for them to read as anything but clutter. */}
          <Reveal delay={200}>
            <div className="relative mx-auto aspect-[16/10] max-w-[880px]">
              <div className="absolute left-[-6%] top-[8%] hidden h-[78%] w-[62%] -rotate-6 opacity-50 sm:block">
                <BrowserFrame src={WEB_SHOTS[1]} url="studio.example" className="h-full" />
              </div>
              <div className="absolute right-[-6%] top-[8%] hidden h-[78%] w-[62%] rotate-6 opacity-50 sm:block">
                <BrowserFrame src={WEB_SHOTS[2]} url="shop.example" className="h-full" />
              </div>
              <div className="absolute inset-0 z-10 sm:inset-x-[12%]">
                <BrowserFrame src={WEB_SHOTS[0]} url="yourbrand.com" className="h-full" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1220px]">
          <SectionHead label="Capabilities" title="What we build" />

          <div className="grid grid-cols-1 border-l border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            {WEB_CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 90} className="border-b border-r border-ink/15">
                <div className="group flex h-full flex-col p-7 transition-colors duration-300 hover:bg-ink lg:p-8">
                  <span className="readout mb-10 text-brand">0{i + 1}</span>
                  <h3 className="display mb-3 text-2xl text-ink transition-colors group-hover:text-white">
                    {c.title}
                  </h3>
                  <p className="text-base leading-relaxed text-muted transition-colors group-hover:text-white/65">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-wash px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1220px]">
          <SectionHead label="Process" title="How a build runs," script="four steps." />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {WEB_PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 90}>
                <div className="h-full border-t-2 border-ink pt-6">
                  <div className="readout mb-4 text-brand">Step {String(i + 1).padStart(2, "0")}</div>
                  <div className="display mb-3 text-3xl text-ink">{p.step}</div>
                  <p className="text-base leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
