import { prisma } from "@/lib/prisma";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseTagsInput(input: unknown) {
  if (Array.isArray(input)) {
    return Array.from(
      new Set(
        input
          .map((item) => String(item).trim())
          .filter(Boolean)
      )
    );
  }

  if (typeof input === "string") {
    return Array.from(
      new Set(
        input
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );
  }

  return [];
}

export type NormalizedArticleInput = {
  title: string;
  titleEn: string;
  titleZhHant: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  excerptZhHant: string;
  content: string;
  contentEn: string;
  contentZhHant: string;
  category: string;
  authorName: string;
  readTimeMinutes: number;
  publishedAt: Date;
  tags: string[];
};

export function normalizeArticleInput(raw: Record<string, unknown>): NormalizedArticleInput {
  const title = String(raw.title ?? "").trim();
  const titleEn = String(raw.titleEn ?? raw.title ?? "").trim();
  const titleZhHant = String(raw.titleZhHant ?? raw.title ?? "").trim();
  const slugInput = String(raw.slug ?? "").trim();
  const excerpt = String(raw.excerpt ?? "").trim();
  const excerptEn = String(raw.excerptEn ?? raw.excerpt ?? "").trim();
  const excerptZhHant = String(raw.excerptZhHant ?? raw.excerpt ?? "").trim();
  const content = String(raw.content ?? "").trim();
  const contentEn = String(raw.contentEn ?? raw.content ?? "").trim();
  const contentZhHant = String(raw.contentZhHant ?? raw.content ?? "").trim();
  const category = String(raw.category ?? "").trim();
  const authorName = String(raw.authorName ?? "").trim();
  const readTimeMinutes = Number(String(raw.readTimeMinutes ?? "0"));
  const publishedAtInput = String(raw.publishedAt ?? "").trim();
  const tags = parseTagsInput(raw.tags);

  const canonicalTitle = title || titleEn || titleZhHant;
  const canonicalExcerpt = excerpt || excerptEn || excerptZhHant;
  const canonicalContent = content || contentEn || contentZhHant;

  return {
    title: canonicalTitle,
    titleEn: titleEn || canonicalTitle,
    titleZhHant: titleZhHant || canonicalTitle,
    slug: slugify(slugInput || canonicalTitle),
    excerpt: canonicalExcerpt,
    excerptEn: excerptEn || canonicalExcerpt,
    excerptZhHant: excerptZhHant || canonicalExcerpt,
    content: canonicalContent,
    contentEn: contentEn || canonicalContent,
    contentZhHant: contentZhHant || canonicalContent,
    category,
    authorName,
    readTimeMinutes,
    publishedAt: publishedAtInput ? new Date(publishedAtInput) : new Date(),
    tags,
  };
}

export function assertArticleInput(articleInput: NormalizedArticleInput) {
  if (
    !articleInput.title ||
    !articleInput.titleEn ||
    !articleInput.titleZhHant ||
    !articleInput.excerpt ||
    !articleInput.excerptEn ||
    !articleInput.excerptZhHant ||
    !articleInput.content ||
    !articleInput.contentEn ||
    !articleInput.contentZhHant ||
    !articleInput.category ||
    !articleInput.authorName ||
    !articleInput.readTimeMinutes ||
    Number.isNaN(articleInput.readTimeMinutes)
  ) {
    throw new Error("INVALID_ARTICLE_INPUT");
  }
}

async function connectOrCreateTags(tagNames: string[]) {
  return tagNames.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { slug: slugify(name) },
        create: {
          name,
          slug: slugify(name),
        },
      },
    },
  }));
}

export async function cleanupUnusedTags() {
  await prisma.tag.deleteMany({
    where: {
      articles: {
        none: {},
      },
    },
  });
}

export async function createArticleRecord(articleInput: NormalizedArticleInput) {
  assertArticleInput(articleInput);

  return prisma.article.create({
    data: {
      title: articleInput.title,
      titleEn: articleInput.titleEn,
      titleZhHant: articleInput.titleZhHant,
      slug: articleInput.slug,
      excerpt: articleInput.excerpt,
      excerptEn: articleInput.excerptEn,
      excerptZhHant: articleInput.excerptZhHant,
      content: articleInput.content,
      contentEn: articleInput.contentEn,
      contentZhHant: articleInput.contentZhHant,
      category: articleInput.category,
      authorName: articleInput.authorName,
      readTimeMinutes: articleInput.readTimeMinutes,
      publishedAt: articleInput.publishedAt,
      tags: {
        create: await connectOrCreateTags(articleInput.tags),
      },
    },
  });
}

export async function upsertArticleRecordBySlug(articleInput: NormalizedArticleInput) {
  assertArticleInput(articleInput);

  const existing = await prisma.article.findUnique({
    where: { slug: articleInput.slug },
    select: { id: true, slug: true },
  });

  if (!existing) {
    const article = await createArticleRecord(articleInput);
    return { article, created: true, previousSlug: null };
  }

  const article = await prisma.article.update({
    where: { id: existing.id },
    data: {
      title: articleInput.title,
      titleEn: articleInput.titleEn,
      titleZhHant: articleInput.titleZhHant,
      slug: articleInput.slug,
      excerpt: articleInput.excerpt,
      excerptEn: articleInput.excerptEn,
      excerptZhHant: articleInput.excerptZhHant,
      content: articleInput.content,
      contentEn: articleInput.contentEn,
      contentZhHant: articleInput.contentZhHant,
      category: articleInput.category,
      authorName: articleInput.authorName,
      readTimeMinutes: articleInput.readTimeMinutes,
      publishedAt: articleInput.publishedAt,
      tags: {
        deleteMany: {},
        create: await connectOrCreateTags(articleInput.tags),
      },
    },
  });

  await cleanupUnusedTags();

  return { article, created: false, previousSlug: existing.slug };
}

export async function updateArticleRecord(articleId: string, articleInput: NormalizedArticleInput) {
  assertArticleInput(articleInput);

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });

  if (!existing) {
    throw new Error("ARTICLE_NOT_FOUND");
  }

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      title: articleInput.title,
      titleEn: articleInput.titleEn,
      titleZhHant: articleInput.titleZhHant,
      slug: articleInput.slug,
      excerpt: articleInput.excerpt,
      excerptEn: articleInput.excerptEn,
      excerptZhHant: articleInput.excerptZhHant,
      content: articleInput.content,
      contentEn: articleInput.contentEn,
      contentZhHant: articleInput.contentZhHant,
      category: articleInput.category,
      authorName: articleInput.authorName,
      readTimeMinutes: articleInput.readTimeMinutes,
      publishedAt: articleInput.publishedAt,
      tags: {
        deleteMany: {},
        create: await connectOrCreateTags(articleInput.tags),
      },
    },
  });

  await cleanupUnusedTags();

  return { article, previousSlug: existing.slug };
}

export async function deleteArticleRecord(articleId: string) {
  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });

  if (!existing) {
    throw new Error("ARTICLE_NOT_FOUND");
  }

  await prisma.article.delete({
    where: { id: articleId },
  });

  await cleanupUnusedTags();

  return existing;
}
