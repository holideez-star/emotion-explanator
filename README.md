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

### 파일 구조

| 파일 | 설명 |
|------|------|
| `index.html` | 브라우저 UI |
| `server.js` | Express 서버 + `/api/recommend` API |
| `cli.js` | 터미널용 CLI |
| `lib/recommend.js` | 장르 매핑 + 멜론 검색 공통 로직 |
