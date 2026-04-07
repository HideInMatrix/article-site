# article-site

一个面向 **英文用户** 与 **繁体中文用户** 的 AI / 科技 / 时政内容网站。

当前项目特性：
- Next.js 16
- TypeScript
- pnpm
- UnoCSS + shadcn/ui
- Prisma 7
- PostgreSQL
- Google Adsense
- 多语言（默认英文，支持繁体中文）
- 后台发文 / 编辑 / 删除
- 内部 API 发文接口

---

## 1. 项目定位

这个项目不是论坛，也不是博客模板展示页，而是一个可持续运营的文章网站：

- 首页展示文章流
- 支持分类切换
- 支持文章详情页阅读
- 支持后台录入文章
- 支持外部脚本通过接口发布文章
- 支持英文 / 繁体中文双语内容

---

## 2. 本地开发

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制：

```bash
cp .env.example .env
```

然后按你的环境修改 `.env`。

### 生成 Prisma Client

```bash
pnpm db:generate
```

### 推送数据库结构

```bash
pnpm db:push
```

### 启动开发环境

```bash
pnpm dev
```

---

## 3. 环境变量

最关键的是：

```env
DATABASE_URL=postgresql://user:password@host:5432/article_site?schema=public
NEXT_PUBLIC_SITE_URL=https://micromatrix.org
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=your-session-secret
INTERNAL_API_TOKEN=your-internal-api-token
```

其他 SEO、GEO、广告位、新闻源配置可以参考 `.env.example`。

---

## 4. 数据库

当前项目使用：
- **Prisma + PostgreSQL**

修改 schema 后常用命令：

```bash
pnpm db:generate
pnpm db:push
```

如需灌入测试数据：

```bash
pnpm db:seed
```

---

## 5. 后台管理

### 登录页

```text
/login
```

### 后台首页

```text
/admin
```

### 新建文章

```text
/admin/articles/new
```

### 编辑文章

```text
/admin/articles/[id]/edit
```

后台现在支持：
- 新建文章
- 编辑文章
- 删除文章
- 英文 / 繁体中文双语内容录入

---

## 6. 外部机器发布文章的接口用法

这是当前最重要的使用方法之一。

### 发布文章接口

```text
POST /api/internal/articles
```

线上地址示例：

```text
https://micromatrix.org/api/internal/articles
```

### 认证方式

推荐使用请求头：

```http
x-api-token: YOUR_INTERNAL_API_TOKEN
```

---

### 请求字段

建议完整传这些字段：

```json
{
  "title": "Canonical title",
  "titleEn": "English title",
  "titleZhHant": "繁體中文標題",
  "slug": "my-article-2026-03-29",
  "excerpt": "Canonical excerpt",
  "excerptEn": "English excerpt",
  "excerptZhHant": "繁體中文摘要",
  "content": "# Canonical body\n\nBody content",
  "contentEn": "# English body\n\nBody content",
  "contentZhHant": "# 繁體中文正文\n\n正文內容",
  "category": "AI热点",
  "authorName": "Daily News Bot",
  "readTimeMinutes": 6,
  "publishedAt": "2026-03-29T08:00:00.000Z",
  "tags": ["AI", "News"],
  "upsert": true
}
```

### `upsert: true` 的作用

如果 `slug` 已存在：
- 更新原文章

如果 `slug` 不存在：
- 创建新文章

这非常适合：
- 定时任务
- 其他机器自动发文
- 重跑脚本避免重复内容

---

### curl 示例

```bash
curl -X POST "https://micromatrix.org/api/internal/articles" \
  -H "Content-Type: application/json" \
  -H "x-api-token: YOUR_INTERNAL_API_TOKEN" \
  -d '{
    "title": "OpenAI expands enterprise safety tooling",
    "titleEn": "OpenAI expands enterprise safety tooling",
    "titleZhHant": "OpenAI 擴展企業安全工具",
    "slug": "openai-enterprise-safety-tooling-2026-03-29",
    "excerpt": "OpenAI announced new tooling for enterprise safety and developer workflows.",
    "excerptEn": "OpenAI announced new tooling for enterprise safety and developer workflows.",
    "excerptZhHant": "OpenAI 宣布了新的企業安全與開發者工作流工具。",
    "content": "# OpenAI expands enterprise safety tooling\n\nFull article body...",
    "contentEn": "# OpenAI expands enterprise safety tooling\n\nFull article body...",
    "contentZhHant": "# OpenAI 擴展企業安全工具\n\n完整文章內容...",
    "category": "AI热点",
    "authorName": "External Publisher",
    "readTimeMinutes": 5,
    "publishedAt": "2026-03-29T08:00:00.000Z",
    "tags": ["OpenAI", "Enterprise", "Safety"],
    "upsert": true
  }'
```

