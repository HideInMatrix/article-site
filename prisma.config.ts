import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/article_site?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url: process.env.DATABASE_URL || fallbackDatabaseUrl,
  },
});
