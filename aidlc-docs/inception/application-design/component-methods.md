# Component Methods — 메서드 시그니처

각 컴포넌트의 **메서드 시그니처(I/O 타입)**만 정의합니다. 비즈니스 룰·예외·검증 디테일은 Functional Design(per-unit)에서 다룹니다.

명명 규약:
- BE 메서드는 `Service` 단위로 그룹화 (NestJS Service 클래스 메서드)
- FE 메서드는 React Query hook (`useXxx`)과 Zustand action 으로 그룹화

---

## 1. Backend Services

### 1.1 AuthService

```typescript
class AuthService {
  // Admin
  adminLogin(dto: AdminLoginRequest): Promise<AdminLoginResponse>;       // returns { accessToken, expiresAt, user }
  validateAdminToken(token: string): Promise<AdminUserPayload>;          // for guard, throws on invalid
  hashPassword(plain: string): Promise<string>;                          // bcrypt cost ≥ 10
  comparePassword(plain: string, hash: string): Promise<boolean>;

  // Table
  setupTable(dto: TableSetupRequest, adminUser: AdminUserPayload): Promise<TableSetupResponse>;
  // returns { tableToken, table: { id, tableNumber } }
  validateTableToken(token: string): Promise<TablePayload>;              // for guard

  // Logging only (no lockout — Q10=C)
  logLoginAttempt(input: { storeCode: string; username: string; success: boolean; ip: string }): Promise<void>;
}
```

### 1.2 StoreService

```typescript
class StoreService {
  findByCode(code: string): Promise<Store | null>;
  getCurrent(): Promise<Store>;                  // single-store mode helper
}
```

### 1.3 CategoryService

```typescript
class CategoryService {
  list(storeId: number): Promise<Category[]>;                            // sortOrder asc
  create(dto: CreateCategoryRequest, storeId: number): Promise<Category>;
  update(id: number, dto: UpdateCategoryRequest, storeId: number): Promise<Category>;
  delete(id: number, storeId: number): Promise<void>;                    // throws if menus exist
  reorder(orderedIds: number[], storeId: number): Promise<Category[]>;   // bulk sortOrder
}
```

### 1.4 MenuService

```typescript
class MenuService {
  listByCategory(categoryId: number, storeId: number): Promise<Menu[]>;
  listAll(storeId: number, filter?: { isActive?: boolean }): Promise<Menu[]>;
  findById(id: number, storeId: number): Promise<Menu>;
  create(dto: CreateMenuRequest, storeId: number): Promise<Menu>;
  update(id: number, dto: UpdateMenuRequest, storeId: number): Promise<Menu>;
  delete(id: number, storeId: number): Promise<void>;                    // soft or hard, decided in Functional Design
  reorder(categoryId: number, orderedIds: number[], storeId: number): Promise<Menu[]>;
}
```

### 1.5 ImageService

```typescript
class ImageService {
  saveUpload(file: Express.Multer.File): Promise<{ url: string; filename: string }>;
  // No resize, no optimization (constraints)
  resolveStaticPath(filename: string): string;                           // for serveStatic
}
```

### 1.6 OrderService

```typescript
class OrderService {
  // Customer
  create(dto: CreateOrderRequest, table: TablePayload): Promise<Order>;  // triggers SessionService.ensureActiveSession (푸시 없음 — 폴링으로 반영)
  listCurrentBySession(table: TablePayload): Promise<Order[]>;           // current session, excludes CANCELED
  listCurrentByTableId(tableId: number): Promise<Order[]>;              // 동일 (Admin 상세/대시보드 공용)

  // Admin (상태변경·취소는 비관적 락 트랜잭션 — 동시 편집 원자성)
  changeStatus(id: number, next: OrderStatus, admin: AdminUserPayload): Promise<Order>;  // SELECT FOR UPDATE + 정방향 재검증
  cancel(id: number, admin: AdminUserPayload): Promise<Order>;          // soft-delete (CANCELED), SELECT FOR UPDATE

  // History
  listHistoryByTable(tableId: number, range?: { from?: Date; to?: Date }): Promise<Order[]>;
  // returns orders where sessionId.endedAt IS NOT NULL
}
```

### 1.7 SessionService

```typescript
class SessionService {
  ensureActiveSession(tableId: number): Promise<TableSession>;           // create-if-absent (first order trigger — US-S-01)
  end(tableId: number, storeId: number): Promise<TableSession>;          // sets endedAt (푸시 없음 — 폴링으로 반영)
  findActive(tableId: number): Promise<TableSession | null>;
  listEnded(tableId: number, range?: DateRange): Promise<TableSession[]>;
}
```

### 1.8 TableService (대시보드 집계 — 폴링 대상)

```typescript
class TableService {
  listTables(storeId: number): Promise<Array<{ id: number; tableNumber: number }>>;
  buildSummaries(storeId: number): Promise<TableSummary[]>;  // 빈 테이블 포함, 활성 세션 총액 + 최신 3 미리보기
}
```

