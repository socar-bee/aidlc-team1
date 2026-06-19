# 테이블오더 서비스 (Table Order Service)

테이블 태블릿에서 고객이 메뉴를 주문하고, 매장 운영자가 실시간(2초 폴링) 대시보드에서 주문을 모니터링·관리하는 **단일 매장 MVP**.

## 구성

| 앱 | 스택 | 포트 |
|---|---|---|
| `apps/customer-fe` | Next.js 14 (TS) | 3000 |
| `apps/admin-fe` | Next.js 14 (TS) | 3001 |
| `apps/backend` | NestJS (TS) + TypeORM | 4000 |
| `mysql` | MySQL 8.4 | 3306 |
| `packages/shared-types` | 공용 타입/DTO/Enum | — |

## 사전 요구사항

- Node.js 20 (`.nvmrc`)
- pnpm 9+
- Docker / Docker Compose

---

## 1) 전체 스택 실행 (Docker Compose)

```bash
cp .env.example .env          # 값 채우기 (JWT_SECRET 등)
docker compose up -d --build  # 또는: pnpm stack:up
```

기동 순서: `mysql(healthy)` → `backend(healthy)` → `customer-fe` + `admin-fe`.

최초 1회 마이그레이션 + seed:

```bash
docker compose exec backend sh -c "pnpm migration:run && pnpm seed"
```

접속:

| URL | 화면 |
|---|---|
| http://localhost:3000 | 고객 주문 |
| http://localhost:3001 | 관리자 대시보드 |
| http://localhost:4000/health | 백엔드 헬스체크 |

**seed 기본 계정** (`apps/backend/src/scripts/seed.ts`): 매장코드 `TEST` / 관리자 `admin` / `admin1234`.

종료 / 데이터 삭제:

```bash
docker compose down      # 종료 (pnpm stack:down)
docker compose down -v   # 볼륨 포함 삭제 (pnpm stack:reset)
```

---

## 2) 로컬 개발 (DB만 컨테이너)

```bash
pnpm install
pnpm db:up                # MySQL 컨테이너만 (docker-compose.dev.yml)
pnpm --filter @table-order/backend migration:run
pnpm seed
pnpm dev:backend          # :4000
pnpm dev:customer         # :3000
pnpm dev:admin            # :3001
```

---

## 3) 검증 / 테스트

```bash
pnpm type-check           # TS strict (FE + BE)
pnpm lint                 # ESLint / Prettier
pnpm test                 # 단위 + 통합 (Jest) — 워크스페이스 일괄
pnpm test:e2e             # E2E (Playwright, 4 환경) — 스택 기동 후 실행
```

> 테스트 전략: **Unit(Jest)** · **Integration(Jest + Supertest + Testcontainers)** · **E2E(Playwright)**.
> 테스트 코드는 다음 **Build & Test** 단계에서 작성된다. E2E 는 `docker compose up` 으로 스택 기동 후 `pnpm test:e2e`.
> Playwright 4 환경: chromium / webkit / Mobile Chrome / Mobile Safari.

---

## 4) 백업 / 복원

```bash
./scripts/backup.sh                                   # ./backups 에 볼륨 tar
./scripts/restore.sh <mysql.tgz> <image-uploads.tgz>  # down 후 복원
```

영속 볼륨: `mysql-data`(DB), `image-uploads`(메뉴 이미지 `/var/lib/uploads`).

## 5) 환경변수

`.env.example` 참고. `.env` 는 커밋 금지. `JWT_SECRET` 은 64byte 이상 랜덤(`openssl rand -hex 32`).
`NEXT_PUBLIC_API_URL` 은 **빌드타임 inline** 이므로 실제 호스트 배포 시 빌드 시점 주입 필요.
