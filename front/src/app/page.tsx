import { FONT_BODY, INK, LAVENDER, PINK_LIGHT } from "@/lib/brand";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Services from "@/components/Services";
import Toolbox from "@/components/Toolbox";
import Work from "@/components/Work";
import Testimonials from "@/components/Testimonials";
import SiteFooter from "@/components/SiteFooter";

export default function Page() {
  return (
    <div className="min-h-full bg-white font-light text-[rgb(51,51,51)]" style={{ fontFamily: FONT_BODY }}>
      <Header />

      <main id="top">
        <Hero />

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
          bg={PINK_LIGHT}
          textColor={INK}
          duration={40}
        />

        <Services />

        <Toolbox />

        <Work />

        <Testimonials />

        <SiteFooter />
      </main>
    </div>
  );
}
