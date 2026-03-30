import type { Metadata } from "next";

import { AdUnit } from "@/components/ads/ad-unit";
import { ArticleCard } from "@/components/article-card";
import { FadeIn } from "@/components/motion/fade-in";
import { PaginationNav } from "@/components/pagination-nav";
import { Card, CardContent } from "@/components/ui/card";
import { getRequestLocale, getUiText } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, keywordText, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const feedAdSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_FEED || "";
const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isZhHant = locale === "zh-Hant";

  return {
    title: isZhHant ? "首頁" : "Home",
    description: isZhHant
      ? "閱讀最新文章，按頂部分類快速切換，瀏覽網站最新內容。"
      : "Read the latest stories, switch categories quickly, and browse the newest articles.",
    keywords: keywordText(isZhHant ? ["首頁", "最新文章", "分類閱讀"] : ["home", "latest articles", "category browsing"]),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: siteConfig.name,
      description: isZhHant ? "閱讀最新文章，按頂部分類快速切換。" : "Read the latest articles and switch categories quickly.",
      url: absoluteUrl("/"),
      images: [siteConfig.ogImage],
    },
  };
}

type HomePageProps = {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const [{ category, page }, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const activeCategory = category?.trim() ?? "";
  const currentPage = Math.max(1, Number(page ?? "1") || 1);
  const t = getUiText(locale);

  const where = activeCategory ? { category: activeCategory } : undefined;

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where,
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
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeCategory ? `${activeCategory} articles` : siteConfig.name,
    description: activeCategory
      ? locale === "zh-Hant"
        ? `瀏覽 ${activeCategory} 分類下的最新文章。`
        : `Browse the latest articles in ${activeCategory}.`
      : siteConfig.geoSummary,
    url: activeCategory ? absoluteUrl(`/?category=${encodeURIComponent(activeCategory)}`) : siteConfig.url,
    inLanguage: locale,
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
              {t.noArticlesForCategory}
            </CardContent>
          </Card>
        ) : (
          articles.flatMap((article, index) => {
            const nodes = [
              <FadeIn key={article.id} delay={index * 0.04}>
                <ArticleCard
                  locale={locale}
                  article={{
                    id: article.id,
                    slug: article.slug,
                    title: article.title,
                    titleEn: article.titleEn,
                    titleZhHant: article.titleZhHant,
                    excerpt: article.excerpt,
                    excerptEn: article.excerptEn,
                    excerptZhHant: article.excerptZhHant,
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
                  <AdUnit slot={feedAdSlot} label={t.sponsored} minHeight={160} />
                </FadeIn>
              );
            }

            return nodes;
          })
        )}
      </section>

      <PaginationNav
        page={currentPage}
        totalPages={totalPages}
        basePath="/"
        locale={locale}
        query={{ category: activeCategory || undefined }}
      />
    </main>
  );
}
