"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getLocaleLabel, type SiteLocale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: SiteLocale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const redirectTo = query ? `${pathname}?${query}` : pathname;

  const locales: SiteLocale[] = ["en", "zh-Hant"];

  return (
    <div className="flex items-center gap-2">
      {locales.map((nextLocale) => (
        <Button
          key={nextLocale}
          asChild
          size="sm"
          variant={locale === nextLocale ? "default" : "outline"}
          className="rounded-full px-3"
        >
          <Link href={`/api/locale?locale=${encodeURIComponent(nextLocale)}&redirectTo=${encodeURIComponent(redirectTo)}`}>
            {getLocaleLabel(nextLocale)}
          </Link>
        </Button>
      ))}
    </div>
  );
}
