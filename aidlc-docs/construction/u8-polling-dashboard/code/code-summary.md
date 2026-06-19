# U8 Polling Dashboard — Code Summary

> **설계 변경 (U8 GATE)**: 최초 SSE 푸시 구현 → **2초 폴링**으로 다운그레이드. RealtimeService/SseController/sse-client 전면 제거, React Query `refetchInterval`로 대체. Admin 동시 편집은 **비관적 락**으로 보강. 관련 inception 문서(requirements/services/component-methods/components/unit-of-work) 동반 갱신.

## 목적
폴링 기반 그리드 대시보드 + 주문 상태 변경(동시성 안전) + soft-delete. Customer 주문 → Admin ≤2초(폴링 주기) 반영.

## 변경 핵심 (SSE → 폴링)

### 제거된 것
| 대상 | 상태 |
|---|---|
| `apps/backend/src/realtime/` (RealtimeService/SseAuthGuard/SseController/RealtimeModule) | 디렉토리 삭제 |
| `GET /sse/stream` | 제거 (404) |
| `apps/admin-fe/src/lib/sse-client.ts`, `apps/customer-fe/src/lib/sse-client.ts` | 삭제 |
| OrderService/SessionService 의 `publish*` 호출 | 제거 |
| OrderRepository `findById`/`save` | 제거 (락 방식 전환으로 미사용) |

> shared-types의 `SseEvent`/이벤트 타입/`SseEventType`은 U1 골격이라 잔존(미사용 dead code, 문서에 DEPRECATED 표기).

### 추가/변경된 것
| 파일 | 변경 |
|---|---|
| `order/services/order.service.ts` | `changeStatus`/`cancel` → **트랜잭션 + `pessimistic_write` 락** + 락 안에서 정방향 재검증. `lockInStore`(단일 테이블 락 → items 별도 로드) |
| `admin-fe/lib/queries/dashboard.ts` | `useDashboard`/`useTableCurrentOrders` 에 `refetchInterval: 2000` |
| `admin-fe/app/(dashboard)/page.tsx` | useSse 제거 → **폴링 diff 강조**(직전 대비 최신 주문번호 변화 감지 시 5초) |
| `customer-fe/lib/queries/order.ts` | `useCurrentOrders` 에 `refetchInterval: 2000` |
| `customer-fe/app/history/page.tsx` | useSse 제거 (폴링으로 상태 갱신) |

## 동시성 설계 (admin)
- 폴링은 최대 2초 stale → 두 Admin이 같은 주문을 동시 편집 가능
- `changeStatus`/`cancel`을 `dataSource.transaction` + `SELECT ... FOR UPDATE`(pessimistic_write)로 감싸 read-modify-write 직렬화
- 락 획득 후 `ORDER_STATUS_FORWARD_TRANSITIONS`로 전이 재검증 → 중복/무효 전이는 400
- 락은 `app_order` 단일 행에만(외부 조인 회피), `order_item`은 락 후 별도 조회
- FE: pending 중 버튼 비활성, 충돌(400)은 다음 폴링이 실제 상태로 보정

## 신규 주문 강조 (US-A-10, 폴링 버전)
- SSE 이벤트가 없으므로 **폴링 결과 diff**로 감지: 각 테이블 `recentOrderPreviews[0].orderNumber`가 직전 폴링과 달라지면 신규 주문 → 5초 강조
- 트레이드오프: 취소로 top preview가 바뀌면 드물게 오강조 가능(PoC 허용)

## Stories 매핑 (12 + 폐기 2)
| Story | 구현 |
|---|---|
| US-A-07~08 그리드/카드 | dashboard grid + TableCard + buildSummaries |
| US-A-09 ≤2초 반영 | `refetchInterval: 2000` |
| US-A-10 신규 강조 | 폴링 diff(최신 주문번호 변화) 5초 |
| US-A-11 상세 | OrderDetailModal + current-orders(폴링) |
| US-A-12 상태변경 | 비관적 락 + 정방향, 역방향 400 |
| US-A-13 필터 | select |
| US-A-14 등록 | `POST /auth/table/setup` 재사용 |
| US-A-15~17 삭제/soft-delete/재계산 | cancel(락) + summary CANCELED 제외 |
| US-C-25 Customer 실시간 | history 2초 폴링 |
| ~~US-S-04 SSE publish~~ | **폐기** (SSE 제거) |
| ~~US-S-05 SSE 재연결~~ | **폐기** (영속 연결 없음 → 폴링 자연 복구) |

## FR 매핑
- FR-ADM-02 ✅ / FR-ADM-03(3.1,3.2) ✅ / **FR-SYS-03 → 폴링으로 재정의** ✅ / FR-CUS-05(일부) ✅
- NFR-PERF-01(≤2초=폴링주기) / NFR-PERF-04(동시 폴링 ≥5) / **NFR-REL-02 제거** / NFR-REL-04(동시편집 원자성) 신설

## Verification (실측)
```
/sse/stream → 404 (제거 확인) ✅
상태변경 PENDING→PREPARING (락 하 items 로드) ✅ / 역방향 400 ✅ / soft-delete CANCELED ✅
동시 PREPARING×2 → 하나 200, 하나 400(중복 거부) — 락 직렬화 ✅
summary 총액 재계산 / 폴링 갱신 동작 ✅
type-check: backend ✅ / customer-fe ✅ / admin-fe ✅
```

## 후속 (U9 Infra & DevX)
- docker-compose 전체 기동 + seed + README + lint/prettier/playwright 설정 → Build & Test
