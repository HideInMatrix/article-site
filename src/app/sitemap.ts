import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articles.map((article) => ({
      url: `${siteConfig.url}/articles/${article.slug}`,
      lastModified: article.updatedAt ?? article.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
