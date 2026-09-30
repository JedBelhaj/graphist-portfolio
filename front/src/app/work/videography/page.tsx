import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Videography from "@/components/Videography";

export const metadata: Metadata = {
  title: "Videography",
  description: "Brand films, reels and event coverage shot and edited in-house by Soltani Media.",
};

export default function VideographyPage() {
  return (
    <>
      <PageHero eyebrow="Work / Videography" title="Videography">
        Brand films, short-form verticals and event coverage — shot, directed and cut in-house.
      </PageHero>

      <Videography />
    </>
  );
}