> **RealtimeService 제거**: SSE 푸시 폐기. 실시간은 클라이언트가 위 집계/조회를 2초 폴링하여 달성. (U8 GATE 설계 변경)

### 1.9 Controllers (요약 — HTTP endpoint binding)

| Controller | Endpoint | Method | Guard | Calls |
|---|---|---|---|---|
| AuthController | `POST /auth/admin/login` | login | — | AuthService.adminLogin |
| AuthController | `POST /auth/table/setup` | setup | JwtAdminGuard | AuthService.setupTable |
| TableController | `GET /tables` | list | JwtAdminGuard | TableService.listTables |
| TableController | `GET /tables/summary` | summary | JwtAdminGuard | TableService.buildSummaries (폴링) |
| TableController | `GET /tables/:id/current-orders` | currentOrders | JwtAdminGuard | OrderService.listCurrentByTableId (폴링) |
| TableController | `POST /tables/:id/end-session` | endSession | JwtAdminGuard | SessionService.end |
| TableController | `GET /tables/:id/history` | history | JwtAdminGuard | OrderService.listHistoryByTable |
| CategoryController | `GET /categories` | list | (public for customer) / JwtAdminGuard | CategoryService.list |
| CategoryController | `POST /categories` | create | JwtAdminGuard | CategoryService.create |
| CategoryController | `PATCH /categories/:id` | update | JwtAdminGuard | CategoryService.update |
| CategoryController | `DELETE /categories/:id` | delete | JwtAdminGuard | CategoryService.delete |
| CategoryController | `PATCH /categories/reorder` | reorder | JwtAdminGuard | CategoryService.reorder |
| MenuController | `GET /menus` | list | TableTokenGuard or JwtAdminGuard | MenuService.listAll |
| MenuController | `GET /menus/by-category/:id` | listByCategory | (same) | MenuService.listByCategory |
| MenuController | `POST /menus` | create | JwtAdminGuard | MenuService.create |
| MenuController | `PATCH /menus/:id` | update | JwtAdminGuard | MenuService.update |
| MenuController | `DELETE /menus/:id` | delete | JwtAdminGuard | MenuService.delete |
| MenuController | `PATCH /menus/reorder` | reorder | JwtAdminGuard | MenuService.reorder |
| ImageController | `POST /images/upload` | upload | JwtAdminGuard | ImageService.saveUpload |
| OrderController | `POST /orders` | create | TableTokenGuard | OrderService.create |
| OrderController | `GET /orders/current` | listCurrent | TableTokenGuard | OrderService.listCurrentBySession |
| OrderController | `PATCH /orders/:id/status` | changeStatus | JwtAdminGuard | OrderService.changeStatus |
| OrderController | `DELETE /orders/:id` | cancel | JwtAdminGuard | OrderService.cancel |

> **테이블 등록(US-A-14)**: 별도 `POST /tables` 없이 기존 `POST /auth/table/setup` 재사용. **`GET /sse/stream` 제거** (SSE 폐기). **flat `GET /orders` 생략** (대시보드는 `/tables/summary` + `/tables/:id/current-orders`).

---

## 2. Frontend — Customer FE (`customer-fe`)

### 2.1 React Query Hooks

```typescript
// src/lib/queries/menu.ts
useMenusByCategory(categoryId: number): UseQueryResult<Menu[]>;
useAllMenus(): UseQueryResult<Menu[]>;
useCategories(): UseQueryResult<Category[]>;

// src/lib/queries/order.ts
useCreateOrder(): UseMutationResult<Order, Error, CreateOrderRequest>;
useCurrentOrders(): UseQueryResult<Order[]>;  // refetchInterval: 2000 (폴링)

// src/lib/queries/auth.ts
useTableSetup(): UseMutationResult<TableSetupResponse, Error, TableSetupRequest>;
```

### 2.2 Zustand Stores

```typescript
// src/stores/cart-store.ts
interface CartItem {
  menuId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}
interface CartState {
  items: CartItem[];
  add(item: Omit<CartItem, 'quantity'>): void;
  remove(menuId: number): void;
  setQuantity(menuId: number, qty: number): void;
  clear(): void;
  total(): number;          // computed
}
// persist middleware → localStorage key 'cart'
```

### 2.3 Auth helpers

```typescript
// src/lib/auth.ts
saveTableToken(token: string): void;
getTableToken(): string | null;
clearTableToken(): void;
isTableAuthenticated(): boolean;
```

### 2.4 폴링 (SSE client 대체)

별도 SSE 클라이언트 없음. 실시간 갱신은 React Query `refetchInterval`로 처리.

```typescript
// src/lib/queries/order.ts
useCurrentOrders(): UseQueryResult<Order[]>;  // { refetchInterval: 2000 }
```

---

## 3. Frontend — Admin FE (`admin-fe`)

### 3.1 React Query Hooks

