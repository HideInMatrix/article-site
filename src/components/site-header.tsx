"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenText, ChevronDown, LayoutList, Menu, PenSquare, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/articles", label: "文章列表" },
];

export function SiteHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <FadeIn>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/30 ring-1 ring-white/30">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">内容社区</div>
              <div className="text-lg font-semibold tracking-tight text-slate-950">Article Site Starter</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Badge variant="secondary" className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 shadow-sm">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Prisma + SQLite
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-2xl border-white/60 bg-white/80 shadow-sm">
                  快速操作
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuLabel>站点入口</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/articles">
                    <LayoutList className="h-4 w-4" />
                    浏览文章
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                  <PenSquare className="h-4 w-4" />
                  投稿说明
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="https://www.prisma.io/docs" target="_blank" rel="noreferrer">
                    Prisma 文档
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl shadow-sm">开始运营</Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>投稿和运营建议</DialogTitle>
                  <DialogDescription>
                    先把文章结构、作者页、评论质量和首页分发路径跑顺，再考虑复杂的推荐流和会员系统。
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                  <p>1. 每周至少产出 2 到 3 篇主题清晰的文章。</p>
                  <p>2. 让每篇文章都能自然引导评论，而不是只停留在阅读。</p>
                  <p>3. 优先观察哪类文章能带来自然回访，再决定后续产品方向。</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-2xl border-white/60 bg-white/80 shadow-sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>站点导航</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="block text-base font-medium text-slate-700">
                    {item.label}
                  </Link>
                ))}
                <Separator />
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>当前已启用：</p>
                  <p>• shadcn/ui 组件</p>
                  <p>• Prisma + SQLite</p>
                  <p>• 点赞与评论数据结构</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </FadeIn>
  );
}
