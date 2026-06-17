# Netlify 배포 안내

## 환경변수 (필수)

Netlify 대시보드 → **Site configuration → Environment variables**

| Key | Value |
|-----|-------|
| `ALADIN_API_KEY` | 알라딘 TTBKey |

## GitHub에 필요한 파일

- `index.html`
- `package.json`, `package-lock.json`
- `netlify.toml`, `_redirects`
- `lib/aladin.js`
- `netlify/functions/bestseller.js`
- `netlify/functions/search.js`
- `netlify/functions/book.js`
- `netlify/functions/science-stats.js`

## 배포 확인

- `https://내사이트.netlify.app/api/science-stats` → JSON이 보이면 성공
- 사이트에서 검색·그래프·베스트셀러 동작 확인

## 로컬 테스트

```bash
npm install
npm run dev
```

http://localhost:3000
