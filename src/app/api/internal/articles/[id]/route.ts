import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { deleteArticleRecord, normalizeArticleInput, updateArticleRecord } from "@/lib/article-admin";
import { assertInternalApiToken } from "@/lib/internal-api";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    assertInternalApiToken(request);
    const { id } = await context.params;
    const body = await request.json();
    const articleInput = normalizeArticleInput(body ?? {});
    const { article, previousSlug } = await updateArticleRecord(id, articleInput);

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${previousSlug}`);
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      ok: true,
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_INTERNAL_API") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "INVALID_ARTICLE_INPUT") {
      return NextResponse.json({ ok: false, error: "invalid_article_input" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "ARTICLE_NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "article_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    assertInternalApiToken(request);
    const { id } = await context.params;
    const existing = await deleteArticleRecord(id);

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${existing.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, deleted: existing.slug });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_INTERNAL_API") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "ARTICLE_NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "article_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
