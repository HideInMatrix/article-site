import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "文章列表",
  description: "浏览最新发布的文章、讨论和点赞数据，查看内容社区的最新更新。",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "文章列表",
    description: "浏览最新发布的文章、讨论和点赞数据。",
    url: absoluteUrl("/articles"),
  },
};

type ArticlesPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";

  const where = {
    AND: [
      q
        ? {
            OR: [
              { title: { contains: q } },
              { excerpt: { contains: q } },
              { content: { contains: q } },
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

  const [articles, categoriesRaw, tags] = await Promise.all([
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
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    }),
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

  const categories = categoriesRaw.map((item) => item.category);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <FadeIn>
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur lg:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <Badge variant="secondary" className="rounded-full px-3 py-1.5">文章列表页</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">最新文章</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            这里已经支持按关键词搜索、按分类筛选、按标签聚合浏览。后面接 CMS 或后台时，优先替换内容录入流程就行。
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <ArticleFilters
          state={{ q, category, tag }}
          categories={categories}
          tags={tags.map((item) => ({ slug: item.slug, name: item.name, count: item._count.articles }))}
          resultCount={articles.length}
        />
      </FadeIn>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {articles.length === 0 ? (
          <Card className="col-span-full rounded-[1.75rem] border-dashed border-slate-300 bg-white/88 shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              没找到符合条件的文章，试试换个关键词或清空筛选。
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
