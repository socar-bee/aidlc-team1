# U9 Infra & DevX — Code Generation Plan

> **단일 소스 오브 트루스**: 본 계획이 U9 Code Generation의 유일한 기준. 단계 순서대로 실행하며 완료 시 즉시 `[x]` 마킹.

## Unit Context

| 항목 | 내용 |
|---|---|
| **Unit** | U9 Infra & DevX |
| **목적** | 로컬 실행 환경(Docker Compose 프로덕션 스택) + 개발자 경험 + 실행/테스트 문서 |
| **의존** | U1 (병렬 가능, 의존 순서상 U1 직후 / 번호상 마지막) |
| **Stories** | 없음 (인프라 단위) |
| **FR/NFR** | NFR-PERF-04~05, NFR-OBS-*(간접), shared-infrastructure.md §12 산출물 |
| **설계 근거** | `aidlc-docs/construction/shared/shared-infrastructure.md` (one-shot Infra Design) |

## 선행 스테이지 판정 (Per-Unit Loop)

| 스테이지 | 판정 | 사유 |
|---|---|---|
| Functional Design | **SKIP (N/A)** | 새 데이터 모델/비즈니스 로직 없음 |
| NFR Requirements | **SKIP (N/A)** | shared-infra에서 NFR 기수렴, 신규 없음 |
| NFR Design | **SKIP (N/A)** | NFR Requirements 미수행 |
| Infrastructure Design | **DONE (one-shot)** | `shared-infrastructure.md`로 완료 |
| **Code Generation** | **EXECUTE** | 본 계획 |

## 갭 분석 (이미 존재 vs U9 산출 대상)

| 산출물 | 상태 | 조치 |
|---|---|---|
| `pnpm-workspace.yaml` | ✅ 존재 | 변경 없음 |
| 루트 `package.json` (scripts) | ✅ 존재 | 변경 없음 (필요 시 스크립트 보강) |
| `tsconfig.base.json` | ✅ 존재 | 변경 없음 |
| `.gitignore` / `.nvmrc` / `.editorconfig` | ✅ 존재 | 변경 없음 |
| `docker-compose.dev.yml` (MySQL only) | ✅ 존재 | 유지 (dev용) |
| per-app `.env.example` | ⚠️ SSE 잔존 | 정합화 (SSE 변수 제거) |
| `apps/backend/src/scripts/seed.ts` | ✅ 존재 | 변경 없음 |
| backend `/health` + `output:standalone` | ✅ 존재 | 활용 |
| **프로덕션 `docker-compose.yml`** | ❌ 없음 | **신규** |
| **`apps/backend/Dockerfile`** | ❌ 없음 | **신규** |
| **`apps/customer-fe/Dockerfile`** | ❌ 없음 | **신규** |
| **`apps/admin-fe/Dockerfile`** | ❌ 없음 | **신규** |
| **`.dockerignore`** (루트 + 각 앱) | ❌ 없음 | **신규** |
| **루트 `.env.example`** (통합) | ❌ 없음 | **신규** |
| **`playwright.config.ts`** | ❌ 없음 | **신규** (Build & Test E2E 준비) |
| **`README.md`** | ⚠️ 비어있음 | **작성** |
| `scripts/backup.sh` / `restore.sh` | ❌ 없음 | **신규** (단순) |

### 정합성 이슈 (U8 폴링 전환 반영)
- shared-infra §3 / per-app `.env.example`의 `NEXT_PUBLIC_SSE_URL`, `/sse/stream`은 **U8에서 폐기됨(폴링 전환)**.
- → U9 산출물(compose / .env.example)에서 **SSE 환경변수 제외**, 폴링 기준으로 정합화.

---

## Generation Steps

- [x] **Step 1: 루트 `.env.example` (통합)**
  - MySQL(`MYSQL_ROOT_PASSWORD`/`MYSQL_DATABASE`/`MYSQL_USER`/`MYSQL_PASSWORD`) + `JWT_SECRET` + `TZ`
  - `NEXT_PUBLIC_API_URL` (FE 빌드타임 주입용 주석). **SSE 변수 제외**
  - 위치: 워크스페이스 루트 `.env.example`

