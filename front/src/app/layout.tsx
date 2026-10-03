import type { Metadata } from "next";
import { preload } from "react-dom";
import { BRAND, FONT_BODY } from "@/lib/brand";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

/* Every face, not just the above-fold ones. fonts.css uses font-display:
   optional, so a face that misses its window falls back for the entire page
   view — preloading some but not others would mean headings in two fonts.
   All five together are 152KB and same-origin.

   crossOrigin is required even same-origin: fonts are fetched in CORS mode,
   and without it the browser downloads the file twice. */
const FONT_PRELOADS = [
  "/fonts/acumin-variable.woff2",
  "/fonts/vastago-600.woff2",
  "/fonts/vastago-700.woff2",
  "/fonts/vastago-900.woff2",
  "/fonts/supfonts-desmontilles-400.woff2",
];

const TITLE = `${BRAND.name} — Photo, Video & Marketing Studio`;
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
  /* react-dom's preload rather than a hand-written <link>: it emits the tag
     into <head> without fighting Next's own head management. */
  FONT_PRELOADS.forEach((href) =>
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" }),
  );

  /* data-scroll-behavior lets Next switch off the CSS smooth scroll while it
     jumps to the top of a new page, so route changes don't glide up from the
     footer. In-page anchors still glide. */
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <div className="min-h-full bg-white font-light text-[rgb(51,51,51)]" style={{ fontFamily: FONT_BODY }}>
          <Header />
          <main id="top">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
