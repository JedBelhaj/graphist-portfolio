import type { Metadata } from "next";
import { SEAM_STICKERS } from "@/lib/content";
import AboutIntro from "@/components/AboutIntro";
import About from "@/components/About";
import StickerSeam from "@/components/StickerSeam";
import Team from "@/components/Team";
import Countries from "@/components/Countries";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who Soltani Media is, how we work, and the team behind the camera.",
};

export default function AboutPage() {
  return (
    <>
      <AboutIntro page />

      <About />

      <StickerSeam stickers={SEAM_STICKERS.about.team} />
      <Team />

      <StickerSeam stickers={SEAM_STICKERS.about.countries} />
      <Countries />
    </>
  );
}
