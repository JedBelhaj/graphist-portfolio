import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about working with Soltani Media.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Good questions," accent="straight answers." />

      <Faq />
    </>
  );
}
