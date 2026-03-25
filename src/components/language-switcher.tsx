"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { getLocaleLabel, type SiteLocale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: SiteLocale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeLocale, setActiveLocale] = useState<SiteLocale>(locale);
  const [isPending, startTransition] = useTransition();

  const currentUrl = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const locales: SiteLocale[] = ["en", "zh-Hant"];

  function switchLocale(nextLocale: SiteLocale) {
    if (nextLocale === activeLocale) {
      return;
    }

    setActiveLocale(nextLocale);

    startTransition(async () => {
      await fetch(
        `/api/locale?locale=${encodeURIComponent(nextLocale)}&redirectTo=${encodeURIComponent(currentUrl)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      router.replace(currentUrl);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((nextLocale) => (
        <Button
          key={nextLocale}
          type="button"
          size="sm"
          disabled={isPending}
          variant={activeLocale === nextLocale ? "default" : "outline"}
          className="rounded-full px-3"
          onClick={() => switchLocale(nextLocale)}
        >
          {getLocaleLabel(nextLocale)}
        </Button>
      ))}
    </div>
  );
}
