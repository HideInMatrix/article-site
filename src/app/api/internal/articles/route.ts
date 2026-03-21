import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { assertInternalApiToken } from "@/lib/internal-api";
import { createArticleRecord, normalizeArticleInput } from "@/lib/article-admin";

export async function POST(request: NextRequest) {
  try {
    assertInternalApiToken(request);
    const body = await request.json();
    const articleInput = normalizeArticleInput(body ?? {});
    const article = await createArticleRecord(articleInput);

    revalidatePath("/");
    revalidatePath("/articles");
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

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
