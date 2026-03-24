import type { SiteLocale } from "@/lib/i18n";

export function formatDate(date: Date, locale: SiteLocale = "en") {
  return new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-HK" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatReadTime(minutes: number, locale: SiteLocale = "en") {
  return locale === "zh-Hant" ? `${minutes} 分鐘閱讀` : `${minutes} min read`;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
