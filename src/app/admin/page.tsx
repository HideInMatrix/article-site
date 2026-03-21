import Link from "next/link";

import { deleteArticleAction } from "@/app/admin/actions";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { created, updated, deleted } = await searchParams;
  const articles = await prisma.article.findMany({
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

  return (
    <section className="space-y-6">
      {created ? (
        <FadeIn>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            文章已发布：<span className="font-medium">{created}</span>
          </div>
        </FadeIn>
      ) : null}

      {updated ? (
        <FadeIn>
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
            文章已更新：<span className="font-medium">{updated}</span>
          </div>
        </FadeIn>
      ) : null}

      {deleted ? (
        <FadeIn>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            文章已删除：<span className="font-medium">{deleted}</span>
          </div>
        </FadeIn>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {articles.map((article, index) => (
          <FadeIn key={article.id} delay={index * 0.04}>
            <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">{article.category}</Badge>
                  <span className="text-xs text-slate-500">{article.slug}</span>
                </div>
                <CardTitle className="text-xl leading-8 tracking-tight">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <p className="line-clamp-3">{article.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((item) => (
                    <span key={item.tag.slug} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      #{item.tag.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{article.authorName}</span>
                  <span>{article.readTimeMinutes} min</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Intl.DateTimeFormat("zh-CN").format(article.publishedAt)}</span>
                  <span>{article._count.likes} 点赞</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href={`/articles/${article.slug}`}>查看</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href={`/admin/articles/${article.id}/edit`}>编辑</Link>
                  </Button>
                  <form action={deleteArticleAction}>
                    <input type="hidden" name="articleId" value={article.id} />
                    <Button type="submit" variant="destructive" className="w-full rounded-2xl">
                      删除
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
