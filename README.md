# 신신당부 관리자 대시보드

신신당부(Sinsin) 서비스의 관리자용 통계 대시보드입니다.

## 주요 기능

- 전체/활성 유저 수, 신규 가입, 탈퇴 현황
- 날짜별 신규 가입자 차트 + 가입 유저 이메일 목록
- 날짜별 식단 기록, 채팅 메시지, 체중 기록, 커뮤니티 게시글 차트
- CKD 단계 분포 (Pie Chart)
- 식단 기록 Top 10 유저
- 기간 선택 (7/14/30/60/90일)
- 비밀번호 기반 로그인

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS v4
- **Charts**: Recharts
- **Database**: PostgreSQL (pg)
- **Deploy**: Vercel

## 환경변수

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 (`postgresql://user:pass@host:5432/db`) |
| `ADMIN_PASSWORD` | 대시보드 로그인 비밀번호 |

## 로컬 개발

```bash
# 환경변수 설정
cp .env.local.example .env.local
# .env.local 에서 DATABASE_URL, ADMIN_PASSWORD 수정

# 의존성 설치 및 실행
npm install
npm run dev
```

http://localhost:3000 에서 확인

## 배포 (Vercel)

이 프로젝트는 GitHub 연동으로 `main` 브랜치에 push 시 자동 배포됩니다.

**프로덕션 URL**: https://sinsin-admin-dashboard.vercel.app

### 환경변수 설정

Vercel 대시보드 > Settings > Environment Variables 에서 설정하거나 CLI로:

```bash
# DATABASE_URL (Cloud SQL Public IP 사용)
printf '%s' 'postgresql://sinsin_app:<password>@34.64.62.241:5432/sinsin' | vercel env add DATABASE_URL production

# ADMIN_PASSWORD
printf '%s' '<password>' | vercel env add ADMIN_PASSWORD production
```

### 수동 배포

```bash
vercel deploy --prod
```

### Cloud SQL 연결 참고

- Cloud SQL 인스턴스: `sinsin-486209:asia-northeast3:sinsin-pg`
- Vercel Serverless Function에서는 Unix 소켓이 아닌 **Public IP + TCP** 연결 사용
- 프로덕션 DATABASE_URL은 GCP Secret Manager (`FASTAPI_DATABASE_URL`)에서 확인 가능:
  ```bash
  gcloud secrets versions access latest --secret=FASTAPI_DATABASE_URL --project=sinsin-486209
  ```
  단, Unix 소켓 형식이므로 `host` 부분을 Public IP(`34.64.62.241`)로 변환 필요

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지 (로그인/대시보드)
│   ├── layout.tsx            # 루트 레이아웃
│   └── api/
│       ├── stats/route.ts    # 통계 데이터 API
│       ├── login/route.ts    # 로그인 API
│       └── logout/route.ts   # 로그아웃 API
├── components/
│   ├── Dashboard.tsx         # 대시보드 메인 컴포넌트
│   ├── ChartCard.tsx         # 차트 컴포넌트 (Area, Bar, Pie)
│   ├── StatCard.tsx          # 숫자 요약 카드
│   └── LoginForm.tsx         # 로그인 폼
└── lib/
    ├── db.ts                 # PostgreSQL 연결 풀
    └── auth.ts               # 쿠키 기반 인증
```
