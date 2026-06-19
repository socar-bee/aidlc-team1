# Application Design — Plan & Questions

## Part 1: Planning Questions

Requirements Analysis에서 이미 큰 결정(Next.js / NestJS / MySQL / Docker / JWT / SSE)이 내려졌으므로, 본 단계에서는 **아키텍처 패턴·코드 조직** 6개만 확인합니다.

답변 완료 후 "완료" 또는 "done" 알려주세요.

---

### Question 1: 모노레포 구조
3개 앱(customer-fe, admin-fe, backend) + 공유 타입은 어떻게 관리할까요?

A) **pnpm workspaces 모노레포** + 공유 패키지(`packages/shared-types`) — TypeScript 타입을 BE/FE 양쪽이 import. Turborepo·Nx 없음, 단순

B) **Turborepo + pnpm workspaces** — 캐시·병렬 빌드 이점, 학습 비용 살짝

C) **각 앱 독립 폴더, 공유 타입은 BE OpenAPI generator로 자동 생성** — 모노레포 X, 계약은 OpenAPI

D) **각 앱 독립 폴더, 공유 타입 수동 복제** — 가장 단순, 동기화 부담

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Backend 모듈 조직 스타일
NestJS 모듈을 어떻게 조직할까요?

A) **Feature(도메인) 모듈 기반**: `auth/`, `store/`, `table/`, `menu/`, `category/`, `order/`, `session/`, `realtime/` — 각 모듈에 controller/service/entity/dto 동거. Nest 표준, 도메인 응집

B) **Layer 기반**: `controllers/`, `services/`, `repositories/`, `entities/` — 전형적 N-tier, 도메인 분산

C) **DDD-light**: domain/application/infrastructure 3 레이어 + Feature 도메인 — 무거움, MVP에는 과할 수 있음

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3: ORM / DB 액세스 라이브러리
MySQL과 통신할 ORM 선택은?

A) **Prisma** — schema-first, 마이그레이션 우수, 타입 자동 생성. 사내 표준 아닐 수 있음

B) **TypeORM** — Decorator 기반, NestJS 통합 매끄러움, Active Record 또는 Data Mapper. 모두의주차장에서 사용 빈번

C) **MikroORM** — Unit of Work, 정교한 타입

D) **Knex.js + 수동 모델** — 마이크로 ORM, 가장 가벼움

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 4: Frontend 아키텍처 패턴 (Next.js App Router)
Customer/Admin FE의 상태 관리·데이터 패칭 패턴은?

A) **React Server Components(RSC) + Server Actions + 최소 client state(Zustand)** — App Router 네이티브, 캐시·revalidate 활용

B) **Client-side rendering 중심 + React Query(TanStack Query) + Zustand** — App Router지만 client component 위주, RQ로 서버 상태 관리. SSE/실시간과 궁합 좋음

C) **혼합**: 정적·SEO 페이지는 RSC, 인터랙티브·실시간은 RQ + Zustand

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 5: SSE 이벤트 발행/구독 토폴로지
실시간 주문 이벤트를 어떻게 전달할까요?

A) **In-process EventEmitter** (NestJS `EventEmitterModule`) — 단일 NestJS 인스턴스 가정, 단순. PoC/MVP 적합. 멀티 인스턴스 확장 시 한계

B) **Redis Pub/Sub** — Backend 인스턴스 N개 확장 대비, Docker Compose에 Redis 추가

C) **MySQL polling** — 별도 인프라 없이 매장 단위 변경분을 주기 쿼리. 단순하지만 부하·지연

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 6: API 계약 / 코드 생성
FE-BE API 계약 관리는?

A) **OpenAPI(Swagger) 자동 생성 + 수동 타입 공유** — NestJS `@nestjs/swagger` decorator, FE는 모노레포 공유 패키지에서 타입 import

B) **OpenAPI 자동 생성 + FE 타입 자동 생성**(`openapi-typescript`) — 더 안전, 빌드 파이프라인 1단계 추가

C) **계약 문서 없음, 수동 동기화** — MVP 단순화

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 답변 완료 후
모든 `[Answer]:` 태그를 채우고 "완료" 또는 "done"이라고 알려주세요. 답변 분석 후 follow-up 없으면 Part 2 산출물 생성을 진행합니다.

---

## Part 2: Generation Checklist (승인 후 실행)

- [x] `application-design/components.md` 생성 — Customer FE / Admin FE / Backend 9 모듈 + shared-types + DB
- [x] `application-design/component-methods.md` 생성 — BE 8 Service 시그니처 + FE RQ hooks + Zustand stores + shared-types DTO/enum
- [x] `application-design/services.md` 생성 — 책임 매트릭스 + 7 시퀀스 다이어그램 + 트랜잭션 규칙 + SSE 카탈로그
- [x] `application-design/component-dependency.md` 생성 — 모듈 의존 그래프 + 의존 매트릭스 + 통신 패턴 + 4 데이터 흐름 + Monorepo 의존 + 영향 매트릭스
- [x] `application-design/application-design.md` 생성 — 통합 문서 + Architectural Decisions + Validation Checklist
- [x] aidlc-state.md Application Design 단계 완료 표시
