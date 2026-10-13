import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import PageHero from "@/components/PageHero";
import ServiceGroups from "@/components/ServiceGroups";
import Packages from "@/components/Packages";
import Toolbox from "@/components/Toolbox";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Photography, video, social and paid growth — everything Soltani Media does, plus packages to get started.",
};

export default async function ServicesPage() {
  const { hero } = (await getContent()).services;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent || undefined}>
        {hero.body || undefined}
      </PageHero>

      <ServiceGroups />

      <Toolbox />

      <Packages />
    </>
  );
}
