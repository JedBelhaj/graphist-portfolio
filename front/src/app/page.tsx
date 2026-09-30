import { ACCENT_TINT, ACCENT_WASH, INK } from "@/lib/brand";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import WorkTeaser from "@/components/WorkTeaser";
import Packages from "@/components/Packages";
import WallOfLove from "@/components/WallOfLove";
import AboutIntro from "@/components/AboutIntro";
import Countries from "@/components/Countries";
import TrustedBy from "@/components/TrustedBy";

/* Home is the short version of everything: each section is a teaser that
   hands off to its own page. Header and footer come from the layout. */
export default function Page() {
  return (
    <>
      <Hero />

      <Marquee
        items={Array(4).fill("Content that looks good and does the work")}
        bg={ACCENT_TINT}
        textColor={INK}
      />

      {/* The work and the proof lead; what we offer and what it costs follow. */}
      <WorkTeaser />

      <WallOfLove />

      <Services />

      <Packages />

      <Marquee
        items={Array(2).fill(
          "Media & Marketing [noun]: Making something worth watching — then making sure it gets seen.",
        )}
        bg={ACCENT_WASH}
        textColor={INK}
        duration={40}
      />

      <AboutIntro />

      <Countries />

      <TrustedBy />
    </>
  );
}
