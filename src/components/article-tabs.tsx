"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard, type ArticleCardItem } from "@/components/article-card";

export function ArticleTabs({ articles }: { articles: ArticleCardItem[] }) {
  const categories = ["全部", ...new Set(articles.map((article) => article.category))];

  return (
    <Tabs defaultValue="全部" className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-white p-2 shadow-sm">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category} className="rounded-xl px-4 py-2">
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => {
        const visibleArticles = category === "全部" ? articles : articles.filter((article) => article.category === category);

        return (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid gap-5 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
