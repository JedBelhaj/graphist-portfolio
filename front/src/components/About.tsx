import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { LOGO_MARK, STUDIO_PHOTO } from "@/lib/content";
import AboutBlock from "./AboutBlock";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-3">
          {/* Each Reveal is the grid item, so the placement classes live on the
              wrapper — put them on the child and the layout collapses. */}
          <Reveal className="lg:col-span-2">
            <h2
              className="text-5xl font-semibold leading-none tracking-tight text-[rgb(254,254,254)] sm:text-7xl lg:text-[84px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              About us
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <AboutBlock num="01" title="WHO ARE WE?">
              Soltani Media &amp; Marketing is a small production studio built around one stubborn
              idea: the people who shoot your content should also know{" "}
              <span className="font-bold" style={{ color: ACCENT }}>what it&apos;s for</span>. We started
              behind a camera, spent years watching great footage die in the wrong hands, and built
              the marketing side so that stopped happening.
            </AboutBlock>
          </Reveal>

          <Reveal delay={180}>
            <AboutBlock num="02" title="WHAT DO WE DO?">
              We shoot it, cut it, and put it to work. Brand photography, video, short-form social,
              paid creative, and the campaigns that carry them. One team from the brief to the
              reporting, which means{" "}
              <span className="font-bold" style={{ color: ACCENT }}>nothing gets lost in the handoff</span>{" "}
              between the studio, the editor, and the media buyer.
            </AboutBlock>
          </Reveal>

          {/* On-set image */}
          <Reveal delay={120} className="lg:col-start-2 lg:row-start-2 lg:row-span-2">
            <div className="relative overflow-hidden rounded-2xl">
              <img src={STUDIO_PHOTO} alt="On set with the Soltani Media crew" className="w-full" />
              <div
                className="absolute bottom-6 left-4 text-2xl font-bold text-black"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                Always rolling.
              </div>
            </div>
          </Reveal>

          <Reveal delay={240} className="lg:col-start-1 lg:row-start-3 lg:self-end">
            <AboutBlock num="03" title="WHY US?">
              No template packages, no three-vendor telephone game. Just a crew that shows up with
              a plan and content{" "}
              <span className="font-bold" style={{ color: ACCENT }}>built to earn its keep.</span>
            </AboutBlock>
          </Reveal>

          <Reveal
            delay={300}
            className="hidden items-end justify-center lg:col-start-3 lg:row-start-3 lg:flex"
          >
            <img src={LOGO_MARK} alt="" className="spin-slow w-40 invert" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
