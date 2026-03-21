import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { assertInternalApiToken } from "@/lib/internal-api";
import { createArticleRecord, normalizeArticleInput, upsertArticleRecordBySlug } from "@/lib/article-admin";

export async function POST(request: NextRequest) {
  try {
    assertInternalApiToken(request);
    const body = await request.json();
    const articleInput = normalizeArticleInput(body ?? {});
    const upsert = Boolean(body?.upsert);

    const result = upsert
      ? await upsertArticleRecordBySlug(articleInput)
      : { article: await createArticleRecord(articleInput), created: true };

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${result.article.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      ok: true,
      created: result.created,
      article: {
        id: result.article.id,
        slug: result.article.slug,
        title: result.article.title,
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
