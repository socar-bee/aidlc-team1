# Integration Test Instructions

**도구**: Jest + Supertest + Testcontainers(MySQL 8.4) — 실제 DB 기반
**위치**: `apps/backend/test/*.integration-spec.ts`
**전제**: **Docker 데몬 필요** (Testcontainers 가 MySQL 컨테이너 자동 기동)

## 실행

```bash
pnpm --filter @table-order/backend test:integration
```

> **OrbStack/비표준 소켓 사용 시**: Testcontainers 가 Docker 소켓을 못 찾으면 `DOCKER_HOST` 를 명시한다.
> ```bash
> export DOCKER_HOST="unix://$HOME/.orbstack/run/docker.sock"   # orbstack 예시
> export TESTCONTAINERS_RYUK_DISABLED=true
> pnpm --filter @table-order/backend test:integration
> ```
> (`docker context inspect` 로 실제 소켓 경로 확인)

## 작성된 시나리오 (대표 1)

### `auth.integration-spec.ts` — 관리자 로그인 플로우

- **Setup**: MySQL 컨테이너 기동 → throwaway DataSource(`synchronize`)로 스키마 생성 → 매장/관리자 seed
- **Test Steps**:
  1. `POST /auth/admin/login` (TEST/admin/admin1234) → **200 + accessToken**
  2. 잘못된 비밀번호 → **401**
- **Cleanup**: 앱 close + 컨테이너 stop (afterAll)

## 상태 — 실측 ✅

> **구동 확인 완료** (Testcontainers MySQL 8.4 실제 기동): **Test Suites 1 passed, Tests 2 passed** (로그인 200 / 오답 401). 소요 ~12s.

## 후속 (풀 스위트 확장 시)

| 시나리오 | 대상 |
|---|---|
| Order create | `POST /orders` 세션 자동 시작 + 합계 + 스냅샷 (트랜잭션) |
| Order status 전이 + 동시성 | `PATCH /orders/:id/status` 비관적 락 lost-update 차단 |
| Menu/Category CRUD | sortOrder, 409 차단 |
| Table summary 폴링 | `GET /tables/summary` 재계산 |

## Troubleshooting

| 증상 | 해결 |
|---|---|
| `Could not find a working container runtime` | Docker 데몬 기동 확인 |
| 타임아웃 | `jest-integration.json` `testTimeout` 상향 / 이미지 사전 pull (`docker pull mysql:8.4`) |
