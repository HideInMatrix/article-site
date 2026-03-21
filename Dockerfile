# 这里是安装依赖的阶段
FROM node:slim AS deps

WORKDIR /app

# 安装 OpenSSL 3.x 和 pnpm
RUN apt-get update -y && apt-get install -y openssl libssl3 && npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY .vendor ./.vendor

RUN pnpm install --frozen-lockfile

# 这里是 Next.js 打包输出的阶段
FROM node:slim AS builder

WORKDIR /app

# 安装 OpenSSL 3.x 和 pnpm
RUN apt-get update -y && apt-get install -y openssl libssl3 && npm install -g pnpm

# 拷贝来自 deps 阶段的 node_modules 文件
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.vendor ./.vendor
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.ts ./prisma.config.ts

# 传递构建参数
ARG DATABASE_URL

# 设置环境变量
ENV DATABASE_URL=$DATABASE_URL

COPY . .

RUN pnpm build

# 这里是打包完之后运行的版本
FROM node:slim AS runner
WORKDIR /app

# 安装 OpenSSL 3.x 运行时依赖和 curl
RUN apt-get update -y && apt-get install -y openssl libssl3 curl

# 复制 standalone 输出
COPY --from=builder /app/.next/standalone ./

# 复制 Next.js 静态资源
COPY --from=builder /app/.next/static ./.next/static

# 复制 public 文件夹
COPY --from=builder /app/public ./public

# 复制 prisma 文件（包含本地 sqlite 数据库时也需要）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
