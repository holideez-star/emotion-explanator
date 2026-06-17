const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(__dirname, '..', 'netlify.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

const { fetchScienceStats, searchBooksByTitleAndAuthor } = require('../lib/aladin');

(async () => {
  const stats = await fetchScienceStats();
  console.log('science stats:', stats.fields.map((f) => `${f.label}=${f.count}`).join(', '));
  const both = await searchBooksByTitleAndAuthor('해리', '롤링');
  console.log('both search:', both.items.length, 'results');
  console.log('OK');
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
