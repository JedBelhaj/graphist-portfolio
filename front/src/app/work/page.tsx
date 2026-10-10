import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import WorkTeaser from "@/components/WorkTeaser";
import Work from "@/components/Work";

export const metadata: Metadata = {
  title: "Work",
  description: "Photography, videography and web design from Soltani Media — brand, product, event, short-form and web work.",
};

export default function WorkPage() {
  return (
    <>
      <PageHero eyebrow="Work" title="Made to be seen," accent="then remembered.">
        A look at what we shoot and cut. Pick a lane below, or scroll for a mix of recent projects.
      </PageHero>

      <WorkTeaser heading={false} />

      <Work />
    </>
  );
}
