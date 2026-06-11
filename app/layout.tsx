import type { Metadata } from "next";
import { Bricolage_Grotesque, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

// Display — modern grotesque with character; carries headings & pull quotes.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
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

const APP_TITLE = "Bảo Tàng 1 Phút — One-Minute Museum";
const APP_DESC =
  "Biến những vật bình thường quanh bạn thành một triển lãm mini, đọc trong một phút.";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESC,
  applicationName: "Bảo Tàng 1 Phút",
  openGraph: {
    title: APP_TITLE,
    description: APP_DESC,
    type: "website",
    locale: "vi_VN",
    siteName: "Bảo Tàng 1 Phút",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESC,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      // Root <html>/<body> attributes can differ between SSR and the client
      // (next/font hashing in dev, or browser extensions injecting attributes).
      // Suppress the warning at this single level only.
      suppressHydrationWarning
      className={`${display.variable} ${beVietnam.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        {/* No-FOUC: set the theme before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('omm-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <div className="grain" aria-hidden />
        <div className="relative z-10">
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
