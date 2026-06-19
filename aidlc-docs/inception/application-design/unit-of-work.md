# Unit of Work — 정의 및 책임

본 문서는 Construction Phase에서 작업할 **9개 Unit**을 정의합니다.

## 기본 결정 사항 (Plan 답변)

| Q | 결정 | 의미 |
|---|---|---|
| Q1=A | **단일 NestJS 모놀리스 + 2 Next.js 앱** | Backend 1개 컨테이너, 9 모듈은 같은 프로세스 |
| Q2=A | **9 Unit 그대로** | Workflow Planning 잠정안 채택 |
| Q3=A | **순차 진행** | U1 → U2 → ... 의존 순서대로 Plan-Code-Test 사이클 |
| Q4=B | **Unit은 코드만, 테스트는 마지막 일괄** | 단위/통합/E2E는 Build & Test 단계에서 종합 |

**Terminology**: Backend는 **단일 Service(모놀리스)**, 9 Unit은 그 안의 **논리적 Module/작업 단위**. FE는 **앱 단위 Service** 2개(customer-fe, admin-fe).

---

## 코드 조직 전략 (Greenfield Monorepo)

```
table-order/
├── apps/
│   ├── customer-fe/             # Next.js 14 — Service "Customer App"
│   ├── admin-fe/                # Next.js 14 — Service "Admin App"
│   └── backend/                 # NestJS — Service "Backend Monolith"
│       └── src/
│           ├── auth/            # ← Unit U2
│           ├── store/           # ← Unit U1 (도메인 일부)
│           ├── category/        # ← Unit U3
│           ├── menu/            # ← Unit U3
│           ├── image/           # ← Unit U3
│           ├── order/           # ← Unit U6 (+ U7 일부)
│           ├── session/         # ← Unit U6 (+ U7 일부)
│           ├── realtime/        # ← Unit U8
│           ├── common/          # ← Unit U1
│           ├── config/          # ← Unit U1
│           └── migrations/      # ← Unit U1
├── packages/
│   └── shared-types/            # ← Unit U1
├── docker-compose.yml           # ← Unit U9
├── pnpm-workspace.yaml          # ← Unit U9
└── README.md                    # ← Unit U9
```

각 Unit이 어떤 디렉토리를 담당하는지는 아래 Unit 정의에 명시.

---

## Unit Definitions

### U1: Shared Foundation

| 항목 | 내용 |
|---|---|
| **목적** | 모든 다른 Unit이 의존하는 공통 인프라·계약 구축 |
| **범위** | DB 연결·ORM 설정·도메인 엔티티 골격·shared-types 패키지·NestJS 공통 모듈(필터/인터셉터/파이프/데코레이터)·환경 설정·DB 마이그레이션 |
| **포함 코드** | `packages/shared-types/`<br/>`apps/backend/src/common/`<br/>`apps/backend/src/config/`<br/>`apps/backend/src/store/`<br/>`apps/backend/src/migrations/`<br/>모든 엔티티 클래스(`*.entity.ts`)의 골격 (스키마 정의는 포함, 비즈니스 메서드는 후속 Unit에서) |
| **주요 산출물** | • TypeORM DataSource 설정<br/>• 8개 엔티티 (Store/AdminUser/Table/Category/Menu/TableSession/Order/OrderItem)<br/>• 초기 마이그레이션 SQL<br/>• shared-types 모든 enum/interface<br/>• 글로벌 ExceptionFilter + ValidationPipe + LoggingInterceptor<br/>• `@CurrentAdmin()`, `@CurrentTable()` 데코레이터 (껍데기)<br/>• env validation (zod 또는 class-validator) |
| **DoD (Done of Definition)** | • `pnpm install` 성공<br/>• Backend 부팅 시 DB 연결 + 마이그레이션 적용 성공<br/>• shared-types 빌드 성공, 다른 앱에서 import 가능<br/>• 빈 `app.module.ts` 부팅 가능 |
| **의존** | (없음) |
| **포함 Stories** | (없음 — 시스템 골격) |
| **포함 FR** | (없음 — 토대) |

---

