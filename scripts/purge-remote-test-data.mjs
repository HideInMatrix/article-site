const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const token = process.env.INTERNAL_API_TOKEN;

if (!siteUrl || !token) {
  console.error('Missing SITE_URL/NEXT_PUBLIC_SITE_URL or INTERNAL_API_TOKEN');
  process.exit(1);
}

const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/internal/articles/purge`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    mode: 'all',
    confirm: 'delete-all-articles',
  }),
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));

if (!response.ok) {
  process.exit(1);
}
