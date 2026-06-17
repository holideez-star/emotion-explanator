const API_BASE = 'http://www.aladin.co.kr/ttb/api';

const QUERY_TYPE_MAP = {
  title: 'Title',
  author: 'Author',
  keyword: 'Keyword',
};

const SCIENCE_FIELDS = [
  { key: 'earth', label: '지구과학', keyword: '지구과학', color: '#7eb8ff' },
  { key: 'physics', label: '물리학', keyword: '물리학', color: '#b388ff' },
  { key: 'life', label: '생명과학', keyword: '생명과학', color: '#69db9c' },
  { key: 'chemistry', label: '화학', keyword: '화학', color: '#ffd966' },
];

function getApiKey() {
  return process.env.ALADIN_API_KEY || '';
}

function buildUrl(endpoint, params) {
  const key = getApiKey();
  if (!key) throw new Error('ALADIN_API_KEY 환경변수가 설정되지 않았어요.');

  const search = new URLSearchParams({
    ttbkey: key,
    output: 'js',
    Version: '20131101',
    Cover: 'Big',
    ...params,
  });

  return `${API_BASE}/${endpoint}?${search}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`알라딘 API 오류 (${res.status})`);
  const data = await res.json();
  if (data.errorCode) {
    throw new Error(data.errorMessage || '알라딘 API 요청에 실패했어요.');
  }
  return data;
}

function mapBookItem(item) {
  return {
    itemId: item.itemId,
    title: item.title || '',
    author: item.author || '',
    cover: item.cover || '',
    description: item.description || '',
    categoryName: item.categoryName || '',
    publisher: item.publisher || '',
    pubDate: item.pubDate || '',
    itemPage: item.subInfo?.itemPage || null,
    bestRank: item.bestRank || null,
    isbn13: item.isbn13 || '',
  };
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()（）\[\]]/g, '');
}

function authorMatches(bookAuthor, queryAuthor) {
  const a = normalizeText(bookAuthor);
  const q = normalizeText(queryAuthor);
  return a.includes(q) || q.includes(a);
}

function titleMatches(bookTitle, queryTitle) {
  const t = normalizeText(bookTitle);
  const q = normalizeText(queryTitle);
  return t === q || t.includes(q) || q.includes(t);
}

async function fetchFieldBookCount(keyword) {
  const url = buildUrl('ItemSearch.aspx', {
    Query: keyword,
    QueryType: 'Keyword',
    SearchTarget: 'Book',
    MaxResults: '1',
    start: '1',
  });
  const data = await fetchJson(url);
  return data.totalResults || 0;
}

async function fetchScienceStats() {
  const stats = await Promise.all(
    SCIENCE_FIELDS.map(async (field) => ({
      key: field.key,
      label: field.label,
      color: field.color,
      count: await fetchFieldBookCount(field.keyword),
    })),
  );
  return { fields: stats };
}

async function fetchBestsellers(maxResults = 10, start = 1) {
  const url = buildUrl('ItemList.aspx', {
    QueryType: 'Bestseller',
    SearchTarget: 'Book',
    MaxResults: String(maxResults),
    start: String(start),
  });

  const data = await fetchJson(url);
  const items = data.item || [];

  const enriched = await Promise.all(
    items.map(async (item) => {
      const book = mapBookItem(item);
      if (!book.itemPage) {
        try {
          const detail = await getBookDetail(book.itemId);
          book.itemPage = detail.itemPage;
        } catch {
          /* ignore */
        }
      }
      return book;
    }),
  );

  return { totalResults: data.totalResults || 0, items: enriched };
}

async function searchBooks(query, queryType = 'keyword', maxResults = 20, start = 1) {
  const type = QUERY_TYPE_MAP[queryType] || 'Keyword';
  const trimmed = String(query || '').trim();
  if (!trimmed) throw new Error('검색어를 입력해 주세요.');

  const url = buildUrl('ItemSearch.aspx', {
    Query: trimmed,
    QueryType: type,
    SearchTarget: 'Book',
    MaxResults: String(maxResults),
    start: String(start),
  });

  const data = await fetchJson(url);
  const items = (data.item || []).map(mapBookItem);

  if (queryType === 'keyword') {
    const normalized = trimmed.toLowerCase();
    const titleUrl = buildUrl('ItemSearch.aspx', {
      Query: trimmed,
      QueryType: 'Title',
      SearchTarget: 'Book',
      MaxResults: String(maxResults),
      start: '1',
    });
    const titleData = await fetchJson(titleUrl);
    const titleItems = (titleData.item || []).map(mapBookItem);

    const exactMap = new Map();
    for (const book of [...items, ...titleItems]) {
      if (book.title.trim().toLowerCase() === normalized) {
        exactMap.set(book.itemId, book);
      }
    }
    const exactMatches = [...exactMap.values()];
    const exactIds = new Set(exactMatches.map((b) => b.itemId));
    const relatedBooks = items.filter((b) => !exactIds.has(b.itemId));

    return {
      queryType,
      query: trimmed,
      totalResults: data.totalResults || 0,
      exactMatches,
      relatedBooks,
      items,
    };
  }

  return {
    queryType,
    query: trimmed,
    totalResults: data.totalResults || 0,
    items,
  };
}

async function searchBooksByTitleAndAuthor(title, author, maxResults = 30) {
  const titleQ = String(title || '').trim();
  const authorQ = String(author || '').trim();
  if (!titleQ || !authorQ) {
    throw new Error('도서명과 저자명을 모두 입력해 주세요.');
  }

  const [titleData, authorData] = await Promise.all([
    fetchJson(
      buildUrl('ItemSearch.aspx', {
        Query: titleQ,
        QueryType: 'Title',
        SearchTarget: 'Book',
        MaxResults: String(maxResults),
        start: '1',
      }),
    ),
    fetchJson(
      buildUrl('ItemSearch.aspx', {
        Query: authorQ,
        QueryType: 'Author',
        SearchTarget: 'Book',
        MaxResults: String(maxResults),
        start: '1',
      }),
    ),
  ]);

  const merged = new Map();
  for (const item of [...(titleData.item || []), ...(authorData.item || [])]) {
    merged.set(item.itemId, mapBookItem(item));
  }

  const items = [...merged.values()].filter(
    (book) => titleMatches(book.title, titleQ) && authorMatches(book.author, authorQ),
  );

  return {
    queryType: 'both',
    title: titleQ,
    author: authorQ,
    totalResults: items.length,
    items,
  };
}

async function getBookDetail(itemId) {
  if (!itemId) throw new Error('도서 ID가 필요해요.');

  const url = buildUrl('ItemLookUp.aspx', {
    ItemId: String(itemId),
    ItemIdType: 'ItemId',
    OptResult: 'categoryIdList,description',
  });

  const data = await fetchJson(url);
  const item = data.item?.[0];
  if (!item) throw new Error('도서 정보를 찾을 수 없어요.');

  return {
    itemId: item.itemId,
    title: item.title || '',
    author: item.author || '',
    cover: item.cover || '',
    description: item.description || '',
    categoryName: item.categoryName || '',
    categories: formatTopCategories(item.categoryIdList || [], item.categoryName),
    publisher: item.publisher || '',
    pubDate: item.pubDate || '',
    itemPage: item.subInfo?.itemPage || null,
    isbn13: item.isbn13 || '',
  };
}

function formatTopCategories(categoryIdList, fallbackCategoryName) {
  const freq = new Map();

  for (const cat of categoryIdList) {
    const parts = (cat.categoryName || '')
      .split('>')
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      freq.set(part, (freq.get(part) || 0) + 1);
    }
  }

  if (freq.size === 0 && fallbackCategoryName) {
    for (const part of fallbackCategoryName.split('>').map((p) => p.trim()).filter(Boolean)) {
      freq.set(part, (freq.get(part) || 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .slice(0, 3)
    .map(([name]) => name);
}

module.exports = {
  fetchBestsellers,
  fetchScienceStats,
  searchBooks,
  searchBooksByTitleAndAuthor,
  getBookDetail,
  formatTopCategories,
};
