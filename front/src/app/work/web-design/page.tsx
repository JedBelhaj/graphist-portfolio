import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import WebDesign from "@/components/WebDesign";

export const metadata: Metadata = {
  title: "Web Design",
  description: "Brand sites, landing pages and online stores designed and built by Soltani Media.",
};

export default function WebDesignPage() {
  return (
    <>
      <PageHero eyebrow="Work / Web Design" title="Web Design">
        Brand sites, landing pages and stores — designed around your content and built to load fast.
      </PageHero>

      <WebDesign />
    </>
  );
}
