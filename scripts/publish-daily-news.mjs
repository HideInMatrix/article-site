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
      ? `乍看之下，今天的 AI 新聞像是幾條分散更新，但放在一起看，節奏其實很清楚：${joined}。這不只是產品上新而已，背後還連著模型能力落地、平台節奏和資本注意力的重新分配。`
      : `今天的時政與國際新聞表面上各說各話，但串起來看，線索其實很集中：${joined}。真正值得看的，不只是單一事件，而是政策壓力、地緣風險和外部回應正在一起升高。`;
  }

  return category === 'AI热点'
    ? `At first glance, today's AI headlines look scattered. Read together, though, ${joined} tell a cleaner story: product rollout, model deployment, and capital positioning are starting to move in sync.`
    : `At first glance, today's current affairs headlines can feel disconnected. Read together, ${joined} point to the same larger pressure line in policy and geopolitics.`;
}

function buildThesisParagraph(category, locale) {
  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? '這篇速覽想做的，不是把標題再排一次，而是把每條消息放回真正的產業脈絡裡：誰在搶位置、哪些能力開始變得實用、哪些方向已經從概念慢慢長成基礎設施。'
      : '這篇速覽想做的，也不只是重述事件，而是把消息放回政策、權力結構與外部影響的脈絡中，讓讀者更快看懂它為什麼值得繼續追。';
  }

  return category === 'AI热点'
    ? 'This briefing is not trying to restate the headlines. It is trying to put each item back into the bigger industry picture: who is gaining leverage, which capabilities are becoming usable, and where the market is hardening into infrastructure.'
    : 'This briefing is not just a recap of events. It aims to put each development back into its policy, power, and institutional context so the reader can see why it matters beyond the headline.';
}

function buildWhatHappenedParagraph(item, locale) {
  const fallback = locale === 'zh-Hant'
    ? '目前公開資訊還不算多，眼下能先抓住的，主要還是標題、摘要和原始來源釋出的線索。'
    : 'Public reporting is still early, so for now the clearest view of the story is still the headline, the summary, and the original source material.';

  if (item.description) {
    return locale === 'zh-Hant'
      ? `${sentenceCase(item.description)} 先抓住一點就好：這件事已經正式進入公開報導，${item.source} 也是眼下最值得持續盯著看的來源。`
      : `${sentenceCase(item.description)} The immediate takeaway is fairly simple: this story is now firmly in the public reporting cycle, and ${item.source} is the source worth watching most closely for follow-through.`;
  }

  return fallback;
}

function explainWhy(category, locale, item) {
  if (locale === 'zh-Hant') {
    return category === 'AI热点'
      ? `這條消息值得看，不只是因為它本身夠新，而是因為它讓人更清楚看到 AI 產業接下來怎麼分配產品優勢、模型能力和資本注意力。${item.source === 'aws.amazon.com' ? ' 如果訊號直接來自官方技術部落格，通常也代表平台方正在主動帶節奏。' : ''}`
      : '這條消息值得看，也不只因為事件本身，而是因為它很可能會牽動後續政策討論、跨國互動，甚至市場對風險的判斷。';
  }

  return category === 'AI热点'
    ? `This matters not just because it is new, but because it gives a clearer view of how AI product advantage, model capability, and capital attention are being redistributed.${item.sourceDomain === 'aws.amazon.com' ? ' When the signal comes from an official platform blog, it usually means the platform is trying to shape the next wave of builder behavior.' : ''}`
    : 'This matters not just because of the event itself, but because it can push the next round of policy discussion, international coordination, and market judgment.';
}

function buildWatchNextParagraph(category, locale, item, index, total) {
  const isLast = index === total - 1;

  if (locale === 'zh-Hant') {
    if (category === 'AI热点') {
      return isLast
        ? '接下來真正要看的，不只是這條消息會不會繼續發酵，而是它會不會和其他產品更新、平台策略或資本動作接在一起，變成更大的轉向。'
        : '接下來值得盯的是，這條消息會不會很快落到更具體的產品、商業化或生態合作上。';
    }

    return isLast
      ? '接下來更值得留意的，是這些事件會不會在政策層面彼此疊加，最後把外部判斷和行動一起往前推。'
      : '接下來值得留意的，是這條消息會不會很快在政策、輿論或市場層面引出第二波反應。';
  }

  if (category === 'AI热点') {
    return isLast
      ? 'The real next question is not just whether this story gets bigger, but whether it connects with adjacent product, platform, or capital moves and turns into a broader shift.'
      : 'What to watch next is whether this quickly turns into something more concrete at the product, commercial, or ecosystem level.';
  }

  return isLast
    ? 'The next thing to watch is whether these developments begin to stack on top of one another at the policy level and push outside expectations in a new direction.'
    : 'What to watch next is whether this produces a second wave of reaction in policy, public debate, or market behavior.';
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
      ? `如果今天只記一件事，那大概就是：AI 新聞真正的訊號，早就不只是一條 headline。像「${lead}」這樣的消息，正在一起改寫下一步的產品節奏、競爭格局和生態分工。`
      : `如果今天只記一件事，那就是：真正重要的，往往不是單條事件本身，而是它們怎麼彼此疊加，慢慢把政策方向和風險判斷往前推。`;
  }

  return category === 'AI热点'
    ? `If there is one takeaway from today's AI cycle, it is this: the real signal no longer lives in a single headline. Stories like "${lead}" are moving together and reshaping product tempo, competitive leverage, and ecosystem structure.`
    : 'If there is one takeaway from today’s current affairs cycle, it is this: the real signal sits less in any single event than in how multiple developments begin to reinforce one another.';
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
