import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const TITLE = `${BRAND.name} — Photo, Video & Marketing Studio`;
const DESCRIPTION =
  "Soltani Media & Marketing is a production and marketing studio. Brand photography, video, short-form social and the campaigns that put them to work — one team, brief to reporting.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BRAND.domain}`),
  title: {
    default: TITLE,
    template: `%s | ${BRAND.short}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
