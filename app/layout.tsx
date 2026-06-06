import type { Metadata } from "next";
import { Fraunces, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display serif — warm, editorial, characterful (with optical-size soft serifs).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body — purpose-built for Vietnamese diacritics.
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Microtype — accession numbers, labels, kickers.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bảo Tàng 1 Phút — One-Minute Museum",
  description:
    "Biến những vật bình thường quanh bạn thành một triển lãm mini, đọc trong một phút.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      // Root <html>/<body> attributes can differ between SSR and the client
      // (next/font hashing in dev, or browser extensions injecting attributes).
      // Suppress the warning at this single level only.
      suppressHydrationWarning
      className={`${fraunces.variable} ${beVietnam.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <div className="grain" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
