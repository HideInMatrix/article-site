import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
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

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
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

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <FadeIn>
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur lg:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <Badge variant="secondary" className="rounded-full px-3 py-1.5">文章列表页</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">最新文章</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            这里已经从本地 SQLite 数据库读取文章、评论数量和点赞数量。后面接 CMS 或后台时，优先替换内容录入流程就行。
          </p>
        </section>
      </FadeIn>

      <section className="grid gap-5 lg:grid-cols-3">
        {articles.map((article, index) => (
          <FadeIn key={article.id} delay={index * 0.05}>
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
              }}
            />
          </FadeIn>
        ))}
      </section>
    </main>
  );
}
