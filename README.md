# VOC 관리일지

현장 질의·건의와 조치 현황을 보여주는 정적 대시보드입니다.
https://chlee0730.github.io/hub/

## 데이터 갱신 (담당자)

1. `data/voc.xlsx`를 엑셀로 열어 **VOC** 시트에 행을 추가하거나 수정합니다.
2. **설정** 시트의 `최신화일`을 바꿉니다. 비우면 가장 최근 접수일이 쓰입니다.
3. 파일을 커밋하고 push합니다. 1~2분 뒤 사이트에 반영됩니다.
   - GitHub 웹에서: `data` 폴더 → **Add file → Upload files** → `voc.xlsx` 덮어쓰기 → Commit

### 엑셀 컬럼

| 헤더 | 필수 | 값 |
|---|---|---|
| 번호 | | 비우면 자동 부여 |
| 커뮤니티 | | 예: 2026년 1차 |
| 접수일 | ✅ | 날짜 (2026-02-23) |
| 유형 | | 질의 / 건의 |
| 관련분류 | | 비우면 "분류 예정" |
| 질의·건의 내용 | ✅ | 빈 행은 무시 |
| 건의 사유 | | `-`는 숨김 |
| 현장 응답 내용 | | 비우면 "답변 준비 중" |
| 조치 상태 | | 완료 / 진행중 / 장기검토 (비우면 미정) |
| 조치 구분 · 조치 내용 · 비고 | | |

헤더 이름만 맞으면 컬럼 순서는 자유입니다. 필터 선택지(커뮤니티·유형·관련분류)는 데이터에서 자동으로 추출됩니다.

## 개발

```bash
npm install
npm run dev        # 로컬 확인 (http://localhost:5173/hub/)
npm run build      # dist/ 생성
npm run template   # 빈 양식 재생성 (기존 파일 보존, 덮어쓰기: -- --force)
```

- 사이트 문구: `src/config.ts`
- 색상: `src/style.css`의 `:root`
- 레포명을 바꾸면 `vite.config.ts`의 `base`와 `index.html`의 URL도 함께 수정

## 구조

```
data/voc.xlsx            원본 데이터 (담당자 관리)
scripts/xlsx2json.mjs    빌드 시 엑셀 → public/data/voc.json
src/                     화면 (Vite + TypeScript)
.github/workflows/       push 시 GitHub Pages 자동 배포
```
