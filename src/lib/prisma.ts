import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const fallbackDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/article_site?schema=public";
const connectionString = process.env.DATABASE_URL || fallbackDatabaseUrl;
const adapter = new PrismaPg({ connectionString });

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
