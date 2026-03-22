# Seller-Hub 엔터프라이즈 확장 리서치

> 작성일: 2026-03-22
> 목적: 현재 v0.3 수준의 seller-hub를 엔터프라이즈급 B2B SaaS로 확장하기 위해 필요한 기능과 개선사항을 체계적으로 정리한다.

---

## 1. 현재 구현 현황

### 1.1 구현 완료

| 영역 | 구현 내용 | 핵심 기술 |
|------|----------|----------|
| **대시보드** | KPI 위젯 4개, 매출 추이 차트, 카테고리 파이 차트, 최근 주문 | Recharts, ResponsiveContainer |
| **주문 관리** | 복합 필터링(상태·기간·검색), 다중 정렬, URL 쿼리 동기화 | TanStack Table + Virtual |
| **상품 관리** | 카테고리·상태 필터, 정렬, URL 동기화 | TanStack Table + Virtual |
| **매출 분석** | 기간별(7/30/90일) 요약, 추이 비교, 카테고리 분포, 상위 상품 | Recharts, RPC 함수 |
| **데이터 그리드** | 가상화 렌더링 (ROW_HEIGHT=48px, overscan=10, 560px 뷰포트) | TanStack Virtual |
| **서비스 레이어** | orderService, productService, analyticsService | Supabase Client |
| **서버 상태** | TanStack Query (staleTime 5분, keepPreviousData, 폴백 데이터) | TanStack Query |
| **DB** | 2개 테이블 (orders, products), 6개 RPC 함수, 인덱싱 | PostgreSQL 17 |
| **UI 시스템** | Button, Card, Badge, Pagination, Skeleton, TabGroup | Tailwind CSS v4 |
| **CI/CD** | lint → type-check → test → build 파이프라인 | GitHub Actions + Vercel |

### 1.2 아키텍처 약점 진단

코드 분석을 통해 발견된 구체적 문제점:

| 약점 | 위치 | 상세 |
|------|------|------|
| **인증 부재** | `src/lib/supabase.ts` | `createClient`만 존재. Auth 연동 없음. 비인증 사용자도 전체 데이터 접근 가능 |
| **RLS 전체 공개** | `supabase/migrations/` | `USING (true)` 정책으로 anon 사용자에게 전체 데이터 노출 |
| **셀러 격리 불가** | `orders`, `products` 테이블 | `seller_id` 컬럼 부재. 멀티테넌트 데이터 격리 불가능 |
| **비정규화** | `orders.product_name` | TEXT 타입 (FK 아님). 상품명 변경 시 데이터 불일치 발생 |
| **가격 정밀도** | `orders.unit_price`, `total_price` | INT 타입. 소수점 금액 처리 불가 |
| **감사 추적 불가** | 전체 테이블 | `created_by`, `updated_by` 필드 없음 |
| **Error Boundary 없음** | `src/app/App.tsx` | 컴포넌트 에러 시 전체 앱 크래시. CLAUDE.md 규칙 위반 |
| **코드 스플리팅 미적용** | `src/app/App.tsx` | 4개 페이지 정적 import. React.lazy 미사용 |
| **Zustand 미사용** | `package.json` | `zustand@^5.0.12` 설치되었으나 `src/stores/` 디렉토리 자체 부재 |
| **테스트 부재** | 프로젝트 전체 | 테스트 파일 0개. TDD 원칙 미준수 |
| **Read-only** | 주문/상품 페이지 | 조회만 가능. 등록/수정/삭제(CUD) 미구현 |

---

## 2. 엔터프라이즈 확장 기능 목록

> **우선순위 기준**
> - **P0**: 프로덕션 배포 전 반드시 해결 (보안·안정성 크리티컬)
> - **P1**: 엔터프라이즈 최소 요건 (핵심 비즈니스 기능)
> - **P2**: 기능 완성도 향상 (사용자 경험·운영 효율)
> - **P3**: 부가 기능 (차별화·장기 확장)

### 2.1 인증 및 권한 관리

- [ ] **[P0]** Supabase Auth 연동 (로그인/로그아웃/세션 관리)
  - 근거: PRD v1.0 마일스톤 명시 항목. 현재 인증 없이 모든 데이터 공개 상태
  - 범위: `useAuth` 훅, 로그인 페이지, 세션 갱신 로직

