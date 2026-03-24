import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isSupportedLocale, type SiteLocale, LOCALE_COOKIE } from "@/lib/i18n";

export async function getRequestLocale(): Promise<SiteLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
