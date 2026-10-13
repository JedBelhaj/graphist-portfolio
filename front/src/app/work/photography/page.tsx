import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import PageHero from "@/components/PageHero";
import Photography from "@/components/Photography";

export const metadata: Metadata = {
  title: "Photography",
  description: "Brand, product, portrait and event photography by Soltani Media.",
};

export default async function PhotographyPage() {
  const { hero } = (await getContent()).photography;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent || undefined}>
        {hero.body || undefined}
      </PageHero>

      <Photography />
    </>
  );
}
