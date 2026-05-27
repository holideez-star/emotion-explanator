const { MelonSearch, SearchSection } = require('melona');

const GENRE_QUERY_MAP = {
  인디: '인디 음악',
  락: '록',
  록: '록',
  발라드: '발라드',
  힙합: '힙합',
  랩: '랩',
  알앤비: 'R&B',
  알앤비앤소울: 'R&B',
  rnb: 'R&B',
  'r&b': 'R&B',
  재즈: '재즈',
  클래식: '클래식',
  아이돌: '아이돌',
  댄스: '댄스',
  팝: 'POP',
  ost: 'OST',
  케이팝: 'K-POP',
  kpop: 'K-POP',
  'k-pop': 'K-POP',
  감성: '감성 발라드',
  새벽: '새벽 감성',
  우울: '우울한 노래',
  신나는: '신나는 노래',
  드라이브: '드라이브 음악',
  공부: '공부할 때 듣는 음악',
};

function normalizeGenreInput(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function genreToQuery(rawGenre) {
  const normalized = normalizeGenreInput(rawGenre);
  return GENRE_QUERY_MAP[normalized] || String(rawGenre || '').trim();
}

function isServerlessRuntime() {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_DEV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME,
  );
}

function createMelonSearch() {
  const serverless = isServerlessRuntime();
  return new MelonSearch({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    timeout: serverless ? 8000 : 15000,
    retryOptions: serverless
      ? { maxRetries: 1, baseDelay: 400, exponentialBase: 2, jitter: false }
      : {
          maxRetries: 3,
          baseDelay: 1000,
          exponentialBase: 2,
          jitter: true,
        },
  });
}

async function getTop3ByGenre(rawGenre) {
  const genre = String(rawGenre || '').trim();
  if (!genre) {
    return { error: '장르를 입력해주세요.', genre: '', query: '', songs: [] };
  }

  const query = genreToQuery(genre);
  const melonSearch = createMelonSearch();
  const results = await melonSearch.searchSong({
    query,
    section: SearchSection.ALL,
  });

  if (!results?.length) {
    return {
      error: `"${genre}"(검색어: "${query}")에 대한 검색 결과가 없어요.`,
      genre,
      query,
      songs: [],
    };
  }

  const songs = results
    .slice()
    .sort((a, b) => (b.likeCnt || 0) - (a.likeCnt || 0))
    .slice(0, 3)
    .map((song, i) => ({
      rank: i + 1,
      title: song.title,
      artist: song.artist,
      album: song.album,
      likeCnt: song.likeCnt,
    }));

  return { genre, query, songs, error: null };
}

module.exports = { genreToQuery, getTop3ByGenre };
