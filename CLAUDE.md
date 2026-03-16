# CLAUDE.md - Seller-Hub 프로젝트 규칙

## 프로젝트 개요

커머스 플랫폼에 입점한 브랜드 파트너(셀러)가 상품, 주문, 매출 데이터를 통합 관리하는 B2B 어드민 대시보드.
대규모 데이터의 고성능 렌더링과 복잡한 필터/정렬 상태 관리가 핵심 기술 과제이다.

## 기술 스택

- **프론트엔드**: Vite + React + TypeScript
- **백엔드(BaaS)**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **상태 관리**: Zustand (클라이언트 전역 상태)
- **데이터 페칭**: TanStack Query (서버 상태 관리)
- **데이터 그리드**: TanStack Table + TanStack Virtual (가상화 렌더링)
- **차트**: Recharts
- **CSS**: Tailwind CSS v4 (CSS-first 설정, `@tailwindcss/vite` 플러그인)
- **라우터**: React Router v7 (SPA 모드)
- **유틸리티**: clsx + tailwind-merge (cn 유틸)
- **린트/포매팅**: Biome
- **테스트**: Vitest + Testing Library
- **배포**: Vercel (프론트엔드), Supabase (백엔드)
- **버전 관리**: Git (GitHub Flow)

## 핵심 규칙

### 언어

- 코드 내 주석, 커밋 메시지, PR 설명 등 모든 문서는 **한국어**로 작성한다.

### 코드 스타일

- Biome 설정을 따른다. (`biome.json` 참조)
- TypeScript strict 모드를 사용한다.
- `any` 타입 사용을 금지한다. 불가피한 경우 `unknown`을 사용하고 타입 가드를 적용한다.
- 함수형 컴포넌트와 훅을 사용한다. 클래스 컴포넌트는 사용하지 않는다.
- 네이밍 컨벤션:
  - 컴포넌트: `PascalCase`
  - 함수/변수: `camelCase`
  - 상수: `UPPER_SNAKE_CASE`
  - 타입/인터페이스: `PascalCase`
  - 파일명: 컴포넌트는 `PascalCase.tsx`, 그 외는 `camelCase.ts`

### 브랜치 전략

- GitHub Flow 기반: `main` → `feature/*`, `fix/*`, `hotfix/*`
- 직접 `main` 푸시 금지. 반드시 PR을 통해 머지한다.

### 커밋 컨벤션

- Gitmoji + Conventional Commits 형식
- 예: `✨ feat: 사용자 로그인 기능 추가`
- 예: `🐛 fix: 토큰 만료 시 리다이렉트 오류 수정`

### 테스트 (TDD)

- **TDD(Test-Driven Development) 방식으로 개발한다.** 테스트 코드를 먼저 작성한 후 구현 코드를 작성한다.
- TDD 사이클: Red(실패하는 테스트 작성) → Green(테스트를 통과하는 최소 구현) → Refactor(코드 개선)
- 새로운 기능에는 반드시 테스트 코드를 포함한다.
- Vitest를 사용하며, 테스트 파일은 `*.test.ts` 또는 `*.test.tsx` 형식을 따른다.

### Supabase 사용 규칙

- Supabase 클라이언트는 `lib/supabase.ts`에서 단일 인스턴스로 생성하여 사용한다.
- SPA에서는 `createClient`를 사용한다. SSR 도입 시 클라이언트 구분은 [project-structure.md](docs/project-structure.md)를 참조한다.
- 데이터베이스 접근은 반드시 RLS(Row Level Security) 정책을 통해 보호한다.
- 직접 SQL보다 Supabase Client 메서드(`.from().select()` 등)를 우선 사용한다.
- 복잡한 비즈니스 로직은 Edge Functions 또는 Database Functions(RPC)로 처리한다.

### 프로젝트 고유 규칙

- 서버 상태(비동기 데이터)는 TanStack Query로 관리하고, 클라이언트 전역 상태는 Zustand로 관리한다.
- 데이터 그리드는 TanStack Table + TanStack Virtual을 사용하여 가상화 렌더링을 적용한다.
- 차트는 Recharts를 사용하며, 반응형 컨테이너(`ResponsiveContainer`)를 필수로 적용한다.
- Tailwind CSS v4 CSS-first 방식을 따르며, `tailwind.config.js` 대신 CSS `@theme` 블록으로 커스텀 값을 정의한다.
- React Router v7을 SPA 모드로 사용하며, 라우팅은 `src/app/App.tsx`에서 중앙 관리한다.
- 조건부 클래스 조합 시 `cn()` 유틸리티(`src/utils/cn.ts`)를 사용한다.

### 보안

- **기능 개발 시 보안 검토를 필수로 수행한다.** 구현 완료 후 보안 체크리스트를 점검한다.
- 환경변수로 시크릿을 관리한다. 코드에 하드코딩 금지.
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY`는 클라이언트에 노출 가능하지만, `SERVICE_ROLE_KEY`는 서버 측에서만 사용한다.
- 사용자 입력은 반드시 검증하고 새니타이즈한다.
- OWASP Top 10을 준수한다.
- 모든 테이블에 RLS 정책을 활성화한다.
- 보안 관련 상세 체크리스트는 [security-guide.md](docs/security-guide.md)를 참조한다.

### 에러 처리

- 프론트엔드: Error Boundary + try-catch 패턴
- Supabase: `{ data, error }` 패턴으로 에러를 처리한다. `error`를 항상 확인한다.

## 상세 문서 참조

각 항목에 대한 상세 내용은 아래 문서를 참조한다.

| 문서 | 설명 |
|------|------|
| [docs/prd.md](docs/prd.md) | 제품 요구사항 문서 (PRD) |
| [docs/git-workflow.md](docs/git-workflow.md) | Git 워크플로우 및 브랜치 전략 |
| [docs/commit-convention.md](docs/commit-convention.md) | 커밋 메시지 컨벤션 |
| [docs/project-structure.md](docs/project-structure.md) | 프로젝트 폴더 구조 가이드 |
| [docs/lint-config.md](docs/lint-config.md) | Biome 린트/포매팅 설정 |
| [docs/design-guide.md](docs/design-guide.md) | 디자인 가이드 (UI 컨벤션 + 디자인 시스템) |
| [docs/testing-guide.md](docs/testing-guide.md) | 테스트 코드 가이드 |
| [docs/security-guide.md](docs/security-guide.md) | 보안 가이드 |
| [docs/cicd-guide.md](docs/cicd-guide.md) | CI/CD 설정 가이드 |
| [docs/code-review-checklist.md](docs/code-review-checklist.md) | 코드 리뷰 체크리스트 |
| [docs/error-handling.md](docs/error-handling.md) | 에러 핸들링 가이드 |
| [docs/dev-environment.md](docs/dev-environment.md) | 개발 환경 셋업 가이드 |
| [docs/state-management.md](docs/state-management.md) | 상태 관리 전략 |
| [docs/performance-guide.md](docs/performance-guide.md) | 성능 최적화 가이드 |
| [docs/data-modeling.md](docs/data-modeling.md) | 데이터 모델링 가이드 |
| [docs/maintainability-guide.md](docs/maintainability-guide.md) | 유지보수 가이드 (아키텍처·설계 원칙) |