---

## 7. 其他内部接口

### 更新单篇文章

```text
PUT /api/internal/articles/[id]
```

### 删除单篇文章

```text
DELETE /api/internal/articles/[id]
```

### 批量清理文章

```text
POST /api/internal/articles/purge
```

例如：删除全部文章

```bash
curl -X POST "https://micromatrix.org/api/internal/articles/purge" \
  -H "Content-Type: application/json" \
  -H "x-api-token: YOUR_INTERNAL_API_TOKEN" \
  -d '{
    "mode": "all",
    "confirm": "delete-all-articles"
  }'
```

例如：先 dry run

```bash
curl -X POST "https://micromatrix.org/api/internal/articles/purge" \
  -H "Content-Type: application/json" \
  -H "x-api-token: YOUR_INTERNAL_API_TOKEN" \
  -d '{
    "mode": "all",
    "confirm": "delete-all-articles",
    "dryRun": true
  }'
```

---

## 8. 自动发稿

当前项目已经支持自动化编辑任务。

现在的目标结构是：
- 不发“摘要合集”
- 直接发布 **3–5 篇独立新闻稿**
- 每篇都包含：
  - 英文标题 / 摘要 / 正文
  - 繁中标题 / 摘要 / 正文

自动任务最终也是通过内部 API 发文。

新闻源目前通过环境变量配置，支持 **多个 RSS 用英文逗号分隔**，例如：

```env
AI_NEWS_FEEDS=https://news.google.com/rss/search?q=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD+OR+AI+when:1d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans,https://aws.amazon.com/blogs/china/feed/
CURRENT_AFFAIRS_FEEDS=https://news.google.com/rss/search?q=%E6%97%B6%E6%94%BF+OR+%E5%9B%BD%E9%99%85%E6%96%B0%E9%97%BB+when:1d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans
```

---

## 9. Google Adsense

项目已经接入：
- Google Adsense 脚本
- 列表流广告位
- 详情页侧栏广告位
- 广告拦截检测组件

相关环境变量：

```env
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-5901616898778649
NEXT_PUBLIC_GOOGLE_AD_SLOT_FEED=3130294823
NEXT_PUBLIC_GOOGLE_AD_SLOT_ARTICLE=9110974380
```

同时已支持：
- `/ads.txt`

---

## 10. Docker / 部署说明

部署时至少确保：

1. 配好 `.env`
2. 配好 PostgreSQL 的 `DATABASE_URL`
3. 首次部署前执行：

```bash
pnpm db:push
```

如果你用的是容器部署，重点不是在构建时连数据库，而是：
- **运行前先把数据库结构初始化好**

当前代码已经调整为：
- GitHub build 不依赖数据库在线连接
- 避免在构建 `sitemap` / 页面时因为数据库不可达而报错

---

## 11. 常见问题

### Q1：为什么外部机器能发文章？
因为项目提供了内部 API：
- `POST /api/internal/articles`

只要带正确的 `x-api-token`，就可以从其他机器直接发文。

### Q2：为什么推荐传双语字段？
因为当前站点默认英文，并支持繁体中文切换。
如果只传单语言，切换后会回退到 canonical 字段，体验会变差。

### Q3：为什么构建时不应该连接数据库？
因为 CI / GitHub Actions 在 build 阶段未必能访问你的生产数据库。
所以现在项目已调整为：
- 构建阶段不依赖数据库
- 运行阶段再读取数据库

---

## 12. 当前建议的内容工作流

如果你想从其他机器自动发布内容，推荐流程：

1. 抓取原始资讯
2. 清洗与筛选
3. 写出英文 + 繁中双语文章
4. 调用：
   - `POST /api/internal/articles`
5. 用 `upsert: true` 保证幂等

---

## 13. 许可证

如果你有自己的许可证要求，请在这里替换。