### U2: Auth (Admin + Table)

| 항목 | 내용 |
|---|---|
| **목적** | 두 페르소나의 인증 흐름 + Guard 제공 |
| **범위** | Admin 로그인(JWT 16h) / Table 초기 설정(테이블 토큰 발급) / 두 Guard / bcrypt 해싱 / Login 시도 로깅 |
| **포함 코드** | `apps/backend/src/auth/`<br/>`apps/admin-fe/src/app/login/`<br/>`apps/admin-fe/src/stores/auth-store.ts`<br/>`apps/customer-fe/src/app/setup/`<br/>`apps/customer-fe/src/lib/auth.ts` |
| **주요 산출물** | • AuthService (adminLogin / setupTable / validateAdminToken / validateTableToken / log)<br/>• JwtAdminGuard, TableTokenGuard<br/>• `POST /auth/admin/login`, `POST /auth/table/setup`<br/>• Admin FE 로그인 페이지 + Zustand auth-store<br/>• Customer FE 자동 로그인 + setup 화면 + localStorage helper |
| **DoD** | • Admin 로그인 성공 시 JWT 발급 + 새로고침 시 유지<br/>• Table setup 후 토큰 저장 + 자동 로그인 흐름 동작<br/>• 두 Guard로 보호된 dummy 엔드포인트가 401/200 응답 |
| **의존** | U1 |
| **포함 Stories** | US-C-01~05, US-A-01~06 (11개) |
| **포함 FR** | FR-CUS-01, FR-ADM-01 |

---

### U3: Category & Menu (Admin)

| 항목 | 내용 |
|---|---|
| **목적** | 관리자 메뉴/카테고리 마스터 관리 + 이미지 업로드 |
| **범위** | Category/Menu CRUD + sortOrder + 카테고리 삭제 차단 + 이미지 업로드(로컬 디스크) |
| **포함 코드** | `apps/backend/src/category/`<br/>`apps/backend/src/menu/`<br/>`apps/backend/src/image/`<br/>`apps/admin-fe/src/app/(dashboard)/categories/`<br/>`apps/admin-fe/src/app/(dashboard)/menus/`<br/>`apps/admin-fe/src/components/category/`, `components/menu/` |
| **주요 산출물** | • CategoryService/Controller + Menu Service/Controller + ImageService/Controller<br/>• REST: `/categories`, `/menus`, `/menus/by-category/:id`, `/images/upload`<br/>• Multer 설정 + Docker volume 정적 서빙<br/>• Admin FE 카테고리/메뉴 CRUD 화면 + 이미지 업로드 컴포넌트 |
| **DoD** | • Admin이 카테고리/메뉴를 등록·수정·삭제·순서 변경 가능<br/>• 이미지 업로드 후 메뉴에 URL 첨부 가능<br/>• 메뉴 연결된 카테고리 삭제 차단(409) |
| **의존** | U1, U2 |
| **포함 Stories** | US-A-23~34 (12개) |
| **포함 FR** | FR-ADM-04, FR-ADM-05, FR-ADM-06 |

---

### U4: Menu Browsing (Customer)

| 항목 | 내용 |
|---|---|
| **목적** | 고객의 카테고리·메뉴 조회 |
| **범위** | 카테고리 탭 / 카테고리별 메뉴 카드 / 메뉴 상세 |
| **포함 코드** | `apps/customer-fe/src/app/page.tsx` (메뉴 화면)<br/>`apps/customer-fe/src/components/menu/`<br/>`apps/customer-fe/src/lib/queries/menu.ts`<br/>`apps/customer-fe/src/lib/queries/category.ts`<br/>Backend의 `/menus` `/categories` GET 핸들러(읽기 권한)는 U3에서 제공 |
| **주요 산출물** | • CategoryTabs, MenuCard, MenuDetail 컴포넌트<br/>• useCategories / useMenusByCategory hooks<br/>• 메뉴 화면 (기본 랜딩) |
| **DoD** | • 자동 로그인 후 메뉴 화면 진입<br/>• 카테고리 탭으로 메뉴 필터링<br/>• 카드 터치 시 상세(모달 또는 페이지)<br/>• 가격 KRW + 천단위 콤마 표시 |
| **의존** | U1, U2, U3 |
| **포함 Stories** | US-C-06~10 (5개) |
| **포함 FR** | FR-CUS-02 |

