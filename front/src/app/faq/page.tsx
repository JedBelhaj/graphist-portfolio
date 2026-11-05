import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { SEAM_STICKERS } from "@/lib/content";
import PageHero from "@/components/PageHero";
import StickerSeam from "@/components/StickerSeam";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about working with Soltani Media.",
};

export default async function FaqPage() {
  const { hero } = (await getContent()).faq;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent || undefined}>
        {hero.body || undefined}
      </PageHero>

      <StickerSeam stickers={SEAM_STICKERS.faq.list} />
      <Faq />
    </>
  );
}