- [ ] **[P0]** 보호 라우트 (`ProtectedRoute`) 구현
  - 근거: 비인증 사용자의 대시보드/주문/상품 페이지 접근 차단 필요
  - 범위: `App.tsx` 라우트 래핑, 리다이렉트 로직

- [ ] **[P1]** 역할 기반 접근 제어 (RBAC: admin / seller / viewer)
  - 근거: 셀러 조직 내 팀원별 권한 분리 필요 (MD는 조회만, 관리자는 수정 가능)
  - 범위: `user_roles` 테이블, `usePermission` 훅, UI 조건부 렌더링

- [ ] **[P2]** 비밀번호 재설정, 이메일 인증 플로우
  - 근거: 프로덕션 서비스 필수 기능. Supabase Auth 내장 지원

### 2.2 멀티테넌트 및 데이터 격리

- [ ] **[P0]** `sellers` 테이블 생성 및 `seller_id` FK 추가
  - 근거: 현재 모든 셀러 데이터가 섞여있어 B2B SaaS로 운영 불가능
  - 범위: `sellers` 테이블 마이그레이션, `orders`·`products`에 `seller_id UUID REFERENCES sellers(id)` 추가

- [ ] **[P0]** RLS 정책 교체: `USING (true)` → `USING (seller_id = auth.uid())`
  - 근거: 현재 `anon_read_orders`, `anon_read_products` 정책이 전체 데이터 공개
  - 범위: 기존 정책 DROP → seller 기반 SELECT/INSERT/UPDATE/DELETE 정책 생성

- [ ] **[P1]** RPC 함수에 `seller_id` 필터 추가
  - 근거: `get_kpi_metrics`, `get_sales_data` 등 6개 RPC가 전체 데이터 집계 중
  - 범위: 모든 RPC에 `WHERE seller_id = auth.uid()` 조건 추가

### 2.3 데이터 모델 정규화 및 무결성

- [ ] **[P1]** `orders.product_name` TEXT → `product_id` UUID FK로 변경
  - 근거: 상품명 변경 시 주문 데이터 불일치 발생. `orders.category`도 JOIN으로 해결
  - 범위: 마이그레이션 + 서비스 레이어 쿼리 수정 + 프론트엔드 타입 변경

- [ ] **[P1]** 가격 필드 `INT` → `NUMERIC(12,2)`로 변경
  - 근거: 소수점 금액 처리 불가. 정산 시 1원 미만 절사 문제 발생 가능
  - 범위: `orders.unit_price`, `orders.total_price`, `products.unit_price`

- [ ] **[P1]** 감사 필드 추가 (`created_by`, `updated_by`)
  - 근거: 누가 데이터를 변경했는지 추적 불가. 엔터프라이즈 감사(audit) 요건
  - 범위: 전체 테이블에 `UUID REFERENCES auth.users(id)` 추가

- [ ] **[P2]** 소프트 딜리트 (`deleted_at TIMESTAMPTZ`) 적용
  - 근거: 실수 삭제 복구 불가. `docs/data-modeling.md`에 패턴 명시되어 있으나 미적용
  - 범위: 전체 테이블 + RLS 정책에 `AND deleted_at IS NULL` 조건 추가

- [ ] **[P2]** `order_items` 조인 테이블 도입 (주문 1:N 상품)
  - 근거: 현재 주문 1건 = 상품 1개 구조. 복합 주문(장바구니) 불가능
  - 범위: `order_items` 테이블 + orders 테이블 구조 변경

- [ ] **[P3]** `categories` 마스터 테이블 생성
  - 근거: 현재 TEXT 자유입력이라 오타/불일치 리스크. 카테고리 관리 기능 기반
  - 범위: `categories` 테이블 + FK 연결

### 2.4 프론트엔드 안정성 및 성능

- [ ] **[P0]** Error Boundary 구현
  - 근거: CLAUDE.md에 "Error Boundary + try-catch 패턴" 명시. 현재 컴포넌트 에러 시 전체 앱 크래시
  - 범위: 글로벌 Error Boundary + 페이지별 Error Boundary + 에러 복구 UI

- [ ] **[P1]** React.lazy + Suspense 코드 스플리팅
  - 근거: PRD 비기능 요구사항 "LCP 2.5초 이내". `App.tsx`에서 4개 페이지 정적 import 중
  - 범위: 페이지 컴포넌트 동적 import + Suspense fallback UI

