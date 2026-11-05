import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { SEAM_STICKERS } from "@/lib/content";
import PageHero from "@/components/PageHero";
import ServiceGroups from "@/components/ServiceGroups";
import StickerSeam from "@/components/StickerSeam";
import Packages from "@/components/Packages";

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

      <StickerSeam stickers={SEAM_STICKERS.services.groups} />
      <ServiceGroups />

      <StickerSeam stickers={SEAM_STICKERS.services.packages} />
      <Packages />
    </>
  );
}