```typescript
// auth
useAdminLogin(): UseMutationResult<AdminLoginResponse, Error, AdminLoginRequest>;

// dashboard (폴링)
useDashboard(): UseQueryResult<TableSummary[]>;          // { refetchInterval: 2000 } + 폴링 diff로 신규 주문 강조
useTableCurrentOrders(tableId): UseQueryResult<Order[]>; // { refetchInterval: 2000 }
useChangeOrderStatus(): UseMutationResult<Order, Error, { id; next }>;
useCancelOrder(): UseMutationResult<Order, Error, number>;

// menu/category
useCategories(): UseQueryResult<Category[]>;
useCreateCategory(): UseMutationResult<Category, Error, CreateCategoryRequest>;
useUpdateCategory(): UseMutationResult<Category, Error, { id: number; dto: UpdateCategoryRequest }>;
useDeleteCategory(): UseMutationResult<void, Error, number>;
useReorderCategories(): UseMutationResult<Category[], Error, number[]>;

useMenus(filter?): UseQueryResult<Menu[]>;
useCreateMenu(): UseMutationResult<Menu, Error, CreateMenuRequest>;
useUpdateMenu(): UseMutationResult<Menu, Error, { id: number; dto: UpdateMenuRequest }>;
useDeleteMenu(): UseMutationResult<void, Error, number>;
useUploadImage(): UseMutationResult<{ url: string }, Error, File>;

// table
useRegisterTable(): UseMutationResult<TableSetupResponse, Error, TableSetupRequest>;
useEndSession(): UseMutationResult<TableSession, Error, number>;  // tableId
useTableHistory(tableId: number, range?: DateRange): UseQueryResult<Order[]>;

// order
useChangeOrderStatus(): UseMutationResult<Order, Error, { id: number; next: OrderStatus }>;
useCancelOrder(): UseMutationResult<Order, Error, number>;
```

### 3.2 Zustand Stores

```typescript
// src/stores/auth-store.ts
interface AuthState {
  token: string | null;
  user: AdminUserPayload | null;
  setAuth(token: string, user: AdminUserPayload): void;
  clear(): void;
  isAuthenticated(): boolean;
}
// persist middleware → localStorage 'admin_token'
```

---

## 4. Shared Types (`packages/shared-types`)

### 4.1 Enums

```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}
// (DEPRECATED) SseEventType — SSE 폐기로 미사용. shared-types에는 U1 골격으로 잔존하나 런타임에서 참조하지 않음
```

### 4.2 DTO 인터페이스 (요약)

```typescript
// Auth
interface AdminLoginRequest { storeCode: string; username: string; password: string; }
interface AdminLoginResponse { accessToken: string; expiresAt: string; user: AdminUserPayload; }
interface AdminUserPayload { id: number; storeId: number; username: string; }
interface TableSetupRequest { tableNumber: number; password: string; }
interface TableSetupResponse { tableToken: string; table: { id: number; tableNumber: number }; }
interface TablePayload { tableId: number; storeId: number; tableNumber: number; }

// Category
interface Category { id: number; storeId: number; name: string; sortOrder: number; }
interface CreateCategoryRequest { name: string; }
interface UpdateCategoryRequest { name?: string; sortOrder?: number; }

// Menu
interface Menu {
  id: number; storeId: number; categoryId: number;
  name: string; price: number; description: string | null;
  imageUrl: string | null; sortOrder: number; isActive: boolean;
}
interface CreateMenuRequest {
  categoryId: number; name: string; price: number;
  description?: string; imageUrl?: string;
}
interface UpdateMenuRequest extends Partial<CreateMenuRequest> { sortOrder?: number; isActive?: boolean; }

// Order
interface OrderItem { id?: number; menuId: number; menuName: string; unitPrice: number; quantity: number; }
interface Order {
  id: number; sessionId: number; tableId: number; orderNumber: string;
  totalAmount: number; status: OrderStatus;
  items: OrderItem[];
  createdAt: string; canceledAt: string | null;
}
interface CreateOrderRequest { items: { menuId: number; quantity: number }[]; }

// Session
interface TableSession { id: number; tableId: number; startedAt: string; endedAt: string | null; }
interface TableSummary {
  tableId: number; tableNumber: number;
  activeSessionId: number | null;
  totalAmount: number; recentOrderPreviews: Array<{ orderNumber: string; itemsSummary: string }>;
}
```

### 4.3 ~~SSE Event Payloads~~ (DEPRECATED — 폴링 전환)

SSE 푸시 폐기로 이벤트 페이로드 불필요. `SseEvent`/`OrderCreatedEvent`/`OrderStatusChangedEvent`/`OrderCanceledEvent`/`SessionEndedEvent` 타입은 shared-types(U1 골격)에 잔존하나 런타임 미참조. 실시간은 기존 REST 조회를 2초 폴링하여 달성한다.

---

## Note
모든 메서드의 **에러 케이스 / 검증 룰 / 트랜잭션 경계**는 후속 Functional Design 단계에서 Unit별로 명세합니다.