- [x] **Step 2: `apps/backend/Dockerfile`**
  - Node 20 + pnpm corepack, monorepo 컨텍스트(루트) 빌드
  - multi-stage: deps(install) → build(`pnpm --filter backend build` + shared-types) → runner(dist + prod deps)
  - `EXPOSE 4000`, `CMD node dist/main`, 이미지 볼륨 마운트 대상 `/var/lib/uploads`

- [x] **Step 3: `apps/customer-fe/Dockerfile`**
  - Next.js standalone(`output:'standalone'`) multi-stage, `NEXT_PUBLIC_API_URL` build-arg
  - `EXPOSE 3000`, standalone server 실행

- [x] **Step 4: `apps/admin-fe/Dockerfile`**
  - Step 3와 동일 패턴, 포트 3001

- [x] **Step 5: `.dockerignore`** (루트 + 각 앱)
  - `node_modules`, `.next`, `dist`, `.env`, `coverage`, `playwright-report` 등 제외

- [x] **Step 6: 프로덕션 `docker-compose.yml`**
  - shared-infra §3 기반: `mysql`/`backend`/`customer-fe`/`admin-fe` 4서비스
  - 네트워크 `table-order-net`, named volume `mysql-data`/`image-uploads`
  - healthcheck 기반 시작순서(mysql healthy → backend healthy → FE), 포트 3000/3001/4000/3306
  - **SSE 환경변수 제외** (폴링)

- [x] **Step 7: per-app `.env.example` 정합화**
  - customer-fe / admin-fe `.env.example`에서 `NEXT_PUBLIC_SSE_URL` 제거
  - backend `.env.example` 현행 유지 검토

- [x] **Step 8: `playwright.config.ts`** (루트)
  - baseURL(customer 3000 / admin 3001), 4 프로젝트(chromium/webkit/Mobile Chrome/Mobile Safari)
  - `testDir: e2e/`, report 설정 — **테스트 코드 작성은 Build & Test 단계** (여기선 설정만)
  - 루트 `package.json`에 `test:e2e` 스크립트 + `@playwright/test` devDependency 추가

- [x] **Step 9: `scripts/backup.sh` / `scripts/restore.sh`**
  - shared-infra §4 가이드의 volume tar 백업/복원 (mysql-data / image-uploads)

- [x] **Step 10: `README.md`**
  - 프로젝트 개요 / 사전요구(Node 20, pnpm, Docker) / 로컬 실행(`docker-compose up`) / seed / 접속 포트표 / 테스트 가이드(unit/integration/e2e) / 환경변수 / 백업
  - data-testid 등 자동화 친화 규칙 언급

- [x] **Step 11: 코드 요약 문서**
  - `aidlc-docs/construction/u9-infra/code/code-summary.md` 작성 (산출물 목록 + 검증)

- [x] **Step 12: 검증 (DoD)**
  - `pnpm install` → `pnpm type-check` / `pnpm lint` 통과 확인
  - `docker compose config` 문법 검증 (compose 유효성)
  - DoD: clone → install → `docker-compose up` → 3서비스 접근 가능 / seed 후 Admin 로그인 + Customer 메뉴 조회 가능

---

## DoD (Unit-of-Work 기준)

| 기준 | 검증 방법 |
|---|---|
| 0 상태에서 clone → install → `docker-compose up` → 3서비스 접근 | `docker compose config` + 수동 기동 가이드 |
| seed 후 Admin 로그인 + Customer 메뉴 조회 | seed 스크립트 + README 절차 |
| lint / type-check 통과 | `pnpm lint` / `pnpm type-check` |

> **테스트 코드 자체는 본 Unit이 아니라 다음 Build & Test 단계에서 작성·실행** (Q4=B). U9는 **E2E 실행 환경(playwright.config.ts)** 까지만 준비.
