# Units Generation — Plan & Questions

## Part 1: Planning Questions

Application Design에서 9개 Backend 모듈 + 2개 FE 앱 + shared-types 구조가 확정되었습니다. Workflow Planning에서 잠정 9 Unit이 식별되었으므로, 본 단계 질문은 **Unit 경계·배포 모델·작업 단위** 4개로 좁힙니다.

답변 완료 후 "완료" 또는 "done" 알려주세요.

---

### Question 1: 배포 모델 (Deployment Model)
Backend의 배포 단위를 어떻게 가져갈까요?

A) **단일 NestJS 모놀리스 + 2 Next.js 앱** — Backend 1개 컨테이너, 9 모듈은 같은 프로세스. PoC/MVP 표준

B) **모놀리스 NestJS + 2 Next.js, 단 Realtime 모듈은 후속 분리 가능하도록 인터페이스만 추상화** — 멀티 인스턴스 확장 대비

C) **소규모 마이크로서비스** — Auth / Order / Realtime을 분리. 인프라 복잡도 ↑

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Unit 분할 그래뉼래러티
Workflow Planning에서 잠정 9 Unit이 식별됐습니다. 이대로 갈까요, 더 통합/세분화할까요?

**잠정안 (9 Units)**:
- U1 Shared Foundation (DB/ORM/공통)
- U2 Auth (Admin + Table)
- U3 Category & Menu (Admin CRUD + Upload)
- U4 Menu Browsing (Customer)
- U5 Cart (Customer FE-only)
- U6 Order + Session (Customer + 자동 세션 시작)
- U7 Order History (Customer + Admin)
- U8 Realtime Dashboard (SSE + 상태 변경)
- U9 Infra & DevX (Docker Compose)

A) **9 Unit 그대로** — 균형, 잠정안 채택

B) **7 Unit으로 통합** — U5 Cart를 U4 Menu Browsing에 흡수, U7 History를 U6에 흡수

C) **5 Unit으로 대폭 통합** — Foundation / Auth / Catalog(Menu+Category+Image) / Order+Session+History / Realtime+Dashboard+Infra

D) **11~12 Unit으로 세분화** — A3 Table Management를 U6에서 분리, FE 앱별로 더 나누기

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: 작업 진행 모델 (Per-Unit 순차 vs 병렬)
Construction Phase에서 Unit을 어떻게 진행할까요?

A) **순차 진행** — U1 → U2 → ... 의존 순서대로 1개씩. Plan-Code-Test 사이클을 Unit마다 완료

B) **병렬 진행 가능 Unit은 함께** — U1 완료 후 U2/U9 병렬, 이후 U3/U4 병렬 등

C) **레이어별 진행** — 전체 도메인 Entity 먼저 → 전체 Service → 전체 Controller → 전체 FE

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4: Unit별 테스트 책임
Unit 정의 시 테스트 책임을 어떻게 가져갈까요?

A) **Unit 내부에 단위 + Unit 경계 통합 테스트 포함** — 각 Unit이 자체 검증 가능, 마지막 단계에서 E2E

B) **Unit은 코드만, 단위/통합/E2E는 마지막 Build & Test 단계에서 일괄** — Unit 작업 속도 ↑, 회귀 늦게 발견

C) **혼합**: 핵심 도메인 Unit(Auth/Order/Session/Realtime)은 단위 테스트 동반, CRUD Unit은 마지막에 일괄

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 답변 완료 후
"완료" 또는 "done" 알려주세요. follow-up 없으면 Part 2 산출물 생성을 진행합니다.

---

## Part 2: Generation Checklist (승인 후 실행)

- [x] `application-design/unit-of-work.md` 생성 — 9 Unit 정의(목적·범위·코드·DoD·의존·Stories·FR) + 코드 조직 전략 + Unit Summary + Boundary Validation
- [x] `application-design/unit-of-work-dependency.md` 생성 — 의존 그래프 + 의존 매트릭스 + 순차 작업 순서 + Gantt + Unit 경계 인터페이스 + Risk 매트릭스
- [x] `application-design/unit-of-work-story-map.md` 생성 — 64 stories ↔ 9 Units 매핑 + FR ↔ Unit + Persona ↔ Unit + Coverage Validation
- [x] 코드 조직 전략 — `unit-of-work.md` 에 통합 (Greenfield Monorepo 구조 + Unit별 담당 디렉토리)
- [x] aidlc-state.md Units Generation 단계 완료 표시
