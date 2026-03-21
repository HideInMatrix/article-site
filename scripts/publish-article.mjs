const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const token = process.env.INTERNAL_API_TOKEN;

if (!siteUrl || !token) {
  console.error('Missing SITE_URL/NEXT_PUBLIC_SITE_URL or INTERNAL_API_TOKEN');
  process.exit(1);
}

const article = {
  title: '示例文章标题',
  excerpt: '示例文章摘要',
  content: '这里是正文内容。',
  category: 'AI热点',
  authorName: 'Auto Publisher',
  readTimeMinutes: 5,
  tags: ['AI', '热点新闻'],
};

const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/internal/articles`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(article),
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));

if (!response.ok) {
  process.exit(1);
}
