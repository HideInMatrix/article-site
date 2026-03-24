"use client";

import { ArticleCard, type ArticleCardItem } from "@/components/article-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateCategory, type SiteLocale } from "@/lib/i18n";

export function ArticleTabs({ articles, locale }: { articles: ArticleCardItem[]; locale: SiteLocale }) {
  const allLabel = locale === "zh-Hant" ? "全部" : "All";
  const categories = ["", ...new Set(articles.map((article) => article.category))];

  return (
    <Tabs defaultValue="" className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-white p-2 shadow-sm">
        <TabsTrigger value="" className="rounded-xl px-4 py-2">
          {allLabel}
        </TabsTrigger>
        {categories.filter(Boolean).map((category) => (
          <TabsTrigger key={category} value={category} className="rounded-xl px-4 py-2">
            {translateCategory(category, locale)}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => {
        const visibleArticles = category === "" ? articles : articles.filter((article) => article.category === category);

        return (
          <TabsContent key={category || "all"} value={category} className="mt-0">
            <div className="grid gap-5 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
