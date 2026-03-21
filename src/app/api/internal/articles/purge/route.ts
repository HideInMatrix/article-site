import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { cleanupUnusedTags } from "@/lib/article-admin";
import { assertInternalApiToken } from "@/lib/internal-api";
import { prisma } from "@/lib/prisma";

type PurgePayload = {
  mode?: "all" | "filters";
  confirm?: string;
  dryRun?: boolean;
  authorName?: string;
  category?: string;
  slugPrefixes?: string[];
  titleIncludes?: string[];
};

export async function POST(request: NextRequest) {
  try {
    assertInternalApiToken(request);
    const body = (await request.json()) as PurgePayload;

    const mode = body.mode || "filters";
    const dryRun = Boolean(body.dryRun);
    const slugPrefixes = Array.isArray(body.slugPrefixes) ? body.slugPrefixes.filter(Boolean) : [];
    const titleIncludes = Array.isArray(body.titleIncludes) ? body.titleIncludes.filter(Boolean) : [];

    if (mode === "all" && body.confirm !== "delete-all-articles") {
      return NextResponse.json(
        { ok: false, error: "missing_confirmation", required: "delete-all-articles" },
        { status: 400 }
      );
    }

    const articles = await prisma.article.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        authorName: true,
        category: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    const matched = articles.filter((article) => {
      if (mode === "all") return true;
      if (body.authorName && article.authorName !== body.authorName) return false;
      if (body.category && article.category !== body.category) return false;
      if (slugPrefixes.length > 0 && !slugPrefixes.some((prefix) => article.slug.startsWith(prefix))) return false;
      if (titleIncludes.length > 0 && !titleIncludes.some((part) => article.title.includes(part))) return false;
      return Boolean(body.authorName || body.category || slugPrefixes.length || titleIncludes.length);
    });

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        count: matched.length,
        matched,
      });
    }

    if (matched.length === 0) {
      return NextResponse.json({ ok: true, count: 0, deleted: [] });
    }

    await prisma.article.deleteMany({
      where: {
        id: {
          in: matched.map((article) => article.id),
        },
      },
    });

    await cleanupUnusedTags();

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin");
    matched.forEach((article) => revalidatePath(`/articles/${article.slug}`));

    return NextResponse.json({
      ok: true,
      count: matched.length,
      deleted: matched.map((article) => ({ slug: article.slug, title: article.title })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_INTERNAL_API") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