---

### U5: Cart (Customer FE-only)

| 항목 | 내용 |
|---|---|
| **목적** | 장바구니 클라이언트 상태 관리 (서버 통신 없음 — 주문 확정 시점에만 서버로) |
| **범위** | 메뉴 추가/삭제/수량 증감/총액 계산/비우기/localStorage 영속화 |
| **포함 코드** | `apps/customer-fe/src/stores/cart-store.ts` (Zustand + persist)<br/>`apps/customer-fe/src/components/cart/` (CartItem, CartSummary, AddToCartButton, FloatingCartButton)<br/>`apps/customer-fe/src/app/cart/page.tsx` |
| **주요 산출물** | • Zustand cart-store + persist middleware (key `cart`)<br/>• AddToCartButton (메뉴 카드/상세에서 사용)<br/>• 장바구니 화면 (수량 조절 + 비우기 + 결제 버튼)<br/>• 총액 실시간 계산 selector |
| **DoD** | • 메뉴 추가/삭제/수량 증감 동작<br/>• 총액 실시간 갱신<br/>• 페이지 새로고침 시 장바구니 유지<br/>• "비우기" 버튼 + 확인 |
| **의존** | U4 |
| **포함 Stories** | US-C-11~16 (6개) |
| **포함 FR** | FR-CUS-03 |

---

### U6: Order + Session (Customer + 자동 세션 시작)

| 항목 | 내용 |
|---|---|
| **목적** | 주문 생성 골든 플로우 + 테이블 세션 자동 라이프사이클 |
| **범위** | Customer 주문 확정/성공·실패 처리/5초 리다이렉트 + Backend 주문 생성·세션 자동 시작·트랜잭션 |
| **포함 코드** | `apps/backend/src/order/` (controller / service / repository / entity / dto)<br/>`apps/backend/src/session/` (service / repository / entity)<br/>`apps/customer-fe/src/app/checkout/`<br/>`apps/customer-fe/src/components/order/`<br/>`apps/customer-fe/src/lib/queries/order.ts` (create 부분) |
| **주요 산출물** | • OrderService.create (트랜잭션 + 세션 보장 + OrderItem 스냅샷)<br/>• SessionService.ensureActiveSession / findActive<br/>• `POST /orders`<br/>• Customer 주문 확인·확정 화면 + 성공 화면 + 5초 리다이렉트<br/>• useCreateOrder hook + 에러 시 장바구니 유지 |
| **DoD** | • 장바구니 → 주문 확정 → 주문번호 반환 → 5초 후 메뉴 화면<br/>• 첫 주문 시 새 세션 자동 생성<br/>• 실패 시 에러 + 장바구니 유지<br/>• OrderItem이 메뉴 스냅샷(이름·단가) 포함 |
| **의존** | U1, U2, U3, U4, U5 |
| **포함 Stories** | US-C-17~21, US-S-01, US-S-03 (7개) |
| **포함 FR** | FR-CUS-04, FR-SYS-01 |

---

### U7: Order History (Customer + Admin)

