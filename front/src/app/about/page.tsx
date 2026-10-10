import type { Metadata } from "next";
import AboutIntro from "@/components/AboutIntro";
import About from "@/components/About";
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

      <Team />

      <Countries />
    </>
  );
}
