# emotion-explanator

## 멜론 데이터 기반 “장르 → 인기 3곡” 추천기

`melona`(멜론 비공식 스크래핑 라이브러리)로 장르 키워드를 검색한 뒤 **좋아요 수(likeCnt) 기준 TOP 3**를 추천합니다.

### 1) 설치

```bash
npm install
```

### 2) 웹 UI 실행 (권장)

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열고, 장르를 입력한 뒤 **추천** 버튼을 누르세요.

### 3) CLI 실행 (터미널)

```bash
npm run cli -- "인디"
```

또는

```bash
npm run cli
```

프롬프트에 장르를 입력하면 결과가 출력됩니다.

### 동작 방식

- `searchSong()`은 장르 태그가 아니라 **검색 키워드**로 동작합니다.
- 입력한 장르는 내부 매핑으로 검색어로 바꿉니다 (예: `인디` → `인디 음악`, `락` → `록`).
- 검색 결과 중 좋아요 수 상위 3곡을 반환합니다.

### Netlify 배포 (https://resilient-treacle-e99614.netlify.app)

Netlify는 **HTML만** 올리면 `/api/recommend` 가 404입니다.  
`netlify/functions/recommend.js` + `netlify.toml` 이 GitHub에 올라가야 합니다.

**자세한 단계:** [DEPLOY-NETLIFY.md](./DEPLOY-NETLIFY.md)

1. `npm install` (한 번)
2. 변경 파일을 GitHub에 **push**
3. Netlify **Deploys** → Published 확인
4. API 테스트: `/api/recommend?genre=인디` → JSON이 나오면 성공

로컬: `npm run dev` → http://localhost:3000

### 파일 구조

| 파일 | 설명 |
|------|------|
| `index.html` | 브라우저 UI |
| `server.js` | 로컬용 Express 서버 + `/api/recommend` |
| `netlify/functions/recommend.js` | Netlify 배포용 API |
| `netlify.toml` | Netlify 설정 (API 경로 연결) |
| `cli.js` | 터미널용 CLI |
| `lib/recommend.js` | 장르 매핑 + 멜론 검색 공통 로직 |
