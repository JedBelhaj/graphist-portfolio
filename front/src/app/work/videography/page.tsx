import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { SEAM_STICKERS } from "@/lib/content";
import PageHero from "@/components/PageHero";
import StickerSeam from "@/components/StickerSeam";
import Videography from "@/components/Videography";

export const metadata: Metadata = {
  title: "Videography",
  description: "Brand films, reels and event coverage shot and edited in-house by Soltani Media.",
};

export default async function VideographyPage() {
  const { hero } = (await getContent()).videography;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent || undefined}>
        {hero.body || undefined}
      </PageHero>

      <StickerSeam stickers={SEAM_STICKERS.videography.gallery} />
      <Videography />
    </>
  );
}
