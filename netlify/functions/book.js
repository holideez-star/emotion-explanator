const { getBookDetail } = require('../../lib/aladin');

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'GET만 지원해요.' }) };
  }
  try {
    const data = await getBookDetail(event.queryStringParameters?.itemId);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: err?.message || '도서 정보를 불러오지 못했어요.' }),
    };
  }
};
