import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, keywordText, siteConfig } from "@/lib/site";

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
          comments: true,
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

      <FadeIn>
        <section className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/82 p-8 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div>
            <p className="text-sm font-medium text-slate-500">Latest reading</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
              {activeCategory ? `${activeCategory} 文章` : "最新文章"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {activeCategory
                ? `当前正在浏览「${activeCategory}」分类下的文章。`
                : "这里直接展示最新发布的文章，你可以通过顶部分类快速切换。"}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
            共 {articles.length} 篇文章
          </div>
        </section>
      </FadeIn>

      <section className="grid gap-5 lg:grid-cols-3">
        {articles.length === 0 ? (
          <Card className="col-span-full rounded-[1.75rem] border-dashed border-slate-300 bg-white/88 shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              这个分类下还没有文章，换一个分类看看。
            </CardContent>
          </Card>
        ) : (
          articles.map((article, index) => (
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
                  commentCount: article._count.comments,
                  likeCount: article._count.likes,
                  tags: article.tags.map((item) => ({
                    slug: item.tag.slug,
                    name: item.tag.name,
                  })),
                }}
              />
            </FadeIn>
          ))
        )}
      </section>
    </main>
  );
}
