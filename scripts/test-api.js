const http = require('node:http');

const genre = process.argv[2] || '인디';
const port = process.env.PORT || 3000;
const path = `/api/recommend?genre=${encodeURIComponent(genre)}`;

http
  .get({ hostname: 'localhost', port, path }, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('status:', res.statusCode);
      console.log(body);
    });
  })
  .on('error', (err) => {
    console.error('연결 실패. 먼저 npm run dev 를 실행하세요.');
    console.error(err.message);
    process.exit(1);
  });
