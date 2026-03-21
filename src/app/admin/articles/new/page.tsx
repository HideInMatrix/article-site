import { createArticleAction } from "@/app/admin/actions";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type NewArticlePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const { error } = await searchParams;

  return (
    <FadeIn>
      <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">新建文章</CardTitle>
          <CardDescription>
            这是当前最简单的一版后台内容录入。直接填写文章信息、标签和正文，即可发布到前台页面。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              文章信息不完整，请补齐必填字段。
            </div>
          ) : null}
          <form action={createArticleAction} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input name="title" placeholder="文章标题" required />
              <Input name="slug" placeholder="URL slug（可留空自动生成）" />
            </div>
            <Textarea name="excerpt" placeholder="文章摘要" required className="min-h-24" />
            <div className="grid gap-5 md:grid-cols-3">
              <Input name="category" placeholder="分类，如：产品设计" required />
              <Input name="authorName" placeholder="作者名" required defaultValue="David" />
              <Input name="readTimeMinutes" type="number" min={1} placeholder="阅读分钟数" required defaultValue="6" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input name="tags" placeholder="标签，逗号分隔，如：SEO, 增长, 产品" />
              <Input name="publishedAt" type="datetime-local" />
            </div>
            <Textarea name="content" placeholder="正文内容，段落之间空一行。" required className="min-h-[280px]" />
            <div className="flex justify-end">
              <Button type="submit" className="rounded-2xl px-6 shadow-sm">
                发布文章
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
