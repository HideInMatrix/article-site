import { XMLParser } from 'fast-xml-parser';

const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const token = process.env.INTERNAL_API_TOKEN;
const timezone = process.env.NEWS_TIMEZONE || 'Asia/Shanghai';
const itemLimit = Number(process.env.NEWS_ITEM_LIMIT || '8');
const aiFeeds = (process.env.AI_NEWS_FEEDS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const currentAffairsFeeds = (process.env.CURRENT_AFFAIRS_FEEDS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const dryRun = process.env.DRY_RUN === '1';

if ((!siteUrl || !token) && !dryRun) {
  console.error('Missing SITE_URL/NEXT_PUBLIC_SITE_URL or INTERNAL_API_TOKEN');
  process.exit(1);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

function toDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getDomain(link = '') {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'DailyAINewsBot/1.0',
      accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${url} (${response.status})`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
  return Array.isArray(items) ? items : [items];
}

function normalizeItem(item) {
  const link = typeof item.link === 'string'
    ? item.link
    : item.link?.['@_href'] || item.guid || '';

  const rawDescription = item.description || item.summary || item.content || '';
  const description = String(rawDescription).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    title: String(item.title || '').replace(/<[^>]+>/g, '').trim(),
    link: String(link).trim(),
    description,
    pubDate: new Date(item.pubDate || item.published || item.updated || Date.now()),
    source: getDomain(String(link || '')),
  };
}

async function collectNews(feeds) {
  const groups = await Promise.all(feeds.map((feed) => fetchFeed(feed).catch(() => [])));
  const items = groups.flat().map(normalizeItem).filter((item) => item.title && item.link);

  const deduped = Array.from(new Map(items.map((item) => [`${item.title}::${item.link}`, item])).values());

  deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return deduped.slice(0, itemLimit);
}

function makeArticle({ title, category, tags, intro, items, slug }) {
  const dateText = toDateString();
  const excerpt = `${intro} 今日共整理 ${items.length} 条值得关注的新闻。`;
  const sections = items.map((item, index) => {
    const summary = item.description ? `摘要：${item.description}` : '摘要：请打开原文查看完整内容。';
    return `${index + 1}. ${item.title}\n来源：${item.source}\n发布时间：${item.pubDate.toISOString()}\n链接：${item.link}\n${summary}`;
  });

  return {
    title: `${title}｜${dateText}`,
    slug: `${slug}-${dateText}`,
    excerpt,
    content: [
      `${title}（${dateText}）`,
      intro,
      '以下内容基于公开新闻源自动聚合生成，建议发布后继续人工复核与补充。',
      ...sections,
    ].join('\n\n'),
    category,
    authorName: 'Daily News Bot',
    readTimeMinutes: Math.max(5, Math.ceil(items.length * 1.5)),
    publishedAt: new Date().toISOString(),
    tags,
    upsert: true,
  };
}

async function publishArticle(article) {
  if (dryRun) {
    console.log(JSON.stringify(article, null, 2));
    return { ok: true, dryRun: true, slug: article.slug };
  }

  const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/internal/articles`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(article),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Publish failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  const [aiItems, currentAffairsItems] = await Promise.all([
    collectNews(aiFeeds),
    collectNews(currentAffairsFeeds),
  ]);

  const tasks = [];

  if (aiItems.length > 0) {
    tasks.push(
      publishArticle(
        makeArticle({
          title: '每日 AI 新闻速览',
          slug: 'daily-ai-briefing',
          category: 'AI热点',
          tags: ['AI', 'AI新闻', '每日简报'],
          intro: '这是一份面向中文读者的每日 AI 新闻速览，帮助你快速掌握最近 24 小时内值得关注的人工智能动态。',
          items: aiItems,
        })
      )
    );
  }

  if (currentAffairsItems.length > 0) {
    tasks.push(
      publishArticle(
        makeArticle({
          title: '每日时政热点速览',
          slug: 'daily-current-affairs-briefing',
          category: '时政热点',
          tags: ['时政', '国际新闻', '热点新闻', '每日简报'],
          intro: '这是一份面向中文读者的每日时政热点速览，聚合最近 24 小时内值得关注的重要国际与时政新闻。',
          items: currentAffairsItems,
        })
      )
    );
  }

  const results = await Promise.all(tasks);
  console.log(JSON.stringify({ ok: true, published: results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
