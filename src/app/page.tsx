import type { Metadata } from "next";

import { AdUnit } from "@/components/ads/ad-unit";
import { ArticleCard } from "@/components/article-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, keywordText, siteConfig } from "@/lib/site";

const feedAdSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_FEED || "";

export const metadata: Metadata = {
  title: "首页",
  description: "阅读最新文章，按顶部分类快速切换，浏览这个内容网站的最新发布内容。",
  keywords: keywordText(["首页", "最新文章", "分类阅读"]),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: "阅读最新文章，按顶部分类快速切换。",
    url: absoluteUrl("/"),
    images: [siteConfig.ogImage],
  },
};

type HomePageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { category } = await searchParams;
  const activeCategory = category?.trim() ?? "";

  const articles = await prisma.article.findMany({
    where: activeCategory ? { category: activeCategory } : undefined,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeCategory ? `${activeCategory} 文章` : siteConfig.name,
    description: activeCategory
      ? `浏览 ${activeCategory} 分类下的最新文章。`
      : siteConfig.geoSummary,
    url: activeCategory ? absoluteUrl(`/?category=${encodeURIComponent(activeCategory)}`) : siteConfig.url,
    inLanguage: siteConfig.language,
    audience: {
      "@type": "Audience",
      audienceType: siteConfig.geoAudience,
    },
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {articles.length === 0 ? (
          <Card className="col-span-full rounded-[1.75rem] border-dashed border-slate-300 bg-white/88 shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              这个分类下还没有文章，换一个分类看看。
            </CardContent>
          </Card>
        ) : (
          articles.flatMap((article, index) => {
            const nodes = [
              <FadeIn key={article.id} delay={index * 0.04}>
                <ArticleCard
                  article={{
                    id: article.id,
                    slug: article.slug,
                    title: article.title,
                    excerpt: article.excerpt,
                    category: article.category,
                    authorName: article.authorName,
                    publishedAt: article.publishedAt,
                    readTimeMinutes: article.readTimeMinutes,
                    likeCount: article._count.likes,
                    tags: article.tags.map((item) => ({
                      slug: item.tag.slug,
                      name: item.tag.name,
                    })),
                  }}
                />
              </FadeIn>,
            ];

            if (index === 2 && feedAdSlot) {
              nodes.push(
                <FadeIn key="feed-ad-home" delay={0.16} className="lg:col-span-3">
                  <AdUnit slot={feedAdSlot} label="赞助内容" minHeight={160} />
                </FadeIn>
              );
            }

            return nodes;
          })
        )}
      </section>
    </main>
  );
}
