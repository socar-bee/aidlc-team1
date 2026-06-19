# U1 Foundation — Code Summary

본 문서는 U1에서 생성된 파일과 후속 Unit에서의 활용 가이드를 정리합니다.

---

## 생성 파일 (Greenfield, 모두 신규)

### 루트 (`/`)
- `package.json` — monorepo 루트 (pnpm workspaces)
- `pnpm-workspace.yaml`
- `tsconfig.base.json` — 전 패키지 공통 TS 옵션
- `.gitignore`, `.editorconfig`, `.nvmrc`

### `packages/shared-types/`
- `package.json`, `tsconfig.json`
- `src/index.ts` (re-export 진입점)
- `src/enums/order-status.ts` — `OrderStatus` enum + `ORDER_STATUS_FORWARD_TRANSITIONS`
- `src/enums/sse-event-type.ts` — `SseEventType`
- `src/enums/index.ts`
- `src/dto/auth.ts` — AdminLogin* / TableSetup* / *Payload
- `src/dto/category.ts` — Category / CRUD requests / Reorder
- `src/dto/menu.ts` — Menu / CRUD requests / UploadImageResponse
- `src/dto/order.ts` — Order / OrderItem / CreateOrderRequest / ChangeOrderStatusRequest / OrderListResponse
- `src/dto/session.ts` — TableSession / TableSummary / OrderPreview
- `src/dto/index.ts`
- `src/events/sse-event.ts` — `SseEvent<T>` 래퍼
- `src/events/order-created.event.ts`
- `src/events/order-status-changed.event.ts`
- `src/events/order-canceled.event.ts`
- `src/events/session-ended.event.ts`
- `src/events/index.ts`

### `apps/backend/` (NestJS)
- `package.json` — Nest 10 + TypeORM 0.3 + bcrypt + jsonwebtoken + zod + class-validator + multer + event-emitter + serve-static + swagger
- `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `.env.example`
- `src/main.ts` — bootstrap (CORS, ValidationPipe, HttpExceptionFilter, LoggingInterceptor, port=4000)
- `src/app.module.ts` — TypeOrm/Config/EventEmitter + 7 domain modules
- `src/config/env.validation.ts` — zod 기반 env 검증
- `src/config/typeorm.config.ts` — DataSource 옵션 + ENTITIES 배열
- `src/config/jwt.config.ts` — secret / 만료 helper
- `src/common/filters/http-exception.filter.ts` — `{ error: { code, message, details? }, requestId }` 통일 포맷
- `src/common/interceptors/logging.interceptor.ts` — 구조화 JSON 로그 (requestId, method, url, status, latency, ua)
- `src/common/decorators/current-admin.decorator.ts` — `@CurrentAdmin()`
- `src/common/decorators/current-table.decorator.ts` — `@CurrentTable()`
- `src/common/middleware/request-id.middleware.ts` — x-request-id 자동 생성/전파
- `src/common/health/health.controller.ts` — `GET /health`
- `src/common/common.module.ts`
- `src/store/entities/store.entity.ts`, `src/store/store.module.ts`
- `src/auth/entities/admin-user.entity.ts`, `src/auth/entities/table.entity.ts`, `src/auth/auth.module.ts`
- `src/category/entities/category.entity.ts`, `src/category/category.module.ts`
- `src/menu/entities/menu.entity.ts`, `src/menu/menu.module.ts`
- `src/session/entities/table-session.entity.ts`, `src/session/session.module.ts`
- `src/order/entities/order.entity.ts`, `src/order/entities/order-item.entity.ts`, `src/order/order.module.ts`
- `src/migrations/data-source.ts` — CLI용 DataSource (dotenv)
- `src/migrations/1718000000000-InitialSchema.ts` — 8 테이블 + 인덱스 + FK 일괄 생성

### `apps/customer-fe/` (Next.js 14 App Router)
- `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`
- `src/app/layout.tsx` — RootLayout + Providers (RQ)
- `src/app/page.tsx` — placeholder (U4에서 교체)
- `src/app/globals.css`
- `src/lib/query-client.ts` — 싱글톤 QueryClient
- `src/lib/api-client.ts` — fetch 래퍼 + `ApiError` + Authorization 자동
- `src/lib/i18n.ts` — next-intl 설정 (ko 단일, Asia/Seoul)
- `src/lib/providers.tsx` — QueryClientProvider 래퍼
- `messages/ko.json`

### `apps/admin-fe/` (Next.js 14 App Router)
- 동일 골격 + 포트 3001
- `src/app/page.tsx` placeholder (U8에서 교체)

---

## 후속 Unit 활용 가이드

### Entity import
```ts
import { StoreEntity } from '@/store/entities/store.entity';
import { OrderStatus } from '@table-order/shared-types';
```

### shared-types 사용
- BE DTO 클래스는 `shared-types` 의 interface를 `implements` 또는 동일 구조로 작성
- FE는 React Query / Zustand 데이터 타입에 그대로 사용

### Guard / 데코레이터 활용 (U2에서 구체 구현)
- U2가 `JwtAdminGuard`, `TableTokenGuard` 구현
- 컨트롤러는 `@UseGuards(JwtAdminGuard)` + `@CurrentAdmin() admin`
- request 객체에 `admin` 또는 `table` payload 가 주입되어 있어야 함 — U2 Guard가 책임

### Migration
```bash
pnpm --filter @table-order/backend migration:run
pnpm --filter @table-order/backend migration:revert
```

### 에러 응답 포맷 (전역)
```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] },
  "requestId": "..."
}
```

후속 Unit Service는 NestJS 표준 HttpException 만 throw — Filter가 자동 변환.

---

## Open Items (후속 Unit에서 해결)

| 항목 | 후속 Unit |
|---|---|
| AuthService 구현 + Guards | U2 |
| Customer setup 화면 + 자동 로그인 | U2 |
| Admin 로그인 + 토큰 저장 | U2 |
| Category/Menu/Image Controller·Service | U3 |
| Customer 메뉴 화면 | U4 |
| 장바구니 Zustand store | U5 |
| OrderService.create + 세션 보장 | U6 |
| 주문 내역 / 세션 종료 | U7 |
| SSE Realtime / 대시보드 / 상태 변경 | U8 |
| Docker Compose / Dockerfile / seed / README 완성 | U9 |

---

## 검증 가이드 (수동)

```bash
# 1. 의존성 설치
pnpm install

# 2. shared-types 빌드
pnpm --filter @table-order/shared-types build

# 3. Backend 타입 체크 / 빌드
pnpm --filter @table-order/backend type-check
pnpm --filter @table-order/backend build

# 4. FE 타입 체크
pnpm --filter @table-order/customer-fe type-check
pnpm --filter @table-order/admin-fe type-check

# 5. (로컬 MySQL 또는 docker로 mysql만 띄운 상태에서) 마이그레이션 실행
cp apps/backend/.env.example apps/backend/.env  # 값 채우기
pnpm migration:run

# 6. Backend 부팅 + health check
pnpm dev:backend
curl http://localhost:4000/health
# → {"status":"ok","timestamp":"..."}
```
