import { ACCENT_TINT, FONT_BODY, INK, LAVENDER } from "@/lib/brand";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Services from "@/components/Services";
import Videography from "@/components/Videography";
import Photography from "@/components/Photography";
import Toolbox from "@/components/Toolbox";
import Work from "@/components/Work";
import Team from "@/components/Team";
import Testimonials from "@/components/Testimonials";
import SiteFooter from "@/components/SiteFooter";

export default function Page() {
  return (
    <div className="min-h-full bg-white font-light text-[rgb(51,51,51)]" style={{ fontFamily: FONT_BODY }}>
      <Header />

      <main id="top">
        <Hero />

        {/* Social proof sits directly under the hero, before any pitch. */}
        <TrustedBy />

        <Marquee
          items={Array(4).fill("Content that looks good and does the work")}
          bg={LAVENDER}
          textColor={INK}
        />

        <About />

        <Marquee
          items={Array(2).fill(
            "Media & Marketing [noun]: Making something worth watching — then making sure it gets seen.",
          )}
          bg={ACCENT_TINT}
          textColor={INK}
          duration={40}
        />

        <Services />

        {/* The two craft sections run dark then light, so the parallax in each
            reads against a different ground. */}
        <Videography />

        <Photography />

        <Toolbox />

        <Work />

        <Team />

        <Testimonials />

        <SiteFooter />
      </main>
    </div>
  );
}
