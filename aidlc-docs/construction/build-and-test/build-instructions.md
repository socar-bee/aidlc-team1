# Build Instructions

## Prerequisites

- **Node.js**: 20 (`.nvmrc`)
- **pnpm**: 9+
- **Docker / Docker Compose** (통합/E2E 및 전체 스택)
- **환경변수**: `cp .env.example .env` 후 `JWT_SECRET` 등 채움

## Build Steps

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 빌드 (전 워크스페이스)

```bash
pnpm build         # pnpm -r build (shared-types → backend → FE)
```

개별:

```bash
pnpm --filter @table-order/shared-types build
pnpm --filter @table-order/backend build      # nest build → apps/backend/dist
pnpm --filter @table-order/customer-fe build  # next build (standalone)
pnpm --filter @table-order/admin-fe build
```

### 3. 빌드 검증

```bash
pnpm type-check    # 전 패키지 tsc --noEmit
pnpm lint          # ESLint / Prettier
```

- **산출물**: `apps/backend/dist`, `apps/*/.next`, `packages/shared-types/dist`
- **Docker 이미지**: `docker compose build` (각 앱 Dockerfile, monorepo 루트 컨텍스트)

## Troubleshooting

| 증상 | 원인 | 해결 |
|---|---|---|
| `Cannot find module @table-order/shared-types` | shared-types 미빌드 | `pnpm --filter @table-order/shared-types build` 먼저 |
| FE standalone 실행 시 static 404 | `.next/static` 미복사 | Dockerfile runner 단계 static COPY 확인 |
| 타입 에러(spec) | @types/jest 미설치 | `pnpm install` 재실행 |
