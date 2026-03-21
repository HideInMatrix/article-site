function getEnv(name: string, fallback: string) {
  return process.env[name] || fallback;
}

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const siteConfig = {
  name: getEnv("NEXT_PUBLIC_SITE_NAME", "Article Site Starter"),
  shortName: getEnv("NEXT_PUBLIC_SITE_SHORT_NAME", "ArticleSite"),
  description: getEnv(
    "NEXT_PUBLIC_SITE_DESCRIPTION",
    "一个专注于文章阅读、讨论与点赞的内容网站。"
  ),
  keywords: parseKeywords(
    getEnv(
      "NEXT_PUBLIC_SITE_KEYWORDS",
      "文章网站,内容社区,阅读,评论,点赞,SEO,GEO"
    )
  ),
  get url() {
    return getEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  },
  ogImage: getEnv("NEXT_PUBLIC_SITE_OG_IMAGE", "/og-image.png"),
  author: getEnv("NEXT_PUBLIC_SITE_AUTHOR", "David"),
  locale: getEnv("NEXT_PUBLIC_SITE_LOCALE", "zh_CN"),
  language: getEnv("NEXT_PUBLIC_SITE_LANGUAGE", "zh-CN"),
  category: getEnv("NEXT_PUBLIC_SITE_CATEGORY", "news"),
  xHandle: getEnv("NEXT_PUBLIC_SITE_X_HANDLE", "@example"),
  geoSummary: getEnv(
    "NEXT_PUBLIC_SITE_GEO_SUMMARY",
    "这是一个以文章阅读为核心的网站，用户可以浏览、搜索、按分类筛选、按标签筛选、阅读详情、评论和点赞。"
  ),
  geoAudience: getEnv(
    "NEXT_PUBLIC_SITE_GEO_AUDIENCE",
    "对内容运营、产品设计、社区增长和写作方法感兴趣的读者。"
  ),
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function keywordText(extraKeywords: string[] = []) {
  return Array.from(new Set([...siteConfig.keywords, ...extraKeywords])).join(", ");
}
