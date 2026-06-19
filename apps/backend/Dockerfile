# ============================================================
# Backend (NestJS) — monorepo 루트 컨텍스트로 빌드
# build: docker compose build backend  (context: 레포 루트)
# ============================================================

# ---- builder ----
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app

# 워크스페이스 매니페스트 먼저 복사 (레이어 캐시)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/backend/package.json apps/backend/

RUN pnpm install --frozen-lockfile

# 소스 복사 후 빌드 (shared-types → backend 순)
COPY packages/shared-types packages/shared-types
COPY apps/backend apps/backend
RUN pnpm --filter @table-order/shared-types build \
 && pnpm --filter @table-order/backend build

# ---- runner ----
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# 빌드 산출물 + 의존성(워크스페이스 전체) 복사
# (PoC: 풀 node_modules 복사로 단순화 — seed 의 ts-node 도 동작)
COPY --from=builder /app ./

# 이미지 업로드 볼륨 마운트 지점
RUN mkdir -p /var/lib/uploads
VOLUME ["/var/lib/uploads"]

EXPOSE 4000
WORKDIR /app/apps/backend
CMD ["node", "dist/main.js"]
