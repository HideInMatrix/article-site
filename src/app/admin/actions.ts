"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  requireAdminSession,
  validateAdminCredentials,
} from "@/lib/auth";
import {
  createArticleRecord,
  deleteArticleRecord,
  normalizeArticleInput,
  updateArticleRecord,
} from "@/lib/article-admin";

function toArticleErrorParam(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "INVALID_ARTICLE_INPUT") return "incomplete";
    if (error.message === "ARTICLE_NOT_FOUND") return "missing";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "duplicate";
  }

  return "save";
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

  const articleInput = normalizeArticleInput(Object.fromEntries(formData.entries()));

  try {
    const article = await createArticleRecord(articleInput);

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin");

    redirect(`/admin?created=${article.slug}`);
  } catch (error) {
    redirect(`/admin/articles/new?error=${toArticleErrorParam(error)}`);
  }
}

export async function updateArticleAction(formData: FormData) {
  await requireAdminSession();

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    redirect("/admin?error=missing");
  }

  const articleInput = normalizeArticleInput(Object.fromEntries(formData.entries()));

  try {
    const { article, previousSlug } = await updateArticleRecord(articleId, articleInput);

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${previousSlug}`);
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin");
    revalidatePath(`/admin/articles/${articleId}/edit`);

    redirect(`/admin?updated=${article.slug}`);
  } catch (error) {
    redirect(`/admin/articles/${articleId}/edit?error=${toArticleErrorParam(error)}`);
  }
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdminSession();

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    redirect("/admin?error=1");
  }

  try {
    const existing = await deleteArticleRecord(articleId);

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${existing.slug}`);
    revalidatePath("/admin");

    redirect(`/admin?deleted=${existing.slug}`);
  } catch {
    redirect("/admin?error=1");
  }
}
