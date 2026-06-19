# U6 Order + Session — Code Summary

## 목적
주문 생성 골든 플로우 + 테이블 세션 자동 라이프사이클. 장바구니 → 주문 확정 → 주문번호 반환 → 5초 후 메뉴 복귀.

## 생성/수정 파일 (12개)

### Backend — Session (3)
| 파일 | 상태 | 역할 |
|---|---|---|
| `session/repositories/session.repository.ts` | Created | `findActive(tableId)` — 종료 안 된 세션 조회 |
| `session/services/session.service.ts` | Created | `findActive` / `ensureActiveSession(manager, tableId)` (트랜잭션 참여) |
| `session/session.module.ts` | Modified | Service/Repository provide + export |

### Backend — Order (5)
| 파일 | 상태 | 역할 |
|---|---|---|
| `order/dto/create-order.dto.ts` | Created | `CreateOrderDto` (items 배열 nested 검증, qty 1~99) |
| `order/dto/index.ts` | Created | barrel |
| `order/services/order.service.ts` | Created | `create()` — 트랜잭션(세션 보장 + 주문 + 아이템 스냅샷) |
| `order/controllers/order.controller.ts` | Created | `POST /orders` (TableTokenGuard + CurrentTable) |
| `order/order.module.ts` | Modified | AuthModule + SessionModule import, Controller/Service 등록 |

### Frontend — Customer (3)
| 파일 | 상태 | 역할 |
|---|---|---|
| `lib/queries/order.ts` | Created | `useCreateOrder` mutation (table token 첨부) |
| `components/order/order-success.tsx` | Created | 성공 화면 + 5초 카운트다운 자동 리다이렉트 |
| `app/checkout/page.tsx` | Created | 주문 확인 화면 + 확정 + 에러 시 장바구니 유지 |

## Stage 결정
| Stage | 결정 |
|---|---|
| Functional Design | inline (주문번호 규칙 / 세션 자동 / 스냅샷) |
| NFR | inline (트랜잭션 원자성 / 인증 / 서버측 수량 재검증) |
| Code Generation | ✅ |

## 핵심 설계

### 주문 생성 트랜잭션 (`OrderService.create`)
```
dataSource.transaction(manager =>
  1. ensureActiveSession(manager, tableId)   // 없으면 새 세션 자동 시작
  2. menus = find({ id IN ids, storeId })     // 테이블 토큰의 storeId 범위
  3. 각 line 검증: 없거나 비활성 메뉴 → 400 BadRequest (트랜잭션 롤백)
  4. total = Σ(unitPrice × qty), 아이템에 name/price 스냅샷 보관
  5. seq = (세션 내 주문 수) + 1
  6. orderNumber = `${sessionId}-${seq:3}`    // 전역 유니크
  7. save(order + items cascade)
)
```

### 주문번호
- 형식: `{sessionId}-{seq3}` (예: `1-001`, `1-002`)
- 전역 유니크: sessionId 유니크 × 세션 내 seq 유니크 → uq_order_number 충돌 없음
- ⚠️ seq를 count 기반 산출 → 동일 세션 동시 주문 시 희박한 경합 가능. 단일 매장 PoC 부하에서 수용. (강화 필요 시 세션 pessimistic lock 또는 유니크 충돌 retry — 후속)

### 메뉴 스냅샷
- `order_item.menuNameSnapshot` / `unitPriceSnapshot` 에 주문 시점 값 고정 → 이후 메뉴 변경/삭제와 무관하게 내역 보존 (DoD)

## Stories 매핑 (7)
| Story | 구현 |
|---|---|
| US-C-17 주문 확정 | `checkout/page` 확정 버튼 → `useCreateOrder` |
| US-C-18 주문 성공 화면 | `order-success` (주문번호 표시) |
| US-C-19 5초 후 메뉴 복귀 | `order-success` 카운트다운 + `router.replace('/')` |
| US-C-20 주문 실패 시 장바구니 유지 | `onSuccess`에서만 `clear()`, 에러 시 cart 보존 + 에러 배너 |
| US-C-21 주문 항목/총액 확인 | `checkout/page` 항목 리스트 + 총액 |
| US-S-01 세션 자동 시작 | `ensureActiveSession` (첫 주문 시 생성) |
| US-S-03 주문-세션 연결 | `order.sessionId` = 활성 세션, 같은 세션 주문 누적 |

## FR 매핑
- FR-CUS-04 (주문 생성/확정) ✅
- FR-SYS-01 (세션 자동 라이프사이클 — 시작) ✅ (종료는 U7)

## 의도적 제외 (Scope 경계)
- **SSE publish 미포함**: `OrderCreatedEvent` 발행은 U8(RealtimeService) 도래 후. 현재 RealtimeService 미존재 → 결합 회피
- **OrderRepository 미생성**: U6 create는 트랜잭션 manager로 처리. 조회 메서드는 U7에서 추가
- **주문 조회/상태변경/취소**: U7(history) / U8(realtime) 담당

## Verification (실측)
```
admin login → table/setup(1번) → table token
POST /orders {menu1×2, menu2×1}  → 1-001, total 14000, items 스냅샷 ✅
POST /orders {menu1×1}            → 1-002, sessionId=1 (세션 공유) ✅
DB: sessions=1, orders=2, items=3 ✅
POST /orders {menuId 99999}      → 400 + 롤백(세션 orphan 없음) ✅
type-check: backend ✅ / customer-fe ✅
```
(lint 설정 파일은 U9 Infra & DevX 산출물 — 현 단계 미도래)

## 후속 연결 포인트 (U7)
- `OrderService.listCurrentBySession` / `listHistoryByTable` 추가 (OrderRepository 신설)
- `SessionService.end` (endedAt 기록) + Admin "이용 완료"
- Customer `/history` 현재 세션 주문 내역
