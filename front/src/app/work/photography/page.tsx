import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Photography from "@/components/Photography";

export const metadata: Metadata = {
  title: "Photography",
  description: "Brand, product, portrait and event photography by Soltani Media.",
};

export default function PhotographyPage() {
  return (
    <>
      <PageHero eyebrow="Work / Photography" title="Photography">
        Brand, product, portrait and event stills — lit for the crop you actually need.
      </PageHero>

      <Photography />
    </>
  );
}
