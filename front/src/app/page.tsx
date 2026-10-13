import { ACCENT_TINT, ACCENT_WASH, INK } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import Results from "@/components/Results";
import Testimonials from "@/components/Testimonials";
import WorkTeaser from "@/components/WorkTeaser";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import Packages from "@/components/Packages";
import AboutIntro from "@/components/AboutIntro";
import Countries from "@/components/Countries";

/* Home is the short version of everything: each section is a teaser that
   hands off to its own page. Header and footer come from the layout. */
export default async function Page() {
  const { home, services, images } = await getContent();

  return (
    <>
      <Hero />

      {/* Proof first: who has hired us, what it did for them, and what they
          said about it — then the work itself. What we offer and what it
          costs follow once the case is made. */}
      <TrustedBy />

      <Results />

      <Testimonials />

      <WorkTeaser />

      <Marquee
        items={Array(4).fill(home.marqueeOne)}
        bg={ACCENT_TINT}
        textColor={INK}
      />

      <Services
        bubbles={services.bubbles}
        title={home.services.title}
        accent={home.services.accent}
        photo={images.hero}
      />

      <Packages />

      <Marquee
        items={Array(2).fill(home.marqueeTwo)}
        bg={ACCENT_WASH}
        textColor={INK}
        duration={40}
      />

      <AboutIntro />

      <Countries />
    </>
  );
}
