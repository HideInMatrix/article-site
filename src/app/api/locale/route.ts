import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_COOKIE } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const redirectTo = searchParams.get("redirectTo") || "/";
  const locale = isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
