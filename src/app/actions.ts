"use server";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

async function getVisitorId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get("article_site_visitor_id")?.value;

  if (existing) {
    return existing;
  }

  const visitorId = randomUUID();
  cookieStore.set("article_site_visitor_id", visitorId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return visitorId;
}

export async function toggleArticleLikeAction(articleId: string, paths: string[]) {
  const visitorId = await getVisitorId();

  const existing = await prisma.articleLike.findUnique({
    where: {
      articleId_visitorId: {
        articleId,
        visitorId,
      },
    },
  });

  if (existing) {
    await prisma.articleLike.delete({
      where: {
        articleId_visitorId: {
          articleId,
          visitorId,
        },
      },
    });
  } else {
    await prisma.articleLike.create({
      data: {
        articleId,
        visitorId,
      },
    });
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
