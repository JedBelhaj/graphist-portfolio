import type { Metadata } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { preload } from "react-dom";
import { BRAND } from "@/lib/brand";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

/* Three Google faces, each with one job (the handwritten script is the
   fourth, self-hosted — see globals.css):
   - Archivo for headlines. Heavy, wide caps that sit next to the logo's
     lettering; the width axis is loaded so .display can push it wider.
   - Inter Tight for reading.
   - JetBrains Mono for the small camera-readout labels (timecodes, section
     numbers, captions).
   next/font downloads them at build time and serves them from this domain,
   so there is no request to Google from the visitor's browser. */
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--nf-display",
  display: "swap",
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--nf-mono",
  display: "swap",
});

const TITLE = `${BRAND.name} — Photo, Video, Web & Marketing Studio`;
const DESCRIPTION =
  "Soltani Media & Marketing is a production and marketing studio. Brand photography, video, web design, short-form social and the campaigns that put them to work — one team, brief to reporting.";

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
  /* The script face is self-hosted (globals.css) with font-display:
     optional, so it has to arrive early or it sits the page view out.
     crossOrigin is required even same-origin: fonts are fetched in CORS
     mode, and without it the browser downloads the file twice. */
  preload("/fonts/supfonts-desmontilles-400.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  /* data-scroll-behavior lets Next switch off the CSS smooth scroll while it
     jumps to the top of a new page, so route changes don't glide up from the
     footer. In-page anchors still glide. */
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <div className="min-h-full bg-wash font-body text-ink">
          <Header />
          <main id="top">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
