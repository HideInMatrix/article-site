export const dynamic = "force-dynamic";

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
            修改英文与繁体中文双语内容，保存后会同步更新前台页面。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error === "incomplete"
                ? "文章信息不完整，请补齐必填字段。"
                : error === "duplicate"
                  ? "保存失败：slug 或其他唯一字段与现有文章冲突。"
                  : error === "missing"
                    ? "保存失败：未找到对应文章。"
                    : "保存失败：内容已填写完整时，通常不是缺字段，而是后端保存过程出错了。请重试或检查 slug 是否重复。"}
            </div>
          ) : null}
          <form action={updateArticleAction} className="grid gap-5">
            <input type="hidden" name="articleId" value={article.id} />
            <div className="grid gap-5 md:grid-cols-2">
              <Input name="titleEn" placeholder="English title" required defaultValue={article.titleEn ?? article.title} />
              <Input name="titleZhHant" placeholder="繁體中文標題" required defaultValue={article.titleZhHant ?? article.title} />
            </div>
            <Input name="slug" placeholder="URL slug（可留空自动生成）" defaultValue={article.slug} />
            <div className="grid gap-5 md:grid-cols-2">
              <Textarea name="excerptEn" placeholder="English excerpt" required className="min-h-24" defaultValue={article.excerptEn ?? article.excerpt} />
              <Textarea name="excerptZhHant" placeholder="繁體中文摘要" required className="min-h-24" defaultValue={article.excerptZhHant ?? article.excerpt} />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Input name="category" placeholder="分类，如：AI热点 / 科技热点" required defaultValue={article.category} />
              <Input name="authorName" placeholder="作者名" required defaultValue={article.authorName} />
              <Input name="readTimeMinutes" type="number" min={1} placeholder="阅读分钟数" required defaultValue={article.readTimeMinutes} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                name="tags"
                placeholder="标签，逗号分隔，如：AI, Tech, Startups"
                defaultValue={article.tags.map((item) => item.tag.name).join(", ")}
              />
              <Input name="publishedAt" type="datetime-local" defaultValue={toDatetimeLocalValue(article.publishedAt)} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Textarea name="contentEn" placeholder="English markdown content" required className="min-h-[320px]" defaultValue={article.contentEn ?? article.content} />
              <Textarea name="contentZhHant" placeholder="繁體中文 Markdown 正文" required className="min-h-[320px]" defaultValue={article.contentZhHant ?? article.content} />
            </div>
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
