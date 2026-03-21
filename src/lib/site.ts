export const siteConfig = {
  name: "Article Site Starter",
  shortName: "ArticleSite",
  description:
    "一个基于 Next.js 16、shadcn/ui、Prisma 和 SQLite 的文章社区站点，支持阅读、评论、点赞与后续 SEO 扩展。",
  keywords: [
    "文章网站",
    "内容社区",
    "Next.js",
    "shadcn/ui",
    "Prisma",
    "SQLite",
    "UnoCSS",
    "SEO",
  ],
  get url() {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  },
  ogImage: "/og-image.png",
  author: "David",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
