# AGENTS.md — 인수인계 / 작업 가이드

한국공학대학교 일학습병행 공동훈련센터 지원단의 **VOC 관리일지** 정적 대시보드.
- 운영 URL: https://chlee0730.github.io/hub/
- 레포: https://github.com/chlee0730/hub (Public, 기본 브랜치 `main`)
- 참고 원본: https://swlc1.github.io/KAP-VOC/ (레이아웃·동작을 동일하게 재구성)

## 결정 사항 (변경 시 담당자 확인)
- **서버·DB·로그인 없음.** GitHub Pages 정적 호스팅만 사용. 사용자 관리/웹 입력 게시판은 외부 클라우드(Supabase 등) 또는 VM이 필요해 보류함.
- **데이터 원본은 엑셀** `data/voc.xlsx`. 담당자가 엑셀을 수정해 GitHub 웹에서 업로드 → 자동 배포.
- 디자인은 **한국공학대학교 UI** 적용: 전용색 TU BLUE `#1758A8`, TU SKY BLUE `#068FD3`, TU MINT `#01B3CD`, 시그니처·심벌·마스코트 티노.
- 티노 이미지는 학교 사용 매뉴얼 준수 대상(무단 복제·변경 금지). **캐릭터·로고를 새로 그리거나 변형하지 말 것.** 공식 파일만 사용.

## 스택
- Vite 6 + TypeScript(바닐라, 프레임워크 없음) + 순수 CSS
- `exceljs`로 빌드 시 엑셀 → JSON 변환
- 배포: `.github/workflows/deploy.yml` (main push → build → GitHub Pages). Pages Source = GitHub Actions

## 명령어
```bash
npm install
npm run dev        # 엑셀 변환 후 로컬 서버 (http://localhost:5173/hub/)
npm run build      # 엑셀 변환 + 타입체크 + dist/ 빌드 (커밋 전 반드시 통과)
npm run template   # data/voc.xlsx 양식 생성 (기존 파일 있으면 건너뜀, -- --force 로 덮어쓰기)
```

## 구조
```
data/voc.xlsx              원본 데이터 (시트: VOC, 설정)
scripts/columns.mjs        엑셀 헤더 ↔ JSON 필드 매핑, 허용 상태/유형 값
scripts/xlsx2json.mjs      data/voc.xlsx → public/data/voc.json (빌드 산출물, gitignore)
scripts/make-template.mjs  입력 양식(드롭다운 검증 포함) 생성
src/config.ts              화면 문구(SITE), 브랜드 이미지 경로(BRAND)
src/main.ts                데이터 로드, 요약 통계, 검색/필터/더보기 렌더링
src/style.css              디자인 (:root 토큰, 반응형 900px/680px, 인쇄)
public/brand/              signature.png, symbol.png, tino.png (없으면 해당 영역 자동 숨김)
public/preview.png         OG 공유 이미지 (1200x630, 화면 캡처)
index.html                 마크업, OG 메타, 파비콘
```

## 데이터 규칙
- VOC 시트 1행 헤더: 번호, 커뮤니티, 간담회, 접수일, 유형, 관련분류, 질의·건의 내용, 건의 사유, 현장 응답 내용, 조치 상태, 조치 구분, 조치 내용, 비고 (순서 무관, **이름은 고정**)
- 필수: 접수일, 질의·건의 내용 (내용 빈 행은 무시). 번호 비면 자동 부여
- 조치 상태: 완료 / 진행중 / 장기검토 (빈 값 = 미정). 유형: 질의 / 건의
- `-` 값은 화면에서 숨김. 설정 시트 `최신화일` → 화면 "최신화" (비면 최근 접수일)
- 요약 수치(누적/완료/완료율)와 필터 선택지는 데이터에서 자동 계산 — 하드코딩 금지
- 질의·건의자와 응답자의 기관명·이름은 기록하지 않음 (비고에 기관명이 들어가지 않도록 주의)

## 작업 규칙
- 레포 이름 변경 시 `vite.config.ts`의 `base`와 `index.html`의 og:url/canonical/og:image 함께 수정
- 문구는 `src/config.ts`, 색은 `src/style.css` `:root`에서만 변경
- HTML 삽입 시 반드시 `esc()` 사용 (XSS 방지)
- 화면 변경 후 데스크톱(1280px)과 모바일(390px) 모두 확인
- 커밋 메시지는 한국어, 변경 요지 1줄 + 필요 시 상세

## 현재 상태 / 남은 일
- 완료: 대시보드, 엑셀 파이프라인, 자동 배포, TU 브랜딩, 기관명 변경
- `data/voc.xlsx`에는 **샘플 8건(S-0001~S-0008)**만 있음 → 실제 데이터로 교체 필요
- `public/preview.png`는 기관명 변경 전 캡처 → 재캡처 필요
- 공개 사이트의 티노 사용은 학교 홍보소통팀(031-8041-0294) 확인 권장
