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
            现在支持录入英文与繁体中文双语内容。英文为默认展示语言，繁中用于切换后展示。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error === "incomplete"
                ? "文章信息不完整，请补齐必填字段。"
                : error === "duplicate"
                  ? "创建失败：slug 或其他唯一字段与现有文章冲突。"
                  : "创建失败：不是单纯缺字段，可能是保存过程或唯一约束出了问题。"}
            </div>
          ) : null}
          <form action={createArticleAction} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input name="titleEn" placeholder="English title" required />
              <Input name="titleZhHant" placeholder="繁體中文標題" required />
            </div>
            <Input name="slug" placeholder="URL slug（可留空自动生成）" />
            <div className="grid gap-5 md:grid-cols-2">
              <Textarea name="excerptEn" placeholder="English excerpt" required className="min-h-24" />
              <Textarea name="excerptZhHant" placeholder="繁體中文摘要" required className="min-h-24" />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Input name="category" placeholder="分类，如：AI热点 / 科技热点" required />
              <Input name="authorName" placeholder="作者名" required defaultValue="Daily News Bot" />
              <Input name="readTimeMinutes" type="number" min={1} placeholder="阅读分钟数" required defaultValue="6" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input name="tags" placeholder="标签，逗号分隔，如：AI, Tech, Startups" />
              <Input name="publishedAt" type="datetime-local" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Textarea name="contentEn" placeholder="English markdown content" required className="min-h-[320px]" />
              <Textarea name="contentZhHant" placeholder="繁體中文 Markdown 正文" required className="min-h-[320px]" />
            </div>
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
