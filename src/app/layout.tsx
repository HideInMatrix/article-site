import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

import { GoogleAdSenseScript } from "@/components/ads/google-adsense-script";
import { SiteHeader } from "@/components/site-header";
import { getLangAttribute } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: siteConfig.category,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.xHandle,
    creator: siteConfig.xHandle,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, locale] = await Promise.all([
    prisma.article.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    getRequestLocale(),
  ]);

  return (
    <html lang={getLangAttribute(locale)}>
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f8fafc_45%,_#e2e8f0)] text-slate-900 antialiased">
        <GoogleAdSenseScript />
        <SiteHeader categories={categories.map((item) => item.category)} locale={locale} />
        {children}
      </body>
    </html>
  );
}
