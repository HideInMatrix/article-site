import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Heart, MessageCircle, TimerReset } from "lucide-react";

import { addCommentAction, toggleArticleLikeAction } from "@/app/actions";
import { FadeIn } from "@/components/motion/fade-in";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatReadTime, getInitials, renderArticleBlocks } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
      likes: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) {
    return {
      title: "文章不存在",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: absoluteUrl(`/articles/${article.slug}`),
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.authorName],
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const cookieStore = await cookies();
  const visitorId = cookieStore.get("article_site_visitor_id")?.value;
  const hasLiked = visitorId ? article.likes.some((like) => like.visitorId === visitorId) : false;

  const likeAction = toggleArticleLikeAction.bind(null, article.id, ["/", "/articles", `/articles/${article.slug}`]);
  const commentAction = addCommentAction.bind(null, article.id, ["/", "/articles", `/articles/${article.slug}`]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };

  return (
    <main className="mx-auto max-w-4xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="space-y-8">
        <FadeIn>
          <header className="space-y-5 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur lg:p-10">
            <Badge variant="secondary" className="rounded-full px-3 py-1.5">{article.category}</Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-5xl">{article.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">{article.excerpt}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span>{article.authorName}</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5">
                <TimerReset className="h-4 w-4" />
                {formatReadTime(article.readTimeMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                <Heart className="h-4 w-4" />
                {article._count.likes}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                <MessageCircle className="h-4 w-4" />
                {article._count.comments}
              </span>
            </div>
          </header>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <FadeIn delay={0.05}>
            <Card className="rounded-[2rem] border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/60">
              <CardContent className="space-y-6 p-8 text-base leading-8 text-slate-700 lg:p-10">
                {renderArticleBlocks(article.content).map((block, index) => (
                  <p key={`${article.id}-${index}`}>{block}</p>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/60">
                <CardHeader>
                  <CardTitle className="text-lg">互动</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form action={likeAction}>
                    <Button type="submit" className="w-full rounded-2xl shadow-sm">
                      <Heart className="h-4 w-4" />
                      {hasLiked ? "取消点赞" : "点赞这篇文章"}
                    </Button>
                  </form>
                  <p className="text-sm leading-6 text-muted-foreground">
                    当前使用匿名访客 cookie 标记点赞状态，后续接登录系统后可无缝替换为用户维度。
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/60">
                <CardHeader>
                  <CardTitle className="text-lg">发表评论</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={commentAction} className="space-y-4">
                    <Input name="authorName" placeholder="你的名字" required maxLength={40} />
                    <Textarea name="content" placeholder="写下你的观点……" required maxLength={1000} className="min-h-32" />
                    <Button type="submit" variant="secondary" className="w-full rounded-2xl shadow-sm">
                      提交评论
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.18}>
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">评论区</h2>
              <span className="text-sm text-muted-foreground">共 {article._count.comments} 条评论</span>
            </div>
            <div className="space-y-4">
              {article.comments.length === 0 ? (
                <Card className="rounded-[1.75rem] border-dashed border-slate-300 bg-white/80 shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground">还没有评论，来抢个沙发。</CardContent>
                </Card>
              ) : (
                article.comments.map((comment, index) => (
                  <Card key={comment.id} className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border border-border bg-white">
                          <AvatarFallback>{getInitials(comment.authorName) || "CM"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-foreground">{comment.authorName}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</div>
                          </div>
                          <p className="text-sm leading-7 text-slate-700">{comment.content}</p>
                        </div>
                      </div>
                      {index !== article.comments.length - 1 ? <Separator className="mt-6" /> : null}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </FadeIn>
      </article>
    </main>
  );
}
