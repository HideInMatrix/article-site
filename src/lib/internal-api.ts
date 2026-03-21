import { timingSafeEqual } from "node:crypto";

import { NextRequest } from "next/server";

function getInternalApiToken() {
  return process.env.INTERNAL_API_TOKEN || process.env.ADMIN_SESSION_SECRET || "change-this-secret-in-production";
}

export function isValidInternalApiToken(token: string | null) {
  if (!token) return false;
  const expected = Buffer.from(getInternalApiToken());
  const actual = Buffer.from(token);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function extractInternalApiToken(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1] || null;
  const headerToken = request.headers.get("x-api-token");
  return bearer || headerToken || null;
}

export function assertInternalApiToken(request: NextRequest) {
  const token = extractInternalApiToken(request);
  if (!isValidInternalApiToken(token)) {
    throw new Error("UNAUTHORIZED_INTERNAL_API");
  }
}
