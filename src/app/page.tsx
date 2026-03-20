import {
  ArrowRight,
  BookOpenText,
  Clock3,
  Flame,
  Heart,
  MessageCircle,
  PenSquare,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featuredArticles = [
  {
    title: "怎么设计一篇会让人愿意读完的长文？",
    summary: "从标题、引子、段落节奏到结尾互动，把阅读完成率真正做起来。",
    category: "写作方法",
    likes: 128,
    comments: 34,
    readTime: "8 分钟",
  },
  {
    title: "社区冷启动：前 100 位读者到底该怎么来？",
    summary: "不是靠投广告，而是靠内容结构、选题策略和讨论机制一起拉动。",
    category: "社区增长",
    likes: 96,
    comments: 21,
    readTime: "6 分钟",
  },
  {
    title: "点赞、收藏、评论，分别应该在什么时机出现？",
    summary: "交互越多不一定越好，关键是减少打断感，让参与动作更自然。",
    category: "产品设计",
    likes: 74,
    comments: 18,
    readTime: "5 分钟",
  },
];

const hotTopics = [
  "你最希望文章站支持什么讨论机制？",
  "长评论楼层该平铺还是折叠？",
  "作者个人页最应该放哪些信息？",
];

const stats = [
  { label: "已发布文章", value: "128" },
  { label: "活跃讨论", value: "2.4k" },
  { label: "本周新增点赞", value: "9.8k" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f8fafc_45%,_#e2e8f0)] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-400/30">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">文章社区模板</p>
              <h1 className="text-lg font-semibold tracking-tight">Article Site Starter</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">
              <Sparkles className="h-4 w-4" />
              Next.js 16
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700 ring-1 ring-sky-200">
              <PenSquare className="h-4 w-4" />
              UnoCSS + Wind4
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <Flame className="h-4 w-4 text-orange-500" />
              面向阅读、讨论、点赞的内容网站骨架
            </div>

            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-5xl">
              先把内容站跑起来，
              <span className="block text-slate-500">再慢慢长成真正的社区产品。</span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
              这个起始页已经接好了 TypeScript、Next.js 16、lucide-react 和 UnoCSS（Wind4 预设），适合继续往文章阅读、评论互动、点赞系统和作者主页扩展。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl px-5 shadow-lg shadow-slate-300">
                <a href="#featured">
                  查看示例内容
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl px-5">
                <a href="#topics">浏览讨论主题</a>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-5 ring-1 ring-slate-200">
                  <div className="text-2xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-950 p-7 text-slate-50 shadow-xl shadow-slate-300/50">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                运营视角
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">适合从 MVP 开始</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                先验证阅读与讨论，再决定是否加入推荐流、会员体系、创作者中心或积分机制。
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                  <span>文章阅读</span>
                  <span className="font-medium text-white">已就位</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                  <span>点赞系统</span>
                  <span className="font-medium text-white">待接后端</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                  <span>评论讨论</span>
                  <span className="font-medium text-white">待接数据库</span>
                </div>
              </div>
            </div>

            <div id="topics" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Users className="h-4 w-4 text-violet-500" />
                热门讨论
              </div>
              <div className="space-y-3">
                {hotTopics.map((topic) => (
                  <div
                    key={topic}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/70">
            <CardHeader>
              <CardTitle className="text-lg">shadcn/ui 已接入</CardTitle>
              <CardDescription>
                现在项目里已经可以直接使用 Button、Card，并继续通过 shadcn add 扩展更多组件。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>默认按钮</Button>
              <Button variant="secondary">次级按钮</Button>
              <Button variant="outline">描边按钮</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/70">
            <CardHeader>
              <CardTitle className="text-lg">后续可直接加组件</CardTitle>
              <CardDescription>
                比如 dialog、dropdown-menu、sheet、tabs、form、toast。
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-600">
              命令示例：<code className="rounded bg-slate-100 px-2 py-1 text-slate-800">pnpm dlx shadcn@latest add dialog</code>
            </CardContent>
          </Card>
        </section>

        <section id="featured" className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Featured</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">示例文章卡片</h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-500 ring-1 ring-slate-200">
              可继续接 CMS / 数据库
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <article
                key={article.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {article.category}
                </div>
                <h4 className="mt-4 text-xl font-semibold leading-8 tracking-tight text-slate-950 transition group-hover:text-slate-700">
                  {article.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {article.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500" />
                    {article.likes}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-sky-500" />
                    {article.comments}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
