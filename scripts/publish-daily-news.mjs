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

function formatPublishedAt(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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
  const trustedBoost = trustedSources.has(item.source) || trustedSources.has(item.sourceDomain) ? 50 : 0;
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

function sentenceCase(text = '') {
  const value = cleanText(text);
  if (!value) return '';
  return value.endsWith('.') || value.endsWith('!') || value.endsWith('?') ? value : `${value}.`;
}

function makeExcerpt(intro, leadTitle, count, locale) {
  if (locale === 'zh-Hant') {
    return `${intro} 本篇以「${leadTitle}」為切入，整理共 ${count} 條值得追蹤的重點，並說明它們背後的共通方向。`;
  }

  return `${intro} It leads with "${leadTitle}" and organizes ${count} developments into a clearer narrative readers can follow.`;
}

function buildHighlights(items, locale) {
  return items.slice(0, 3).map((item) => {
    if (locale === 'zh-Hant') {
      return `- **${item.title}**：${item.source}，${formatPublishedAt(item.pubDate, 'zh-HK')}`;
    }
    return `- **${item.title}** — ${item.source}, ${formatPublishedAt(item.pubDate, 'en-US')}`;
  });
}

function buildLeadParagraph(category, items, locale) {
  const topTitles = items.slice(0, 3).map((item) => item.title);
  const joined = topTitles.length === 1
    ? topTitles[0]
    : `${topTitles.slice(0, -1).join(locale === 'zh-Hant' ? '、' : ', ')}${locale === 'zh-Hant' ? '以及' : ', and '}${topTitles.at(-1)}`;

  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? `今天的 AI 新聞並不是零散更新，而是圍繞幾個清楚方向展開：${joined}。把它們放在一起看，更容易看出產業正在同時推進產品落地、模型能力與資本配置。`
      : `今天的時政與國際新聞並不是彼此孤立的事件，而是共同指向更大的政策與地緣壓力：${joined}。把這些新聞串起來，才能看清真正的重要變化。`;
  }

  return category === 'AI热点'
    ? `Today's AI cycle is not a pile of unrelated updates. ${joined} point to the same deeper pattern: product rollout, model deployment, and capital strategy are moving together.`
    : `Today's current affairs cycle is not a list of isolated incidents. ${joined} point to a broader policy and geopolitical story that becomes clearer when the items are read together.`;
}

function buildThesisParagraph(category, locale) {
  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? '這篇速覽不只是列新聞，而是把每條消息放回它真正所屬的產業脈絡：誰在搶位置、哪些能力開始實用化、哪些方向正在從概念變成基礎設施。'
      : '這篇速覽不只是列事件，而是把每條消息放回政策、權力結構與外部影響的脈絡中，幫助讀者更快判斷它為什麼值得繼續追蹤。';
  }

  return category === 'AI热点'
    ? 'The goal of this briefing is not just to list headlines, but to place each one back into the larger industry structure: who is gaining leverage, which capabilities are becoming practical, and where the market is hardening into infrastructure.'
    : 'The goal of this briefing is not just to list events, but to put each one back into its policy, power, and institutional context so the reader can see why it matters beyond the headline.';
}

function buildWhatHappenedParagraph(item, locale) {
  const fallback = locale === 'zh-Hant'
    ? '目前公開資訊仍以標題與摘要為主，後續細節仍需持續跟進原始來源。'
    : 'Public reporting is still relatively early, so the headline and summary remain the clearest window into the story so far.';

  if (item.description) {
    return locale === 'zh-Hant'
      ? `${sentenceCase(item.description)} 目前最值得先把握的，是這條消息已經明確進入公開討論，且來自 ${item.source} 的報導可作為第一手追蹤入口。`
      : `${sentenceCase(item.description)} The most important immediate takeaway is that the story has now entered the public reporting cycle, with ${item.source} serving as the first source to monitor closely.`;
  }

  return fallback;
}

function explainWhy(category, locale, item) {
  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? `這條消息之所以值得看，不只因為事件本身，而是因為它反映了 AI 產業正在如何重新分配產品優勢、模型能力或資本注意力。${item.source === 'aws.amazon.com' ? ' 由官方技術部落格釋出的內容，也往往代表平台方想主動塑造的技術方向。' : ''}`
      : '這條消息之所以值得看，不只因為事件本身，而是因為它可能影響後續政策討論、跨國互動或市場預期。';
  }

  return category === 'AI热点'
    ? `This matters not only because of the event itself, but because it shows how AI product advantage, model capability, or capital attention is being redistributed.${item.sourceDomain === 'aws.amazon.com' ? ' When the signal comes from an official platform blog, it also hints at what the platform wants developers to build next.' : ''}`
    : 'This matters not only because of the event itself, but because it can change the direction of policy discussion, international coordination, or market expectations.';
}

function buildWatchNextParagraph(category, locale, item, index, total) {
  const isLast = index === total - 1;

  if (locale === 'zh-Hant') {
    if (category === 'AI热点') {
      return isLast
        ? '接下來要觀察的，不只是這條消息本身會不會擴大，而是它是否會與其他產品更新、平台策略或資本動作形成連鎖反應。'
        : '接下來值得觀察的是，這條消息會不會很快引出更具體的產品、商業化或生態層面後續。';
    }

    return isLast
      ? '接下來更值得留意的是，這些事件會不會在政策層面彼此疊加，進一步改變外部判斷與行動。'
      : '接下來值得留意的是，這條消息會不會很快在政策、輿論或市場層面產生第二波影響。';
  }

  if (category === 'AI热点') {
    return isLast
      ? 'The next question is not just whether this story grows, but whether it links up with adjacent product, platform, or capital moves and becomes part of a broader shift.'
      : 'What to watch next is whether this quickly turns into a more concrete product, business, or ecosystem-level follow-up.';
  }

  return isLast
    ? 'The next question is whether these developments begin to compound at the policy level and reshape external expectations.'
    : 'What to watch next is whether this story produces a second-order effect in policy, public debate, or market behavior.';
}

