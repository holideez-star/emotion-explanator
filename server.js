const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const {
  fetchBestsellers,
  fetchScienceStats,
  searchBooks,
  searchBooksByTitleAndAuthor,
  getBookDetail,
} = require('./lib/aladin');

function loadEnvFile() {
  const envPath = path.join(__dirname, 'netlify.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/bestseller', async (req, res) => {
  try {
    const max = Math.min(Number(req.query.max) || 10, 20);
    const start = Number(req.query.start) || 1;
    res.json(await fetchBestsellers(max, start));
  } catch (err) {
    res.status(500).json({ error: err?.message || '베스트셀러를 불러오지 못했어요.', items: [] });
  }
});

app.get('/api/science-stats', async (_req, res) => {
  try {
    res.json(await fetchScienceStats());
  } catch (err) {
    res.status(500).json({ error: err?.message || '통계를 불러오지 못했어요.', fields: [] });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    if (req.query.type === 'both') {
      res.json(await searchBooksByTitleAndAuthor(req.query.title, req.query.author));
      return;
    }
    res.json(await searchBooks(req.query.q, req.query.type || 'keyword'));
  } catch (err) {
    res.status(400).json({
      error: err?.message || '검색에 실패했어요.',
      items: [],
      exactMatches: [],
      relatedBooks: [],
    });
  }
});

app.get('/api/book', async (req, res) => {
  try {
    res.json(await getBookDetail(req.query.itemId));
  } catch (err) {
    res.status(400).json({ error: err?.message || '도서 정보를 불러오지 못했어요.' });
  }
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 실행 중`);
});
