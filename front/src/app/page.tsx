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
   hands off to its own page. Header and footer come from the layout.

   Sections are numbered like scenes (01 Results … 07 Locations). The
   home-only sections carry their number themselves; the ones that also
   appear on other pages take it as a prop here, and go unnumbered there. */
export default function Page() {
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

      <Marquee items={["Photography", "Videography", "Web Design", "Social", "Paid Ads", "Strategy"]} />

      <Services />

      <Packages index="05" />

      <AboutIntro index="06" />

      <Countries index="07" />
    </>
  );
}
