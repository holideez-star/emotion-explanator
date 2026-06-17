const { fetchBestsellers } = require('../../lib/aladin');

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'GET만 지원해요.' }) };
  }
  try {
    const max = Math.min(Number(event.queryStringParameters?.max) || 10, 20);
    const start = Number(event.queryStringParameters?.start) || 1;
    const data = await fetchBestsellers(max, start);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || '베스트셀러를 불러오지 못했어요.', items: [] }),
    };
  }
};
