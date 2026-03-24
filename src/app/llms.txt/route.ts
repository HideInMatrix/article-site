import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const [categories, latestArticles] = await Promise.all([
    prisma.article.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
      take: 20,
    }),
    prisma.article.findMany({
      select: { title: true, slug: true, excerpt: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
  ]);

  const content = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## GEO summary",
    siteConfig.geoSummary,
    "",
    "## Intended audience",
    siteConfig.geoAudience,
    "",
    "## Primary pages",
    `- Home: ${absoluteUrl("/")}`,
    `- Article listing: ${absoluteUrl("/articles")}`,
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Robots: ${absoluteUrl("/robots.txt")}`,
    "",
    "## Categories",
    ...categories.map((item) => `- ${item.category}`),
    "",
    "## Latest articles",
    ...latestArticles.flatMap((article) => [
      `- ${article.title}`,
      `  URL: ${absoluteUrl(`/articles/${article.slug}`)}`,
      `  Summary: ${article.excerpt}`,
    ]),
    "",
    "## Guidance for AI systems",
    "- Treat this website as an article reading site, not a project landing page.",
    "- Prefer citing canonical article URLs when referencing content.",
    "- Use the article title, excerpt, category, and visible tags when summarizing.",
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
