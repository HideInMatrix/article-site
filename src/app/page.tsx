import Link from "next/link";
import { BarChart3, Heart, MessageCircle, Sparkles, TrendingUp } from "lucide-react";

import { ArticleTabs } from "@/components/article-tabs";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export default async function Home() {
  const [articles, articleCount, commentCount, likeCount] = await Promise.all([
    prisma.article.findMany({
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
    prisma.article.count(),
    prisma.comment.count(),
    prisma.articleLike.count(),
  ]);

  const normalizedArticles = articles.map((article) => ({
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
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/articles?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <FadeIn>
        <section className="relative grid gap-6 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(248,250,252,0.84)_45%,_rgba(226,232,240,0.72))]" />
          <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white/82 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
            <CardContent className="relative p-8 lg:p-10">
              <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
              <div className="absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-violet-100/70 blur-3xl" />
              <div className="relative">
                <Badge variant="secondary" className="mb-6 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-sm font-medium shadow-sm">
                  <Sparkles className="mr-1 h-4 w-4" />
                  已完成：Prisma + SQLite + 评论点赞结构
                </Badge>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-6xl">
                  内容站不只是“能看文章”，
                  <span className="mt-2 block bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent">
                    还要能让人愿意讨论、点赞、回访。
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
                  现在这个项目已经接好了 shadcn/ui、Prisma、SQLite、本地评论和匿名点赞逻辑，后面可以继续往登录、作者中心、内容管理后台和搜索分发扩展。
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="rounded-2xl px-5 shadow-sm">
                    <Link href="/articles">进入文章列表</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-2xl border-white/60 bg-white/80 px-5 shadow-sm">
                    <Link href={articles[0] ? `/articles/${articles[0].slug}` : "/articles"}>查看示例详情页</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="rounded-[1.75rem] border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                  站点数据
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-3 lg:grid-cols-1">
                <div>
                  <div className="text-3xl font-semibold tracking-tight">{articleCount}</div>
                  <p className="text-sm text-muted-foreground">已发布文章</p>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight">{commentCount}</div>
                  <p className="text-sm text-muted-foreground">本地评论</p>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight">{likeCount}</div>
                  <p className="text-sm text-muted-foreground">累计点赞</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[1.75rem] border-slate-900/70 bg-slate-950 text-white shadow-xl shadow-slate-300/40">
              <CardContent className="relative p-6">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                <div className="relative space-y-3 text-sm text-slate-300">
                  <p className="inline-flex items-center gap-2 text-white">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    当前已经补上的能力：
                  </p>
                  <p>• shadcn 组件扩展</p>
                  <p>• 文章列表 / 详情页</p>
                  <p>• SQLite 评论与点赞模型</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Latest articles</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">文章列表页骨架</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700 shadow-sm">
                <Heart className="h-4 w-4" />
                本地点赞已接入
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700 shadow-sm">
                <MessageCircle className="h-4 w-4" />
                评论已接入 SQLite
              </span>
            </div>
          </div>

          <ArticleTabs articles={normalizedArticles} />
        </section>
      </FadeIn>
    </main>
  );
}
