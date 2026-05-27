const { getTop3ByGenre } = require('../../lib/recommend');

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'GET만 지원해요.' }),
    };
  }

  try {
    const genre = event.queryStringParameters?.genre;
    const data = await getTop3ByGenre(genre);

    if (data.error && !data.songs.length) {
      return { statusCode: 400, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err?.message || '서버 오류가 발생했어요.',
        genre: '',
        query: '',
        songs: [],
      }),
    };
  }
};
