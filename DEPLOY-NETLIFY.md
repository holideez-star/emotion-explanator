# Netlify에 올려서 바로 쓰기 (초보용)

404가 나는 이유: **예전 배포에는 API 파일이 없었기 때문**입니다.  
아래 파일이 GitHub에 올라가고 Netlify가 **다시 배포**해야 작동합니다.

## 반드시 GitHub에 있어야 하는 파일

- `index.html`
- `package.json`
- `package-lock.json` (프로젝트 폴더에서 `npm install` 한 뒤 생김)
- `netlify.toml`
- `_redirects`
- `lib/recommend.js`
- `netlify/functions/recommend.js`

## 방법 A: GitHub Desktop (추천)

1. [GitHub Desktop](https://desktop.github.com/) 설치
2. **File → Add local repository** → 이 폴더 선택  
   `emotion-explanator`
3. 왼쪽에 변경된 파일이 보이면 **Summary**에 `Netlify API 추가` 입력 → **Commit**
4. **Push origin** 클릭
5. [Netlify](https://app.netlify.com) → 내 사이트 → **Deploys**  
   → 새 배포가 **Published** 될 때까지 대기 (1~3분)
6. `https://resilient-treacle-e99614.netlify.app` 에서 **인디** 검색 테스트

## 방법 B: GitHub 웹사이트에서 직접 업로드

1. GitHub 저장소 페이지 → **Add file → Upload files**
2. 위 “반드시 있어야 하는 파일”들을 드래그
3. **Commit changes**
4. Netlify Deploys에서 자동 재배포 확인

## 배포가 됐는지 확인

브라우저에서 아래 주소를 열어 보세요.

`https://resilient-treacle-e99614.netlify.app/api/recommend?genre=인디`

- **JSON** (곡 목록)이 보이면 성공
- **404**면 아직 Functions가 배포 안 된 것 → Deploys 로그 확인

## 로컬에서 먼저 테스트 (Node 설치됨)

```bash
npm install
npm run dev
```

브라우저: http://localhost:3000
