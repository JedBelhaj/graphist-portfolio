import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "www.geteclectic.co",
  description:
    "Create responsive websites from design mockups, enabling designers and businesses to easily launch visually appealing and functional online presences.",
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
