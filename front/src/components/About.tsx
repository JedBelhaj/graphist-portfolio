import { FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import { LOGO_MARK } from "@/lib/content";
import AboutBlock from "./AboutBlock";
import Highlight from "./Highlight";
import Reveal from "./Reveal";

export default async function About() {
  const { about, images } = await getContent();
  const [who, what, why] = about.principles;

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
              {about.aboutTitle}
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <AboutBlock num="01" title={who.title}>
              <Highlight text={who.body} />
            </AboutBlock>
          </Reveal>

          <Reveal delay={180}>
            <AboutBlock num="02" title={what.title}>
              <Highlight text={what.body} />
            </AboutBlock>
          </Reveal>

          {/* On-set image */}
          <Reveal delay={120} className="lg:col-start-2 lg:row-start-2 lg:row-span-2">
            <div className="relative overflow-hidden rounded-2xl">
              <img src={images.studio} alt="On set with the Soltani Media crew" className="w-full" />
              <div
                className="absolute bottom-6 left-4 text-2xl font-bold text-black"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                {about.photoCaption}
              </div>
            </div>
          </Reveal>

          <Reveal delay={240} className="lg:col-start-1 lg:row-start-3 lg:self-end">
            <AboutBlock num="03" title={why.title}>
              <Highlight text={why.body} />
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
