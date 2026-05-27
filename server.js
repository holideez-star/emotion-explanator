const path = require('node:path');
const express = require('express');
const { getTop3ByGenre } = require('./lib/recommend');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/recommend', async (req, res) => {
  try {
    const genre = req.query.genre;
    const data = await getTop3ByGenre(genre);
    if (data.error && !data.songs.length) {
      return res.status(400).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err?.message || '서버 오류가 발생했어요.',
      genre: '',
      query: '',
      songs: [],
    });
  }
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 실행 중`);
});
