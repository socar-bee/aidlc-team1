# U7 Order History — Code Summary

## 목적
현재 세션 주문 내역(Customer) + 과거 세션 이력 조회·세션 종료(Admin). 현재/과거 분리 기준 = `session.endedAt IS NULL` (US-S-03).

## 생성/수정 파일 (12개)

### Backend (8)
| 파일 | 상태 | 역할 |
|---|---|---|
| `order/repositories/order.repository.ts` | Created | `listBySession`(CANCELED 제외 DESC) / `listHistoryByTable`(종료세션 QB + 날짜 + 페이지네이션) |
| `order/services/order.service.ts` | Modified | `listCurrentBySession` / `listHistoryByTable` 추가, OrderRepository 주입 |
| `order/controllers/order.controller.ts` | Modified | `GET /orders/current` (TableTokenGuard) |
| `order/order.module.ts` | Modified | OrderRepository provide·export |
| `session/repositories/session.repository.ts` | Modified | `save` 추가 |
| `session/services/session.service.ts` | Modified | `end(tableId)` — endedAt 기록, 활성 없으면 404 |
| `table/controllers/table.controller.ts` | Created | `GET /tables/:id/history`, `POST /tables/:id/end-session` (JwtAdminGuard + store 격리) |
| `table/table.module.ts` | Created | Auth/Order/Session import |
| `app.module.ts` | Modified | TableModule 등록 |

### Frontend — Customer (3)
| 파일 | 상태 | 역할 |
|---|---|---|
| `lib/queries/order.ts` | Modified | `useCurrentOrders` 추가 |
| `app/history/page.tsx` | Created | 현재 세션 주문 내역(상태 라벨 색상) |
| `components/menu/menu-screen.tsx` | Modified | 헤더에 "주문 내역" 링크 |

### Frontend — Admin (3)
| 파일 | 상태 | 역할 |
|---|---|---|
| `lib/queries/table.ts` | Created | `useTableHistory` / `useEndSession` |
| `components/table/end-session-button.tsx` | Created | "이용 완료" 버튼 + 확인 팝업 |
| `app/(dashboard)/tables/[id]/history/page.tsx` | Created | 과거 내역 + 날짜 필터 + 페이지네이션 |

### 부수 수정 (1, 본 작업으로 표면화)
| 파일 | 상태 | 역할 |
|---|---|---|
| `components/shared/sidebar.tsx` | Modified | `NAV` 배열 `as const` — typedRoutes가 `next/link` href를 `Route`로 강제, 신규 라우트 추가로 `.next/types` 재생성되며 기존 latent 에러 표면화 → 최소 수정으로 unblock |

## Stage 결정
| Stage | 결정 |
|---|---|
| Functional Design | inline (현재/과거 분리 = endedAt IS NULL / 종료는 endedAt만 기록, 주문 불변) |
| NFR | inline (admin store 격리 404 / 페이지네이션 기본 20 / 종료일 23:59:59 포함) |
| Code Generation | ✅ |

## 핵심 설계
- **현재(Customer)**: 활성 세션(`findActive`) 주문, CANCELED 제외, createdAt DESC. 활성 세션 없으면 `[]`
- **과거(Admin)**: `innerJoin session` + `s.endedAt IS NOT NULL` + 날짜 범위(`createdAt`) + skip/take. `getManyAndCount`로 total
- **세션 종료**: `endedAt = now` 한 줄. 주문 레코드는 그대로 — 현재/과거 전환은 쿼리로 처리(US-S-02/03). 진행 중 주문 있어도 강제 종료(US-A-18)
- **store 격리**: admin 엔드포인트는 `table.storeId === admin.storeId` 검증, 불일치 404

## Stories 매핑 (8)
| Story | 구현 |
|---|---|
| US-C-22 현재 세션 최신순 | `listBySession` DESC + `history/page` |
| US-C-23 주문별 상세 | `history/page` OrderCard(번호/시각/항목/금액/상태 라벨) |
| US-C-24 이전세션·취소 제외 | 활성 세션만 + `status != CANCELED` |
| US-A-18 이용완료 버튼+확인 | `EndSessionButton` + `window.confirm` |
| US-A-19 종료 시 현재 리셋 | `end()` → 현재 조회 0건 (endedAt 기준) |
| US-A-20 과거 내역 버튼 | `EndSessionButton`/history 라우트 (대시보드 배치는 U8) |
| US-A-21 과거 최신순 + 페이지네이션 | `listHistoryByTable` DESC + 이전/다음 |
| US-A-22 날짜 필터 | from/to date input → ISO 변환 쿼리 |
| US-S-02 세션 종료 트리거 | `SessionService.end` (endedAt) |

## FR 매핑
- FR-CUS-05 (주문 내역) ✅
- FR-ADM-03 (3.3 세션종료 / 3.4 과거이력) ✅
- FR-SYS-02 (이력 보존 — endedAt 논리 전환) ✅

## 의도적 제외 (Scope 경계)
- **SSE 실시간 갱신(US-C-25)**: U8
- **대시보드 그리드 / 테이블 카드에 버튼 배치**: U8 (EndSessionButton·history 라우트는 U7에서 준비, 배치만 U8)
- **테이블 등록 `POST /tables`**: U8

## Verification (실측)
```
현재 조회: 1-003→1-002→1-001 (DESC, PENDING) ✅
종료 전 history total=0 ✅
end-session → endedAt 기록 ✅
종료 후 현재 count=0 ✅
종료 후 history total=3 ✅
잘못된 테이블 999 → 404 ✅
종료 후 새 주문 → sessionId=2 자동 생성, 현재 count=1 ✅
type-check: backend ✅ / customer-fe ✅ / admin-fe ✅
```

## 후속 연결 포인트 (U8)
- 대시보드 그리드에 TableCard + `EndSessionButton` + 과거내역 링크 배치
- `OrderService.changeStatus / cancel` + SSE publish (`ORDER_*`, `SESSION_ENDED`)
- Customer `/history`에 SSE 구독 추가 (US-C-25)
