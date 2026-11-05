import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { SEAM_STICKERS } from "@/lib/content";
import PageHero from "@/components/PageHero";
import StickerSeam from "@/components/StickerSeam";
import WebDesign from "@/components/WebDesign";

export const metadata: Metadata = {
  title: "Web Design",
  description: "Brand sites, landing pages and online stores designed and built by Soltani Media.",
};

export default async function WebDesignPage() {
  const { hero } = (await getContent()).webDesign;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent || undefined}>
        {hero.body || undefined}
      </PageHero>

      <StickerSeam stickers={SEAM_STICKERS.webDesign.gallery} />
      <WebDesign />
    </>
  );
}