- [ ] **[P1]** Zustand 스토어 활용
  - 근거: `zustand@5.0.12` 설치되었으나 `src/stores/` 없음. CLAUDE.md에 "클라이언트 전역 상태는 Zustand" 명시
  - 범위: UI 상태 스토어 (사이드바 토글, 테마), 필터 프리셋 저장, 사용자 설정

- [ ] **[P2]** 페이지 크기 사용자 설정
  - 근거: OrdersPage `PAGE_SIZE=100`, ProductsPage `PAGE_SIZE=50` 하드코딩. 사용자별 선호 다름
  - 범위: 드롭다운 UI + Zustand 저장

- [ ] **[P2]** 토스트/알림 시스템
  - 근거: 현재 사용자 피드백 없음. 에러·성공·경고 메시지를 사용자에게 전달할 수단 부재
  - 범위: Toast 컴포넌트 + Zustand 알림 스토어

### 2.5 주문 관리 고도화

- [ ] **[P1]** 주문 상세 페이지 (`/orders/:id`)
  - 근거: 현재 리스트만 존재. 주문 상세 정보, 배송 타임라인, 변경 이력 표시 필요
  - 범위: 라우트 추가 + 상세 페이지 컴포넌트 + 서비스 함수

- [ ] **[P1]** 주문 상태 변경 기능 (CUD)
  - 근거: 현재 Read-only. 셀러가 "배송 준비중→배송중" 등 상태 전환 필요
  - 범위: 상태 변경 API + 확인 모달 + Optimistic Update

- [ ] **[P2]** 배송 추적 연동
  - 근거: `shipped_at`, `delivered_at` 컬럼은 있으나 실제 배송 추적 미구현
  - 범위: 택배사/송장번호 필드 추가, 배송 상태 자동 업데이트

- [ ] **[P2]** 반품/교환 상세 이력 관리
  - 근거: 상태값(`RETURN_REQUESTED`, `EXCHANGE_REQUESTED`)은 있으나 처리 플로우 없음
  - 범위: `return_requests` 테이블 + 처리 UI + 상태 전이 로직

- [ ] **[P2]** 데이터 내보내기 (CSV/Excel)
  - 근거: 셀러 실무자의 정산/리포팅 니즈. 필터 적용된 데이터를 다운로드
  - 범위: CSV 생성 유틸 + 다운로드 버튼 + 서버사이드 생성 (대용량)

- [ ] **[P3]** 주문 메모/태그 기능
  - 근거: 팀 내 커뮤니케이션용. 특정 주문에 메모 첨부
  - 범위: `order_notes` 테이블 + 메모 입력 UI

### 2.6 상품 관리 고도화

- [ ] **[P1]** 상품 등록/수정/삭제 (CUD)
  - 근거: 현재 Read-only. 상품 CRUD는 커머스 플랫폼의 핵심 기능
  - 범위: 상품 등록 폼 + 수정 모달 + 삭제 확인 + Mutation 훅

- [ ] **[P2]** 상품 옵션 관리 (색상/사이즈 등)
  - 근거: 패션의류 카테고리에서 옵션 없이 상품 관리 불가능
  - 범위: `product_options` 테이블 + 옵션별 재고/가격 관리 UI

- [ ] **[P2]** 이미지 업로드 (Supabase Storage)
  - 근거: 상품 이미지 관리 필수. PRD 기술스택에 Storage 명시
  - 범위: 이미지 업로드 컴포넌트 + Storage 버킷 설정 + 이미지 최적화

- [ ] **[P2]** SKU 자동 생성 규칙
  - 근거: 현재 수동 입력. 대량 상품 등록 시 휴먼 에러 발생
  - 범위: 카테고리 코드 + 일련번호 기반 자동 생성 로직

- [ ] **[P3]** 상품 일괄 등록 (CSV 업로드)
  - 근거: 수백 개 상품을 개별 등록하는 것은 비효율적
  - 범위: CSV 파싱 + 유효성 검증 + 벌크 INSERT + 진행률 표시

### 2.7 매출 분석 고도화

- [ ] **[P2]** 커스텀 기간 설정 (DateRangePicker)
  - 근거: 현재 7/30/90일 고정 탭만 지원. 프로모션 기간 등 자유 기간 분석 불가
  - 범위: DateRangePicker 컴포넌트 + RPC 함수 파라미터 확장

