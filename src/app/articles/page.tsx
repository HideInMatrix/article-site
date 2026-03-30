import type { Metadata } from "next";

import { AdUnit } from "@/components/ads/ad-unit";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { FadeIn } from "@/components/motion/fade-in";
import { PaginationNav } from "@/components/pagination-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getRequestLocale, getUiText } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const feedAdSlot = process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_FEED || "";
const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isZhHant = locale === "zh-Hant";

  return {
    title: isZhHant ? "文章列表" : "Articles",
    description: isZhHant
      ? "瀏覽最新發布的文章，按關鍵字、分類與標籤探索內容。"
      : "Browse the latest articles and explore by keyword, category, and tag.",
    alternates: {
      canonical: "/articles",
    },
    openGraph: {
      title: isZhHant ? "文章列表" : "Articles",
      description: isZhHant ? "瀏覽最新發布的文章。" : "Browse the latest published articles.",
      url: absoluteUrl("/articles"),
    },
  };
}

type ArticlesPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const [params, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const t = getUiText(locale);

  const where = {
    AND: [
      q
        ? {
            OR: [
              { title: { contains: q } },
              { titleEn: { contains: q } },
              { titleZhHant: { contains: q } },
              { excerpt: { contains: q } },
              { excerptEn: { contains: q } },
              { excerptZhHant: { contains: q } },
              { content: { contains: q } },
              { contentEn: { contains: q } },
              { contentZhHant: { contains: q } },
              { authorName: { contains: q } },
            ],
          }
        : {},
      category ? { category } : {},
      tag
        ? {
            tags: {
              some: {
                tag: {
                  slug: tag,
                },
              },
            },
          }
        : {},
    ],
  };

  const [articles, totalCount, categoriesRaw, tags] = await Promise.all([
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
    prisma.article.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
    }),
    prisma.tag.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const categories = categoriesRaw.map((item) => item.category);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <FadeIn>
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur lg:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <Badge variant="secondary" className="rounded-full px-3 py-1.5">{t.articleListTitle}</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">{t.articleListTitle}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{t.articleListLead}</p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <ArticleFilters
          locale={locale}
          state={{ q, category, tag }}
          categories={categories}
          tags={tags.map((item) => ({ slug: item.slug, name: item.name, count: item._count.articles }))}
          resultCount={totalCount}
        />
      </FadeIn>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {articles.length === 0 ? (
          <Card className="col-span-full rounded-[1.75rem] border-dashed border-slate-300 bg-white/88 shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">{t.noResults}</CardContent>
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
                <FadeIn key="feed-ad-articles" delay={0.16} className="lg:col-span-3">
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
        basePath="/articles"
        locale={locale}
        query={{ q: q || undefined, category: category || undefined, tag: tag || undefined }}
      />
    </main>
  );
}
