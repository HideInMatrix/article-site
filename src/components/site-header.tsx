"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Menu } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getUiText, translateCategory, type SiteLocale } from "@/lib/i18n";

type SiteHeaderProps = {
  categories: string[];
  locale: SiteLocale;
};

function buildCategoryHref(category: string) {
  return category ? `/?category=${encodeURIComponent(category)}` : "/";
}

export function SiteHeader({ categories, locale }: SiteHeaderProps) {
  const pathname = usePathname();
  const t = getUiText(locale);

  const navItems = [
    { label: t.allCategories, category: "" },
    ...categories.map((category) => ({ label: translateCategory(category, locale), category })),
  ];

  const desktopItems = navItems.slice(0, 6);
  const hiddenCount = Math.max(0, navItems.length - desktopItems.length);

  return (
    <FadeIn>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <Link href="/" className="min-w-0 shrink-0 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/30 ring-1 ring-white/30">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-500">{t.siteSubtitle}</div>
              <div className="truncate text-lg font-semibold tracking-tight text-slate-950">
                {locale === "zh-Hant" ? "每日AI與時政熱點" : "Daily AI & Current Affairs"}
              </div>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
            {desktopItems.map((item) => {
              const isActive = pathname === "/" && item.category === "";
              return (
                <Button
                  key={item.label}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className="max-w-[8.5rem] rounded-full px-4"
                >
                  <Link className="truncate" href={buildCategoryHref(item.category)} title={item.label}>
                    {item.label}
                  </Link>
                </Button>
              );
            })}
            {hiddenCount > 0 ? (
              <Button asChild variant="outline" className="rounded-full px-4 text-slate-500">
                <Link href="/articles">+{hiddenCount}</Link>
              </Button>
            ) : null}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <Button asChild variant="outline" className="rounded-2xl border-white/60 bg-white/80 shadow-sm">
              <Link href="/articles">{t.allArticles}</Link>
            </Button>
            <LanguageSwitcher locale={locale} />
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-2xl border-white/60 bg-white/80 shadow-sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>{t.articleCategories}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                <LanguageSwitcher locale={locale} />
                {navItems.map((item) => (
                  <Button key={item.label} asChild variant="outline" className="justify-start rounded-2xl">
                    <Link href={buildCategoryHref(item.category)}>{item.label}</Link>
                  </Button>
                ))}
                <Separator />
                <Button asChild variant="ghost" className="justify-start rounded-2xl text-slate-500">
                  <Link href="/articles">{t.browseAllArticles}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </FadeIn>
  );
}