| 항목 | 내용 |
|---|---|
| **목적** | 현재 세션 주문 내역 조회 (Customer) + 과거 세션 이력 조회 + 세션 종료 (Admin) |
| **범위** | 현재/과거 조회 분리 + 세션 종료 트리거 + 과거 이력 페이지 (날짜 필터 포함) |
| **포함 코드** | `apps/backend/src/order/` (조회/이력 메서드 추가)<br/>`apps/backend/src/session/` (end / listEnded 메서드 추가)<br/>`apps/customer-fe/src/app/history/`<br/>`apps/admin-fe/src/app/(dashboard)/tables/[id]/history/`<br/>`apps/admin-fe/src/components/table/EndSessionButton` |
| **주요 산출물** | • OrderService.listCurrentBySession / listHistoryByTable<br/>• SessionService.end (트랜잭션 + 종료 시각 기록)<br/>• `GET /orders/current`, `GET /tables/:id/history`, `POST /tables/:id/end-session`<br/>• Customer 주문 내역 화면 (현재 세션 시간 역순, CANCELED 제외, 이전 세션 제외)<br/>• Admin 과거 내역 화면 + 날짜 필터<br/>• Admin "이용 완료" 버튼 + 확인 팝업 |
| **DoD** | • Customer 내역에 현재 세션 주문만 표시<br/>• Admin "이용 완료" 시 세션 endedAt 기록 + 현재 주문 목록 빈 결과<br/>• Admin 과거 내역 페이지네이션·날짜 필터 동작 |
| **의존** | U6 |
| **포함 Stories** | US-C-22~24, US-A-18~22, US-S-02 (8개)<br/>(US-C-25는 U8에서 다룸. US-S-04~05는 SSE 폐기로 무효) |
| **포함 FR** | FR-CUS-05, FR-ADM-03 (3.3, 3.4), FR-SYS-02 |

---

### U8: Polling Dashboard (폴링 + 상태 변경)

> **설계 변경 (U8 GATE)**: SSE 푸시 → **2초 폴링** 다운그레이드. RealtimeService/SseController/sse-client 제거, React Query `refetchInterval`로 대체. Admin 동시 편집은 **비관적 락**으로 보강.

| 항목 | 내용 |
|---|---|
| **목적** | 폴링 기반 그리드 대시보드 + 주문 상태 변경(동시성 안전) + soft-delete |
| **범위** | TableService(대시보드 집계) + 폴링 조회 엔드포인트 + Admin 대시보드 그리드 + 주문 상세 + 상태 변경(비관적 락) + 주문 삭제 + 테이블 등록 + 폴링 diff 강조 UI |
| **포함 코드** | `apps/backend/src/table/` (controller / service)<br/>`apps/backend/src/order/` (changeStatus / cancel — 비관적 락)<br/>`apps/admin-fe/src/app/(dashboard)/page.tsx` (대시보드 메인, 폴링)<br/>`apps/admin-fe/src/app/(dashboard)/tables/page.tsx` (등록 화면)<br/>`apps/admin-fe/src/components/dashboard/` (TableCard, StatusBadge, OrderDetailModal)<br/>`apps/admin-fe/src/lib/queries/dashboard.ts` (refetchInterval 2초)<br/>`apps/customer-fe/src/app/history/page.tsx` (폴링) |
| **주요 산출물** | • TableService.buildSummaries / listTables<br/>• `GET /tables/summary`, `GET /tables/:id/current-orders` (폴링 대상)<br/>• OrderService.changeStatus / cancel — `SELECT FOR UPDATE` + 정방향 전이 재검증 (동시 편집 lost-update 차단)<br/>• `PATCH /orders/:id/status`, `DELETE /orders/:id`<br/>• 테이블 등록 = 기존 `POST /auth/table/setup` 재사용<br/>• Admin 그리드 대시보드 + TableCard + 폴링 diff 신규 주문 강조 + 필터<br/>• 주문 상세 모달 + 상태 진행/삭제 버튼<br/>• React Query `refetchInterval: 2000` (admin dashboard/current-orders, customer history) |
| **DoD** | • Customer 주문 생성 → Admin 대시보드 ≤2초 표시 (폴링 주기)<br/>• 상태 변경 시 Customer + 다른 Admin 다음 폴링에 동기화<br/>• 주문 삭제 시 CANCELED + 총액 재계산<br/>• 동시 상태 변경 시 비관적 락으로 직렬화 + 무효 전이 400<br/>• 테이블 등록 + 신규 강조 UI 동작 |
| **의존** | U6, U7 |
| **포함 Stories** | US-A-07~17, US-C-25 (12개). ~~US-S-04(SSE publish)·US-S-05(SSE 재연결)~~ → **폐기** (SSE 제거로 무효, 폴링으로 대체) |
| **포함 FR** | FR-ADM-02, FR-ADM-03 (3.1, 3.2), FR-SYS-03(폴링으로 재정의) (+ FR-CUS-05 일부) |

