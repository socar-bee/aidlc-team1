# U1 Foundation — Code Generation Plan

**Unit**: U1 Shared Foundation
**Type**: Greenfield (Monolith Backend + 2 FE apps + shared package)
**Project Type**: pnpm workspaces monorepo
**Workspace Root**: `/Users/admin/Desktop/aidlc-modu/`
**Stories**: 0 (foundation has no direct stories; enables all other units)
**Status**: ✅ COMPLETED

## Stage Decisions (U1)

| Stage | 결정 | 사유 |
|---|---|---|
| Functional Design | SKIP | Foundation은 비즈니스 로직 없음 |
| NFR Requirements | SKIP | 단위별 NFR 없음 |
| NFR Design | SKIP | 동일 |
| Infrastructure Design | DONE (one-shot) | `shared/shared-infrastructure.md` |
| Code Generation | EXECUTE | ✅ Done |

---

## Generation Steps

### Project Structure Setup

- [x] **Step 1**: 루트 monorepo 설정 (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.nvmrc`)

### shared-types Package

- [x] **Step 2**: `packages/shared-types/` 초기화 (`package.json`, `tsconfig.json`, `src/index.ts`)
- [x] **Step 3**: Enums (`order-status.ts` + 전이 표, `sse-event-type.ts`, `enums/index.ts`)
- [x] **Step 4**: DTO interfaces (`auth.ts`, `category.ts`, `menu.ts`, `order.ts`, `session.ts`, `dto/index.ts`)
- [x] **Step 5**: SSE Event payloads (`sse-event.ts`, 4 event payload, `events/index.ts`)
- [x] **Step 6**: `src/index.ts` 전체 export 정리

### Backend Application Setup

- [x] **Step 7**: `apps/backend/` 초기화 (`package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `.env.example`)
- [x] **Step 8**: Backend bootstrap (`main.ts`, `app.module.ts`)
- [x] **Step 9**: Config 모듈 (`env.validation.ts` zod, `typeorm.config.ts` + ENTITIES, `jwt.config.ts`)
- [x] **Step 10**: Common 모듈 (`http-exception.filter`, `logging.interceptor`, `current-admin/table.decorator`, `request-id.middleware`, `health.controller`, `common.module`)

### Domain Entities (TypeORM)

- [x] **Step 11**: Store entity + store.module
- [x] **Step 12**: AdminUser entity
- [x] **Step 13**: Table entity (테이블명 `restaurant_table`, MySQL 예약어 회피)
- [x] **Step 14**: Category entity + category.module
- [x] **Step 15**: Menu entity + menu.module
- [x] **Step 16**: TableSession entity + session.module
- [x] **Step 17**: Order + OrderItem entities + order.module (테이블명 `app_order`)
- [x] **Step 18**: 도메인 모듈 골격 모두 `app.module.ts`에 import

### Database Migration

- [x] **Step 19**: `migrations/data-source.ts` + `1718000000000-InitialSchema.ts` (8 테이블 + FK + 인덱스)

### Customer FE Application Setup

- [x] **Step 20**: `apps/customer-fe/` 초기화 (package/tsconfig/next.config/tailwind/postcss/.env.example)
- [x] **Step 21**: Customer FE 기본 골격 (`layout.tsx`, `page.tsx` placeholder, `globals.css`, `query-client`, `api-client`, `i18n`, `providers`, `messages/ko.json`)

### Admin FE Application Setup

- [x] **Step 22**: `apps/admin-fe/` 초기화 (동일 구조, 포트 3001)
- [x] **Step 23**: Admin FE 기본 골격 (동일 + placeholder)

### Documentation

- [x] **Step 24**: `aidlc-docs/construction/u1-foundation/code/code-summary.md`
- [x] **Step 25**: 루트 `README.md`
