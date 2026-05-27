const readline = require('node:readline');
const { getTop3ByGenre } = require('./lib/recommend');

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const genreArg = process.argv.slice(2).join(' ').trim();
  const genre = genreArg || (await ask('장르(예: 인디, 발라드, 락): ')).trim();

  const data = await getTop3ByGenre(genre);

  if (data.error) {
    console.log(data.error);
    return;
  }

  console.log(`\n장르: ${data.genre}`);
  console.log(`검색어: ${data.query}`);
  console.log('좋아요 수 기준 TOP 3');
  data.songs.forEach((song) => {
    console.log(
      `${song.rank}. ${song.title} - ${song.artist} (♡ ${song.likeCnt})`,
    );
  });
}

main().catch((err) => {
  console.error('실행 중 오류:', err?.message || err);
  process.exitCode = 1;
});
