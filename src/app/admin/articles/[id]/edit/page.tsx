import { notFound } from "next/navigation";

import { updateArticleAction } from "@/app/admin/actions";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

function toDatetimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function EditArticlePage({ params, searchParams }: EditArticlePageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <FadeIn>
      <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">编辑文章</CardTitle>
          <CardDescription>
            修改文章标题、分类、标签和正文内容，保存后会同步更新前台页面。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              文章信息不完整，请补齐必填字段。
            </div>
          ) : null}
          <form action={updateArticleAction} className="grid gap-5">
            <input type="hidden" name="articleId" value={article.id} />
            <div className="grid gap-5 md:grid-cols-2">
              <Input name="title" placeholder="文章标题" required defaultValue={article.title} />
              <Input name="slug" placeholder="URL slug（可留空自动生成）" defaultValue={article.slug} />
            </div>
            <Textarea name="excerpt" placeholder="文章摘要" required className="min-h-24" defaultValue={article.excerpt} />
            <div className="grid gap-5 md:grid-cols-3">
              <Input name="category" placeholder="分类，如：产品设计" required defaultValue={article.category} />
              <Input name="authorName" placeholder="作者名" required defaultValue={article.authorName} />
              <Input name="readTimeMinutes" type="number" min={1} placeholder="阅读分钟数" required defaultValue={article.readTimeMinutes} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                name="tags"
                placeholder="标签，逗号分隔，如：SEO, 增长, 产品"
                defaultValue={article.tags.map((item) => item.tag.name).join(", ")}
              />
              <Input name="publishedAt" type="datetime-local" defaultValue={toDatetimeLocalValue(article.publishedAt)} />
            </div>
            <Textarea name="content" placeholder="正文内容，段落之间空一行。" required className="min-h-[280px]" defaultValue={article.content} />
            <div className="flex justify-end">
              <Button type="submit" className="rounded-2xl px-6 shadow-sm">
                保存修改
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