function buildItemSection(item, index, total, category, locale) {
  const heading = locale === 'zh-Hant' ? `## ${index + 1}. ${item.title}` : `## ${index + 1}. ${item.title}`;
  const sourceLine = locale === 'zh-Hant'
    ? `- **來源：** ${item.source}\n- **發布時間：** ${formatPublishedAt(item.pubDate, 'zh-HK')}\n- **原文連結：** ${item.link}`
    : `- **Source:** ${item.source}\n- **Published:** ${formatPublishedAt(item.pubDate, 'en-US')}\n- **Original link:** ${item.link}`;

  return [
    heading,
    sourceLine,
    locale === 'zh-Hant' ? '### 這條消息在說什麼' : '### What happened',
    buildWhatHappenedParagraph(item, locale),
    locale === 'zh-Hant' ? '### 為什麼值得關注' : '### Why it matters',
    explainWhy(category, locale, item),
    locale === 'zh-Hant' ? '### 接下來看什麼' : '### What to watch next',
    buildWatchNextParagraph(category, locale, item, index, total),
  ].join('\n\n');
}

function buildConclusion(category, locale, items) {
  const lead = items[0]?.title || '';

  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? `如果今天只能記住一件事，那就是 AI 新聞的重點已經不只是單點發布，而是像「${lead}」這樣的訊號正在共同塑造下一步的產品節奏、競爭格局與生態分工。`
      : `如果今天只能記住一件事，那就是真正重要的不是單條事件本身，而是它們如何彼此疊加，慢慢改變政策方向與外部風險判斷。`;
  }

  return category === 'AI热点'
    ? `If there is one takeaway from today's AI cycle, it is that the important signal is no longer a single headline. Stories like "${lead}" are part of a broader shift in product tempo, competitive leverage, and ecosystem structure.`
    : 'If there is one takeaway from today’s current affairs cycle, it is that the real signal lies less in any single event than in how multiple developments begin to reinforce one another.';
}

function buildSources(items, locale) {
  const heading = locale === 'zh-Hant' ? '## 來源' : '## Sources';
  const lines = items.map((item) => `- ${item.source}: ${item.link}`);
  return [heading, ...lines].join('\n\n');
}

function makeArticle({ titleEn, titleZhHant, category, tags, introEn, introZhHant, items, slug }) {
  const dateText = toDateString();
  const leadTitle = items[0]?.title || titleEn;
  const excerptEn = makeExcerpt(introEn, leadTitle, items.length, 'en');
  const excerptZhHant = makeExcerpt(introZhHant, leadTitle, items.length, 'zh-Hant');

  const englishBody = [
    `# ${titleEn} (${dateText})`,
    introEn,
    buildLeadParagraph(category, items, 'en'),
    '## Key takeaways',
    ...buildHighlights(items, 'en'),
    '## Why today matters',
    buildThesisParagraph(category, 'en'),
    ...items.map((item, index) => buildItemSection(item, index, items.length, category, 'en')),
    '## Bottom line',
    buildConclusion(category, 'en', items),
    buildSources(items, 'en'),
  ].join('\n\n');

  const traditionalChineseBody = [
    `# ${titleZhHant}（${dateText}）`,
    introZhHant,
    buildLeadParagraph(category, items, 'zh-Hant'),
    '## 今日重點',
    ...buildHighlights(items, 'zh-Hant'),
    '## 這一輪新聞真正值得看的地方',
    buildThesisParagraph(category, 'zh-Hant'),
    ...items.map((item, index) => buildItemSection(item, index, items.length, category, 'zh-Hant')),
    '## 結語',
    buildConclusion(category, 'zh-Hant', items),
    buildSources(items, 'zh-Hant'),
  ].join('\n\n');

  return {
    title: `${titleEn} | ${dateText}`,
    titleEn: `${titleEn} | ${dateText}`,
    titleZhHant: `${titleZhHant}｜${dateText}`,
    slug: `${slug}-${dateText}`,
    excerpt: excerptEn,
    excerptEn,
    excerptZhHant,
    content: englishBody,
    contentEn: englishBody,
    contentZhHant: traditionalChineseBody,
    category,
    authorName: 'Daily News Bot',
    readTimeMinutes: Math.max(6, Math.ceil(items.length * 2.2)),
    publishedAt: new Date().toISOString(),
    tags,
    upsert: true,
  };
}

async function publishArticle(article) {
  if (dryRun) {
    return { ok: true, dryRun: true, slug: article.slug, article };
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

  const results = await Promise.allSettled(tasks);
  const published = [];
  const failed = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      published.push(result.value);
    } else {
      failed.push(String(result.reason));
    }
  }

  console.log(`FINAL_PUBLISHED: ${published.length}`);
  for (const entry of published) {
    console.log(JSON.stringify(entry));
  }
  console.log(`FINAL_FAILED: ${failed.length}`);
  for (const entry of failed) {
    console.log(entry);
  }
}

main().catch((error) => {
  console.error('FINAL_PUBLISHED: 0');
  console.error('FINAL_FAILED: 1');
  console.error(String(error));
  process.exit(1);
});
