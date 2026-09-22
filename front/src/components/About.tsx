import { FONT_DISPLAY, FONT_SCRIPT, PINK } from "@/lib/brand";
import { LOGO_MARK, STUDIO_PHOTO } from "@/lib/content";
import AboutBlock from "./AboutBlock";

export default function About() {
  return (
    <section id="about" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-3">
          <h2
            className="text-5xl font-semibold leading-none tracking-tight text-[rgb(254,254,254)] sm:text-7xl lg:col-span-2 lg:text-[84px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            About us
          </h2>

          <AboutBlock num="01" title="WHO ARE WE?">
            Soltani Media &amp; Marketing is a small production studio built around one stubborn
            idea: the people who shoot your content should also know{" "}
            <span className="font-bold" style={{ color: PINK }}>what it&apos;s for</span>. We started
            behind a camera, spent years watching great footage die in the wrong hands, and built
            the marketing side so that stopped happening.
          </AboutBlock>

          <AboutBlock num="02" title="WHAT DO WE DO?">
            We shoot it, cut it, and put it to work. Brand photography, video, short-form social,
            paid creative, and the campaigns that carry them. One team from the brief to the
            reporting, which means{" "}
            <span className="font-bold" style={{ color: PINK }}>nothing gets lost in the handoff</span>{" "}
            between the studio, the editor, and the media buyer.
          </AboutBlock>

          {/* On-set image */}
          <div className="relative overflow-hidden rounded-2xl lg:col-start-2 lg:row-start-2 lg:row-span-2">
            <img src={STUDIO_PHOTO} alt="On set with the Soltani Media crew" className="w-full" />
            <div
              className="absolute bottom-6 left-4 text-2xl font-bold text-black"
              style={{ fontFamily: FONT_SCRIPT }}
            >
              Always rolling.
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-3 lg:self-end">
            <AboutBlock num="03" title="WHY US?">
              No template packages, no three-vendor telephone game. Just a crew that shows up with
              a plan and content{" "}
              <span className="font-bold" style={{ color: PINK }}>built to earn its keep.</span>
            </AboutBlock>
          </div>

          <div className="hidden items-end justify-center lg:col-start-3 lg:row-start-3 lg:flex">
            <img src={LOGO_MARK} alt="" className="spin-slow w-40 invert" />
          </div>
        </div>
      </div>
    </section>
  );
}
