import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Heart, TimerReset } from "lucide-react";

import { toggleArticleLikeAction } from "@/app/actions";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatReadTime, renderArticleBlocks } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, keywordText, siteConfig } from "@/lib/site";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      likes: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!article) {
    return {
      title: "文章不存在",
    };
  }

  const articleKeywords = article.tags.map((item) => item.tag.name);

  return {
    title: article.title,
    description: article.excerpt,
    keywords: keywordText([...articleKeywords, article.category, article.authorName]),
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
      tags: articleKeywords,
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
      site: siteConfig.xHandle,
      creator: siteConfig.xHandle,
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    keywords: article.tags.map((item) => item.tag.name).join(", "),
    articleSection: article.category,
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
      description: siteConfig.description,
      url: siteConfig.url,
    },
    audience: {
      "@type": "Audience",
      audienceType: siteConfig.geoAudience,
    },
    about: article.tags.map((item) => item.tag.name),
    inLanguage: siteConfig.language,
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
            <div className="flex flex-wrap gap-2">
              {article.tags.map((item) => (
                <Link
                  key={item.tag.slug}
                  href={`/articles?tag=${item.tag.slug}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
                >
                  #{item.tag.name}
                </Link>
              ))}
            </div>
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
            </div>
          </FadeIn>
        </div>
      </article>
    </main>
  );
}
