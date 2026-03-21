"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  requireAdminSession,
  validateAdminCredentials,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTags(tagInput: string) {
  return Array.from(
    new Set(
      tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
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

async function cleanupUnusedTags() {
  await prisma.tag.deleteMany({
    where: {
      articles: {
        none: {},
      },
    },
  });
}

function normalizeArticleInput(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const readTimeMinutes = Number(String(formData.get("readTimeMinutes") ?? "0"));
  const publishedAtInput = String(formData.get("publishedAt") ?? "").trim();
  const tagInput = String(formData.get("tags") ?? "").trim();

  return {
    title,
    slug: slugify(slugInput || title),
    excerpt,
    content,
    category,
    authorName,
    readTimeMinutes,
    publishedAt: publishedAtInput ? new Date(publishedAtInput) : new Date(),
    tags: parseTags(tagInput),
  };
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!validateAdminCredentials(username, password)) {
    redirect("/login?error=1");
  }

  await createAdminSession(username);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function createArticleAction(formData: FormData) {
  await requireAdminSession();

  const articleInput = normalizeArticleInput(formData);

  if (
    !articleInput.title ||
    !articleInput.excerpt ||
    !articleInput.content ||
    !articleInput.category ||
    !articleInput.authorName ||
    !articleInput.readTimeMinutes
  ) {
    redirect("/admin/articles/new?error=1");
  }

  const article = await prisma.article.create({
    data: {
      title: articleInput.title,
      slug: articleInput.slug,
      excerpt: articleInput.excerpt,
      content: articleInput.content,
      category: articleInput.category,
      authorName: articleInput.authorName,
      readTimeMinutes: articleInput.readTimeMinutes,
      publishedAt: articleInput.publishedAt,
      tags: {
        create: await connectOrCreateTags(articleInput.tags),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/admin");

  redirect(`/admin?created=${article.slug}`);
}

export async function updateArticleAction(formData: FormData) {
  await requireAdminSession();

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    redirect("/admin?error=1");
  }

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });

  if (!existing) {
    redirect("/admin?error=1");
  }

  const articleInput = normalizeArticleInput(formData);

  if (
    !articleInput.title ||
    !articleInput.excerpt ||
    !articleInput.content ||
    !articleInput.category ||
    !articleInput.authorName ||
    !articleInput.readTimeMinutes
  ) {
    redirect(`/admin/articles/${articleId}/edit?error=1`);
  }

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      title: articleInput.title,
      slug: articleInput.slug,
      excerpt: articleInput.excerpt,
      content: articleInput.content,
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

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${existing.slug}`);
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/articles/${articleId}/edit`);

  redirect(`/admin?updated=${article.slug}`);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdminSession();

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    redirect("/admin?error=1");
  }

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });

  if (!existing) {
    redirect("/admin?error=1");
  }

  await prisma.article.delete({
    where: { id: articleId },
  });

  await cleanupUnusedTags();

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${existing.slug}`);
  revalidatePath("/admin");

  redirect(`/admin?deleted=${existing.slug}`);
}
