"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Menu } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type SiteHeaderProps = {
  categories: string[];
};

function buildCategoryHref(category: string) {
  return category ? `/?category=${encodeURIComponent(category)}` : "/";
}

export function SiteHeader({ categories }: SiteHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "全部", category: "" },
    ...categories.map((category) => ({ label: category, category })),
  ];

  return (
    <FadeIn>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/30 ring-1 ring-white/30">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">文章阅读网站</div>
              <div className="text-lg font-semibold tracking-tight text-slate-950">Article Site Starter</div>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === "/" && item.category === "";
              return (
                <Link
                  key={item.label}
                  href={buildCategoryHref(item.category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 md:block">
            <Button asChild variant="outline" className="rounded-2xl border-white/60 bg-white/80 shadow-sm">
              <Link href="/articles">全部文章</Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-2xl border-white/60 bg-white/80 shadow-sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>文章分类</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                {navItems.map((item) => (
                  <Link key={item.label} href={buildCategoryHref(item.category)} className="block text-base font-medium text-slate-700">
                    {item.label}
                  </Link>
                ))}
                <Separator />
                <Link href="/articles" className="block text-sm text-slate-500">
                  查看全部文章与筛选页
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </FadeIn>
  );
}
