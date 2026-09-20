import { FONT_DISPLAY, FONT_SCRIPT, PINK } from "@/lib/brand";
import { LUNA, STAR } from "@/lib/content";
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
            About me
          </h2>

          <AboutBlock num="01" title="WHO AM I?">
            I&apos;m Marissa, Founder of Eclectic Creative &amp; Co., a one-woman{" "}
            <span className="font-bold" style={{ color: PINK }}>marketing powerhouse</span> with a
            not-so-linear resume and a big heart for small business. After a decade of shaping
            brands across beauty, tech, CPG, real estate, financial services, and healthcare, I&apos;ve
            learned that no two businesses or marketing strategies should ever look the same.
          </AboutBlock>

          <AboutBlock num="02" title="WHAT I DO?">
            At Eclectic Creative, I blend big-picture thinking with hands-on execution. Whether
            it&apos;s social content that converts, community events that build loyal advocates, or
            Shopify setups that simply work. My secret weapon? A{" "}
            <span className="font-bold" style={{ color: PINK }}>wildly diverse background</span>{" "}
            that brings fresh ideas to every client, every time.
          </AboutBlock>

          {/* Luna image */}
          <div className="relative overflow-hidden rounded-2xl lg:col-start-2 lg:row-start-2 lg:row-span-2">
            <img src={LUNA} alt="Luna" className="w-full" />
            <div
              className="absolute bottom-6 left-4 text-2xl font-bold text-black"
              style={{ fontFamily: FONT_SCRIPT }}
            >
              Co-founder, Luna
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-3 lg:self-end">
            <AboutBlock num="03" title="WHY ME?">
              This isn&apos;t one-size-fits-all marketing. It&apos;s curated, human, and{" "}
              <span className="font-bold" style={{ color: PINK }}>built to grow with you.</span>
            </AboutBlock>
          </div>

          <div className="hidden items-end justify-center lg:col-start-3 lg:row-start-3 lg:flex">
            <img src={STAR} alt="" className="w-40 rotate-[160deg] invert" />
          </div>
        </div>
      </div>
    </section>
  );
}
