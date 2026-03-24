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

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

function toDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function cleanText(value = '') {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
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
    description: description.replace(/(Reuters|BBC|Financial Times)\s*$/i, '').trim(),
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

function buildHighlights(items, locale) {
  return items.slice(0, 3).map((item) =>
    locale === 'zh-Hant' ? `- ${item.title}（${item.source}）` : `- ${item.title} (${item.source})`
  );
}

function explainWhy(category, locale) {
  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? '這條新聞與人工智慧產業、模型能力、產品落地或資本動向相關，適合作為當天 AI 趨勢觀察的重點。'
      : '這條新聞與國際局勢、公共政策或重要社會事件相關，適合作為當天時政熱點觀察的重點。';
  }

  return category === 'AI热点'
    ? 'This development matters because it affects AI industry structure, model capability, product rollout, or capital expectations.'
    : 'This development matters because it affects public policy, international affairs, or broader technology and business conditions.';
}

function makeArticle({ titleEn, titleZhHant, category, tags, introEn, introZhHant, items, slug }) {
  const dateText = toDateString();
  const excerptEn = `${introEn} Today\'s edition highlights ${items.length} items worth tracking.`;
  const excerptZhHant = `${introZhHant} 今日共整理 ${items.length} 條值得關注的新聞。`;
  const sectionsEn = items.map((item, index) => {
    const summary = item.description ? `Summary: ${item.description}` : 'Summary: please refer to the original source for full details.';
    const why = `Why it matters: ${explainWhy(category, 'en')}`;
    return `### ${index + 1}. ${item.title}\nSource: ${item.source}\nPublished: ${item.pubDate.toISOString()}\nOriginal link: ${item.link}\n${summary}\n${why}`;
  });
  const sectionsZhHant = items.map((item, index) => {
    const summary = item.description ? `摘要：${item.description}` : '摘要：請參考原始來源了解完整內容。';
    const why = `為什麼值得關注：${explainWhy(category, 'zh-Hant')}`;
    return `### ${index + 1}. ${item.title}\n來源：${item.source}\n發布時間：${item.pubDate.toISOString()}\n原文連結：${item.link}\n${summary}\n${why}`;
  });

  return {
    title: `${titleEn} | ${dateText}`,
    titleEn: `${titleEn} | ${dateText}`,
    titleZhHant: `${titleZhHant}｜${dateText}`,
    slug: `${slug}-${dateText}`,
    excerpt: excerptEn,
    excerptEn,
    excerptZhHant,
    content: [
      `# ${titleEn} (${dateText})`,
      introEn,
      '## Key developments',
      ...buildHighlights(items, 'en'),
      '## Details',
      ...sectionsEn,
      '## Editorial note',
      'This article is generated from public sources and should be reviewed before final publication if you need stricter editorial control.',
    ].join('\n\n'),
    contentEn: [
      `# ${titleEn} (${dateText})`,
      introEn,
      '## Key developments',
      ...buildHighlights(items, 'en'),
      '## Details',
      ...sectionsEn,
      '## Editorial note',
      'This article is generated from public sources and should be reviewed before final publication if you need stricter editorial control.',
    ].join('\n\n'),
    contentZhHant: [
      `# ${titleZhHant}（${dateText}）`,
      introZhHant,
      '## 今日重點',
      ...buildHighlights(items, 'zh-Hant'),
      '## 重點新聞詳情',
      ...sectionsZhHant,
      '## 編輯提示',
      '以上內容基於公開新聞源自動聚合與整理生成。若需要更嚴格的編輯品質，建議正式發布前再做人工作業校對。',
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
          titleEn: 'Daily AI Briefing',
          titleZhHant: '每日 AI 新聞速覽',
          category: 'AI热点',
          tags: ['AI', 'AI news', 'daily briefing'],
          introEn: 'This daily AI briefing highlights the most relevant and credible artificial intelligence developments from the last 24 hours.',
          introZhHant: '這是一份面向繁體中文讀者的每日 AI 新聞速覽，優先整理過去 24 小時內最值得關注且可信度較高的人工智慧動態。',
          items: aiItems,
          slug: 'daily-ai-briefing',
        })
      )
    );
  }

  if (currentAffairsItems.length > 0) {
    tasks.push(
      publishArticle(
        makeArticle({
          titleEn: 'Daily Current Affairs Briefing',
          titleZhHant: '每日時政熱點速覽',
          category: '时政热点',
          tags: ['current affairs', 'international news', 'daily briefing'],
          introEn: 'This daily current affairs briefing tracks the highest-signal international and policy developments from the last 24 hours.',
          introZhHant: '這是一份面向繁體中文讀者的每日時政熱點速覽，整理過去 24 小時內最值得關注的重要國際與政策動態。',
          items: currentAffairsItems,
          slug: 'daily-current-affairs-briefing',
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
