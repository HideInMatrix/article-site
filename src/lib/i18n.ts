export type SiteLocale = "en" | "zh-Hant";

export const DEFAULT_LOCALE: SiteLocale = "en";
export const LOCALE_COOKIE = "site_locale";

const categoryMap: Record<string, { en: string; "zh-Hant": string }> = {
  "AI热点": { en: "AI News", "zh-Hant": "AI熱點" },
  "科技热点": { en: "Tech News", "zh-Hant": "科技熱點" },
  "时政热点": { en: "Current Affairs", "zh-Hant": "時政熱點" },
  "写作方法": { en: "Writing", "zh-Hant": "寫作方法" },
  "社区增长": { en: "Community Growth", "zh-Hant": "社群成長" },
  "产品设计": { en: "Product Design", "zh-Hant": "產品設計" },
  "AI News": { en: "AI News", "zh-Hant": "AI熱點" },
  "Tech News": { en: "Tech News", "zh-Hant": "科技熱點" },
  "Current Affairs": { en: "Current Affairs", "zh-Hant": "時政熱點" },
};

export function isSupportedLocale(value: string | null | undefined): value is SiteLocale {
  return value === "en" || value === "zh-Hant";
}

export function getLangAttribute(locale: SiteLocale) {
  return locale === "zh-Hant" ? "zh-Hant" : "en";
}

export function getLocaleLabel(locale: SiteLocale) {
  return locale === "zh-Hant" ? "繁中" : "EN";
}

export function translateCategory(category: string, locale: SiteLocale) {
  return categoryMap[category]?.[locale] || category;
}

export function getUiText(locale: SiteLocale) {
  if (locale === "zh-Hant") {
    return {
      siteSubtitle: "每日 AI 與時政熱點",
      allCategories: "全部",
      allArticles: "全部文章",
      articleCategories: "文章分類",
      browseAllArticles: "查看全部文章與篩選頁",
      latestArticles: "最新文章",
      noArticlesForCategory: "這個分類下還沒有文章，換一個分類看看。",
      articleListTitle: "文章列表",
      articleListLead: "這裡已經支援按關鍵字搜尋、按分類篩選、按標籤聚合瀏覽。",
      searchArticles: "搜尋文章",
      clearFilters: "清空篩選",
      categoryFilter: "分類篩選",
      browseByCategory: "按分類瀏覽",
      tagFilter: "標籤篩選",
      aggregateByTag: "按標籤聚合",
      resultsCount: "篇結果",
      noResults: "沒找到符合條件的文章，試試換個關鍵字或清空篩選。",
      sponsored: "贊助內容",
      interaction: "互動",
      likeArticle: "點讚這篇文章",
      unlikeArticle: "取消點讚",
      likeHint: "目前使用匿名訪客 cookie 記錄點讚狀態，後續可無縫切換為登入用戶維度。",
      readTimeUnit: "分鐘閱讀",
    };
  }

  return {
    siteSubtitle: "Daily AI & Current Affairs",
    allCategories: "All",
    allArticles: "All Articles",
    articleCategories: "Categories",
    browseAllArticles: "Browse all articles & filters",
    latestArticles: "Latest Articles",
    noArticlesForCategory: "There are no articles in this category yet. Try another one.",
    articleListTitle: "Articles",
    articleListLead: "Search by keyword, browse by category, and explore by tags.",
    searchArticles: "Search",
    clearFilters: "Clear",
    categoryFilter: "Categories",
    browseByCategory: "Browse by category",
    tagFilter: "Tags",
    aggregateByTag: "Explore by tag",
    resultsCount: "results",
    noResults: "No articles matched your filters. Try another keyword or clear filters.",
    sponsored: "Sponsored",
    interaction: "Interaction",
    likeArticle: "Like this article",
    unlikeArticle: "Unlike this article",
    likeHint: "Likes are currently stored with an anonymous visitor cookie and can be upgraded to signed-in users later.",
    readTimeUnit: "min read",
  };
}

type LocalizedArticleFields = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  titleEn?: string | null;
  titleZhHant?: string | null;
  excerptEn?: string | null;
  excerptZhHant?: string | null;
  contentEn?: string | null;
  contentZhHant?: string | null;
};

export function pickLocalizedArticle<T extends LocalizedArticleFields>(article: T, locale: SiteLocale) {
  if (locale === "zh-Hant") {
    return {
      title: article.titleZhHant || article.title || "",
      excerpt: article.excerptZhHant || article.excerpt || "",
      content: article.contentZhHant || article.content || "",
    };
  }

  return {
    title: article.titleEn || article.title || "",
    excerpt: article.excerptEn || article.excerpt || "",
    content: article.contentEn || article.content || "",
  };
}
