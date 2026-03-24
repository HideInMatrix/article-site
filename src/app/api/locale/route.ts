import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_COOKIE } from "@/lib/i18n";

function normalizeRedirectPath(input: string | null) {
  if (!input || !input.startsWith("/")) {
    return "/";
  }

  return input;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const redirectTo = normalizeRedirectPath(searchParams.get("redirectTo"));
  const locale = isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const response = NextResponse.redirect(new URL(redirectTo, siteUrl));

  response.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