---

### U9: Infra & DevX

| 항목 | 내용 |
|---|---|
| **목적** | 로컬 실행 환경 + 개발자 경험 + 문서 |
| **범위** | Docker Compose + 환경변수 + DB 초기 seed + README + npm scripts + lint/format 설정 + Playwright 설정 |
| **포함 코드** | `docker-compose.yml`, `Dockerfile`(각 앱)<br/>`pnpm-workspace.yaml`, 루트 `package.json`<br/>`.env.example`<br/>`scripts/seed.ts` (Store/Admin/Category 초기 데이터)<br/>`tsconfig.base.json`, `.eslintrc`, `.prettierrc`<br/>`playwright.config.ts`<br/>`README.md` + 실행 가이드 |
| **주요 산출물** | • Docker Compose: 4 서비스(customer-fe, admin-fe, backend, mysql) + 2 볼륨(mysql-data, image-uploads)<br/>• 호스트 포트: 3000(customer), 3001(admin), 4000(backend), 3306(mysql, 선택)<br/>• 매장 + 관리자 + 테이블 N개 + 카테고리 + 메뉴 seed 스크립트<br/>• `docker-compose up` 한 줄로 전체 기동<br/>• README의 실행/테스트 가이드 |
| **DoD** | • 0 상태 머신에서 clone → `pnpm install` → `docker-compose up` → 3 서비스 접근 가능<br/>• seed 후 Admin 로그인 + Customer 메뉴 조회 가능<br/>• lint/type-check 통과 |
| **의존** | U1 (병렬 가능하나 의존 순서상 U1 직후) |
| **포함 Stories** | (없음 — 인프라) |
| **포함 FR** | NFR-PERF-04~05, NFR-OBS-* (간접) |

---

## Unit Summary

| Unit | Stories 수 | 핵심 기술 | 추정 (PoC) |
|---|---|---|---|
| U1 Foundation | 0 | TypeORM, DB, shared-types, common | 1 dev-day |
| U2 Auth | 11 | JWT, bcrypt, Guards | 1 dev-day |
| U3 Cat/Menu/Image | 12 | CRUD, sortOrder, multer | 1.5 dev-day |
| U4 Menu Browse | 5 | Next.js Client, RQ | 0.5 dev-day |
| U5 Cart | 6 | Zustand persist | 0.5 dev-day |
| U6 Order + Session | 7 | Transaction, 세션 자동 | 1.5 dev-day |
| U7 Order History | 8 | 현재/과거 분리, 세션 종료 | 1 dev-day |
| U8 Polling Dashboard | 12 | 폴링(refetchInterval), 비관적 락, 상태 전이 | 2 dev-day |
| U9 Infra & DevX | 0 | Docker Compose, seed, README | 0.5 dev-day |
| **합계** | **61** | — | **~9.5 dev-day** |

> (US-S-04·US-S-05는 SSE 폴링 전환으로 폐기 → 64 stories 중 2개 무효, 합계 61)

(US-S-01~05 시스템 행위는 U6/U7/U8에 흡수)

---

## Boundary Validation

| 검증 항목 | 결과 |
|---|---|
| 모든 user story가 정확히 1개 Unit에 할당 | ✅ (US-S-02는 U7. US-S-04·US-S-05는 SSE 폐기로 폐기 처리) |
| 모든 FR이 ≥ 1개 Unit에 할당 | ✅ |
| 순환 의존 없음 | ✅ (U1 → U2 → U3 → U4 → U5 → U6 → U7 → U8, U9는 U1 의존) |
| 각 Unit DoD가 검증 가능 | ✅ (각 항목이 명시적 동작 정의) |
| Backend 단일 서비스 가정과 일치 | ✅ (Q1=A) |
| 작업 진행 모델이 순차와 일치 | ✅ (Q3=A) — 의존 순서 = 작업 순서 |
| 테스트는 마지막 Build & Test 단계로 위임 | ✅ (Q4=B) — Unit DoD에 "수동 spot check" 정도만 포함 |