- [ ] **[P2]** 분석 리포트 다운로드 (PDF/Excel)
  - 근거: 셀러 정산 리포팅, 경영진 보고용 자료 생성
  - 범위: 차트 이미지 캡처 + 데이터 테이블 내보내기

- [ ] **[P3]** 전년 동기 대비 분석
  - 근거: 현재 이전 기간 비교만 지원. 계절성 분석을 위해 YoY 비교 필요
  - 범위: RPC 함수 확장 + 비교 차트 UI

- [ ] **[P3]** 대시보드 위젯 커스터마이징
  - 근거: 셀러별 관심 지표가 다름. 위젯 배치/표시 여부 선택
  - 범위: 위젯 설정 저장 (Zustand + DB) + 드래그앤드롭 레이아웃

### 2.8 운영 및 모니터링

- [ ] **[P1]** 실시간 알림 (Supabase Realtime)
  - 근거: 신규 주문 즉시 인지, 재고 부족 경고, 배송 지연 알림. PRD 기술스택에 명시
  - 범위: Realtime 구독 + 알림 UI + 알림 설정

- [ ] **[P1]** 에러 모니터링 (Sentry 연동)
  - 근거: 프로덕션 에러 발생 시 인지 불가. 현재 에러는 콘솔 출력만
  - 범위: Sentry SDK 설정 + Error Boundary 연동 + 소스맵 업로드

- [ ] **[P2]** 감사 로그 시스템
  - 근거: 데이터 변경 이력 추적. 컴플라이언스/보안 감사 대응
  - 범위: `audit_logs` 테이블 + DB 트리거 + 로그 조회 UI

- [ ] **[P2]** 시스템 헬스 대시보드
  - 근거: DB 커넥션 풀, API 응답 시간, Edge Function 상태 모니터링
  - 범위: Supabase 메트릭 API 연동 + 관리자 전용 페이지

- [ ] **[P3]** 배치 작업 자동화
  - 근거: 재고 동기화, 정산 자동화, 리포트 생성 스케줄링
  - 범위: Supabase Edge Functions + pg_cron

### 2.9 사용자 경험 (UX)

- [ ] **[P2]** 접근성 WCAG AA 준수
  - 근거: PRD 비기능 요구사항 명시. 현재 aria-label 일부만 적용, 키보드 탐색·색상 대비 미검증
  - 범위: 시맨틱 HTML, aria-* 속성, 키보드 네비게이션, 색상 대비 4.5:1

- [ ] **[P2]** 반응형 레이아웃 (모바일/태블릿)
  - 근거: `AppLayout`이 `h-screen` 고정. 모바일 사이드바 토글 없음
  - 범위: 반응형 사이드바 + 모바일 네비게이션 + 테이블 가로 스크롤

- [ ] **[P3]** 국제화 (i18n)
  - 근거: 해외 셀러 지원 시 필요. 현재 한국어 하드코딩이 전체 컴포넌트에 분산
  - 범위: i18n 라이브러리 도입 + 번역 키 추출 + 언어 전환 UI

- [ ] **[P3]** 다크 모드
  - 근거: 사용자 선호 테마. 장시간 사용하는 어드민 도구에서 눈 피로도 감소
  - 범위: Tailwind dark variant + Zustand 테마 스토어 + 시스템 설정 감지

### 2.10 테스트 및 품질 보증

- [ ] **[P1]** 단위 테스트 작성 (서비스·훅·유틸리티)
  - 근거: CLAUDE.md TDD 원칙. 현재 테스트 파일 0개
  - 범위: 서비스 함수, 커스텀 훅, 유틸 함수 테스트. Vitest + Testing Library

- [ ] **[P1]** 컴포넌트 테스트 (주요 페이지·UI 컴포넌트)
  - 근거: 페이지 컴포넌트 렌더링, 필터 동작, 테이블 가상화 검증
  - 범위: OrdersPage, ProductsPage, DashboardPage + UI 컴포넌트

- [ ] **[P2]** E2E 테스트 (Playwright)
  - 근거: `@playwright/test` 설치됨, `tests/e2e/` 존재하지만 실제 테스트 미작성
  - 범위: 로그인 → 대시보드 → 주문 필터링 → 상품 관리 주요 플로우

