import { XMLParser } from 'fast-xml-parser';

const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const token = process.env.INTERNAL_API_TOKEN;
const timezone = process.env.NEWS_TIMEZONE || 'Asia/Shanghai';
const itemLimit = Number(process.env.NEWS_ITEM_LIMIT || '8');
const aiFeeds = (process.env.AI_NEWS_FEEDS || '').split(',').map((item) => item.trim()).filter(Boolean);
const currentAffairsFeeds = (process.env.CURRENT_AFFAIRS_FEEDS || '').split(',').map((item) => item.trim()).filter(Boolean);
const aiTrustedSources = new Set((process.env.AI_NEWS_TRUSTED_SOURCES || '').split(',').map((item) => item.trim()).filter(Boolean));
const currentAffairsTrustedSources = new Set((process.env.CURRENT_AFFAIRS_TRUSTED_SOURCES || '').split(',').map((item) => item.trim()).filter(Boolean));
const aiExcludedKeywords = (process.env.AI_NEWS_EXCLUDE_KEYWORDS || '').split(',').map((item) => item.trim()).filter(Boolean);
const currentAffairsExcludedKeywords = (process.env.CURRENT_AFFAIRS_EXCLUDE_KEYWORDS || '').split(',').map((item) => item.trim()).filter(Boolean);
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

function cleanText(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitTitleAndSource(rawTitle = '', fallbackSource = '') {
  const title = cleanText(rawTitle);
  const match = title.match(/^(.*?)[\-｜|]\s*([^\-｜|]{2,40})$/);
  if (!match) {
    return { cleanTitle: title, source: fallbackSource || 'unknown' };
  }
  return {
    cleanTitle: match[1].trim(),
    source: match[2].trim() || fallbackSource || 'unknown',
  };
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
  const link = typeof item.link === 'string' ? item.link : item.link?.['@_href'] || item.guid || '';
  const rawDescription = item.description || item.summary || item.content || '';
  const description = cleanText(rawDescription);
  const sourceHint = cleanText(item.source?.['#text'] || item.source || '');
  const { cleanTitle, source } = splitTitleAndSource(item.title || '', sourceHint || getDomain(String(link || '')));

  return {
    title: cleanTitle,
    link: String(link).trim(),
    description: description.replace(/(新浪财经|新华社|央视新闻|Reuters|BBC|Financial Times|联合早报)\s*$/i, '').trim(),
    pubDate: new Date(item.pubDate || item.published || item.updated || Date.now()),
    source,
    sourceDomain: getDomain(String(link || '')),
  };
}

function isExcluded(item, excludedKeywords) {
  const haystack = `${item.title} ${item.description}`;
  return excludedKeywords.some((keyword) => keyword && haystack.includes(keyword));
}

function scoreItem(item, trustedSources) {
  const trustedBoost = trustedSources.has(item.source) ? 50 : 0;
  const descriptionBoost = Math.min(item.description.length, 160) / 10;
  const recencyBoost = Math.max(0, 48 - (Date.now() - item.pubDate.getTime()) / 36e5);
  const sourcePenalty = item.sourceDomain === 'news.google.com' ? -10 : 0;
  return trustedBoost + descriptionBoost + recencyBoost + sourcePenalty;
}

function dedupeAndRank(items, trustedSources, excludedKeywords) {
  const filtered = items.filter((item) => item.title && item.link && !isExcluded(item, excludedKeywords));
  const deduped = Array.from(new Map(filtered.map((item) => [`${item.title.toLowerCase()}::${item.source}`, item])).values());
  const sorted = deduped
    .map((item) => ({ ...item, score: scoreItem(item, trustedSources) }))
    .sort((a, b) => b.score - a.score || b.pubDate.getTime() - a.pubDate.getTime());

  const perSource = new Map();
  const results = [];
  for (const item of sorted) {
    const count = perSource.get(item.source) || 0;
    if (count >= 2) continue;
    perSource.set(item.source, count + 1);
    results.push(item);
    if (results.length >= itemLimit) break;
  }
  return results;
}

async function collectNews(feeds, trustedSources, excludedKeywords) {
  const groups = await Promise.all(feeds.map((feed) => fetchFeed(feed).catch(() => [])));
  const items = groups.flat().map(normalizeItem);
  return dedupeAndRank(items, trustedSources, excludedKeywords);
}

function buildHighlights(items) {
  return items.slice(0, 3).map((item) => `- ${item.title}（${item.source}）`);
}

function explainWhy(category) {
  if (category === 'AI热点') {
    return `这条新闻与人工智能产业、模型能力、产品落地或资本动向相关，适合作为当天 AI 趋势观察的重点参考。`;
  }
  return `这条新闻与国际局势、公共政策或重要社会事件相关，适合作为当天时政热点观察的重点参考。`;
}

function makeArticle({ title, category, tags, intro, items, slug }) {
  const dateText = toDateString();
  const highlights = buildHighlights(items);
  const excerpt = `${intro} 今日精选 ${items.length} 条重点新闻，帮助你快速掌握当天最值得关注的动态。`;
  const sections = items.map((item, index) => {
    const summary = item.description ? `摘要：${item.description}` : '摘要：请打开原文查看完整内容。';
    const why = `为什么值得关注：${explainWhy(category)}`;
    return `### ${index + 1}. ${item.title}\n来源：${item.source}\n发布时间：${item.pubDate.toISOString()}\n原文链接：${item.link}\n${summary}\n${why}`;
  });

  return {
    title: `${title}｜${dateText}`,
    slug: `${slug}-${dateText}`,
    excerpt,
    content: [
      `${title}（${dateText}）`,
      intro,
      '## 今日重点',
      ...highlights,
      '## 重点新闻详情',
      ...sections,
      '## 编辑提示',
      '以上内容基于公开新闻源自动聚合与清洗生成，适合作为日报初稿。正式发布前建议人工复核标题准确性、补充上下文，并对重点新闻做进一步整合与改写。',
    ].join('\n\n'),
    category,
    authorName: 'Daily News Bot',
    readTimeMinutes: Math.max(5, Math.ceil(items.length * 1.8)),
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
    collectNews(aiFeeds, aiTrustedSources, aiExcludedKeywords),
    collectNews(currentAffairsFeeds, currentAffairsTrustedSources, currentAffairsExcludedKeywords),
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
          intro: '这是一份面向中文读者的每日 AI 新闻速览，优先筛选过去 24 小时内更值得关注、信息质量更高的人工智能动态。',
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
          intro: '这是一份面向中文读者的每日时政热点速览，优先筛选过去 24 小时内更值得关注、信息质量更高的重要国际与时政新闻。',
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
