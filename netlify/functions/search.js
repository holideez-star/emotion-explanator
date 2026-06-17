const { searchBooks, searchBooksByTitleAndAuthor } = require('../../lib/aladin');

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'GET만 지원해요.' }) };
  }
  try {
    const params = event.queryStringParameters || {};
    if (params.type === 'both') {
      const data = await searchBooksByTitleAndAuthor(params.title, params.author);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
    const data = await searchBooks(params.q, params.type || 'keyword');
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: err?.message || '검색에 실패했어요.',
        items: [],
        exactMatches: [],
        relatedBooks: [],
      }),
    };
  }
};
