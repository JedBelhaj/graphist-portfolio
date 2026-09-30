import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ServiceGroups from "@/components/ServiceGroups";
import Packages from "@/components/Packages";
import Toolbox from "@/components/Toolbox";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Photography, video, social and paid growth — everything Soltani Media does, plus packages to get started.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Everything it takes" accent="to get seen.">
        Four disciplines, one team. Pick the pieces you need, or hand over the whole content side
        and we&apos;ll run it end to end.
      </PageHero>

      <ServiceGroups />

      <Toolbox />

      <Packages />
    </>
  );
}
