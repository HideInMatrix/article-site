"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, createAdminSession, validateAdminCredentials } from "@/lib/auth";
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
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const readTimeMinutes = Number(String(formData.get("readTimeMinutes") ?? "0"));
  const publishedAtInput = String(formData.get("publishedAt") ?? "").trim();
  const tagInput = String(formData.get("tags") ?? "").trim();

  if (!title || !excerpt || !content || !category || !authorName || !readTimeMinutes) {
    redirect("/admin/articles/new?error=1");
  }

  const slug = slugify(slugInput || title);
  const tags = Array.from(
    new Set(
      tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      authorName,
      readTimeMinutes,
      publishedAt: publishedAtInput ? new Date(publishedAtInput) : new Date(),
      tags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { slug: slugify(name) },
              create: {
                name,
                slug: slugify(name),
              },
            },
          },
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/admin");

  redirect(`/admin?created=${article.slug}`);
}
