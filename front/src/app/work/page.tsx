import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { SEAM_STICKERS } from "@/lib/content";
import PageHero from "@/components/PageHero";
import StickerSeam from "@/components/StickerSeam";
import WorkTeaser from "@/components/WorkTeaser";
import Work from "@/components/Work";

export const metadata: Metadata = {
  title: "Work",
  description: "Photography, videography and web design from Soltani Media — brand, product, event, short-form and web work.",
};

export default async function WorkPage() {
  const { work } = await getContent();
  const { hero } = work;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent || undefined}>
        {hero.body || undefined}
      </PageHero>

      <WorkTeaser heading={false} />

      <StickerSeam stickers={SEAM_STICKERS.work.recent} />
      <Work title={work.recentTitle} tabs={work.recentTabs} />
    </>
  );
}
