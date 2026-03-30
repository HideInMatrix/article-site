import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SiteLocale } from "@/lib/i18n";

type PaginationNavProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | number | undefined | null>;
  locale: SiteLocale;
};

function buildHref(basePath: string, page: number, query: Record<string, string | number | undefined | null> = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function PaginationNav({ page, totalPages, basePath, query, locale }: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevLabel = locale === "zh-Hant" ? "上一頁" : "Previous";
  const nextLabel = locale === "zh-Hant" ? "下一頁" : "Next";
  const pageLabel = locale === "zh-Hant" ? `第 ${page} / ${totalPages} 頁` : `Page ${page} / ${totalPages}`;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Button asChild variant="outline" className="rounded-2xl" disabled={page <= 1}>
        <Link aria-disabled={page <= 1} href={buildHref(basePath, Math.max(1, page - 1), query)}>
          {prevLabel}
        </Link>
      </Button>

      <div className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
        {pageLabel}
      </div>

      <Button asChild variant="outline" className="rounded-2xl" disabled={page >= totalPages}>
        <Link aria-disabled={page >= totalPages} href={buildHref(basePath, Math.min(totalPages, page + 1), query)}>
          {nextLabel}
        </Link>
      </Button>
    </nav>
  );
}
