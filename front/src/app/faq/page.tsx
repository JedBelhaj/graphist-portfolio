import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import PageHero from "@/components/PageHero";
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

      <Faq />
    </>
  );
}