- [ ] **[P2]** CI 테스트 커버리지 리포트
  - 근거: `test:coverage` 스크립트 존재하지만 CI에 미연동. 커버리지 하락 방지
  - 범위: Vitest coverage → CI 아티팩트 → PR 코멘트 자동 게시

---

## 3. 구현 로드맵

### Phase 1: 보안 기반 (필수 선행)

> 이 단계 없이는 프로덕션 배포 불가능. 모든 후속 작업의 전제 조건.

| 항목 | 우선순위 | 카테고리 |
|------|---------|---------|
| Supabase Auth 연동 | P0 | 2.1 인증 |
| 보호 라우트 구현 | P0 | 2.1 인증 |
| `sellers` 테이블 + `seller_id` FK | P0 | 2.2 멀티테넌트 |
| RLS 정책 교체 (seller 기반) | P0 | 2.2 멀티테넌트 |
| Error Boundary 구현 | P0 | 2.4 프론트엔드 |
| RPC 함수 seller_id 필터 | P1 | 2.2 멀티테넌트 |

### Phase 2: 데이터 모델 정비

> Phase 1과 일부 병행 가능. 마이그레이션 순서에 주의.

| 항목 | 우선순위 | 카테고리 |
|------|---------|---------|
| `product_id` FK 전환 | P1 | 2.3 데이터 모델 |
| 가격 필드 NUMERIC 변경 | P1 | 2.3 데이터 모델 |
| 감사 필드 추가 | P1 | 2.3 데이터 모델 |
| 소프트 딜리트 적용 | P2 | 2.3 데이터 모델 |

### Phase 3: 프론트엔드 안정성

> Phase 1 완료 후 진행. Auth 기반 UI 로직이 전제.

| 항목 | 우선순위 | 카테고리 |
|------|---------|---------|
| 코드 스플리팅 (React.lazy) | P1 | 2.4 프론트엔드 |
| Zustand 스토어 구축 | P1 | 2.4 프론트엔드 |
| 토스트/알림 시스템 | P2 | 2.4 프론트엔드 |
| 단위 테스트 작성 | P1 | 2.10 테스트 |
| 컴포넌트 테스트 작성 | P1 | 2.10 테스트 |

### Phase 4: 기능 고도화

> 비즈니스 핵심 기능 확장. Phase 1~3 완료 후 진행.

| 항목 | 우선순위 | 카테고리 |
|------|---------|---------|
| 주문 상세 페이지 | P1 | 2.5 주문 |
| 주문 상태 변경 (CUD) | P1 | 2.5 주문 |
| 상품 CRUD | P1 | 2.6 상품 |
| 실시간 알림 (Realtime) | P1 | 2.8 운영 |
| Sentry 에러 모니터링 | P1 | 2.8 운영 |
| RBAC (역할 기반 접근 제어) | P1 | 2.1 인증 |
| 데이터 내보내기 (CSV) | P2 | 2.5 주문 |

### Phase 5: 운영 성숙도

> 프로덕션 운영 안정화. 사용자 경험 완성.

| 항목 | 우선순위 | 카테고리 |
|------|---------|---------|
| 상품 옵션/이미지 관리 | P2 | 2.6 상품 |
| 배송 추적 연동 | P2 | 2.5 주문 |
| 접근성 WCAG AA | P2 | 2.9 UX |
| 반응형 레이아웃 | P2 | 2.9 UX |
| E2E 테스트 완성 | P2 | 2.10 테스트 |
| 감사 로그 시스템 | P2 | 2.8 운영 |
| 커스텀 기간 분석 | P2 | 2.7 분석 |

---

## 부록: 우선순위별 요약

| 우선순위 | 항목 수 | 핵심 키워드 |
|---------|--------|------------|
| **P0** | 5개 | Auth, RLS, 멀티테넌트, Error Boundary |
| **P1** | 15개 | CRUD, 코드스플리팅, Zustand, Realtime, Sentry, RBAC, 테스트 |
| **P2** | 18개 | 옵션관리, 이미지, 접근성, 내보내기, 감사로그, E2E |
| **P3** | 8개 | i18n, 다크모드, 위젯 커스텀, 일괄등록, 배치작업 |
| **합계** | **46개** | |
