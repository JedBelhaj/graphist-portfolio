import { getContent } from "@/lib/cms";
import { SEAM_STICKERS } from "@/lib/content";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import Results from "@/components/Results";
import StickerSeam from "@/components/StickerSeam";
import Testimonials from "@/components/Testimonials";
import WorkTeaser from "@/components/WorkTeaser";
import Services from "@/components/Services";
import Packages from "@/components/Packages";
import AboutIntro from "@/components/AboutIntro";
import Countries from "@/components/Countries";

/* Home is the short version of everything: each section is a teaser that
   hands off to its own page. Header and footer come from the layout. */
export default async function Page() {
  const { home, services, images } = await getContent();
  const seams = SEAM_STICKERS.home;

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

      <Services
        bubbles={services.bubbles}
        title={home.services.title}
        accent={home.services.accent}
        photo={images.services}
      />

      <StickerSeam stickers={seams.packages} />
      <Packages />

      <AboutIntro />

      <Countries />
    </>
  );
}
