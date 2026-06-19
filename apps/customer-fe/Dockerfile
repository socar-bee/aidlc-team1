# ============================================================
# customer-fe (Next.js 14 standalone) — monorepo 루트 컨텍스트
# NEXT_PUBLIC_* 는 빌드타임 inline → build-arg 로 주입
# ============================================================
ARG NEXT_PUBLIC_API_URL=http://localhost:4000

# ---- builder ----
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/customer-fe/package.json apps/customer-fe/

RUN pnpm install --frozen-lockfile

COPY packages/shared-types packages/shared-types
COPY apps/customer-fe apps/customer-fe
RUN pnpm --filter @table-order/shared-types build \
 && pnpm --filter @table-order/customer-fe build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next standalone 산출물 (monorepo: server.js 는 apps/customer-fe 하위)
COPY --from=builder /app/apps/customer-fe/.next/standalone ./
COPY --from=builder /app/apps/customer-fe/.next/static ./apps/customer-fe/.next/static
COPY --from=builder /app/apps/customer-fe/messages ./apps/customer-fe/messages

EXPOSE 3000
CMD ["node", "apps/customer-fe/server.js"]
