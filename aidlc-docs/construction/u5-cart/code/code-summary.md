# U5 Cart (Customer FE-only) — Code Summary

## 생성/수정 파일 (5개)

| 파일 | 상태 | 역할 |
|---|---|---|
| `src/stores/cart-store.ts` | Created | Zustand + persist (`cart` key) |
| `src/components/cart/floating-cart-button.tsx` | Created | 메뉴 화면 하단 fixed 버튼 (개수+총액) |
| `src/components/cart/cart-item-row.tsx` | Created | 장바구니 1행 (수량 증감 + 삭제) |
| `src/app/cart/page.tsx` | Created | 장바구니 화면 + 비우기 + 주문하기 버튼 |
| `src/components/menu/menu-screen.tsx` | Modified | onAddToCart 연결 + FloatingCartButton 통합 |

## Stage 결정

| Stage | 결정 |
|---|---|
| Functional Design | inline (수량 1~99 클램프 / 추가 시 기존 아이템 수량 증가 / 0이면 자동 삭제) |
| NFR | inline (localStorage 직렬화 실패 시 빈 cart fallback / 터치 44px) |
| Code Generation | ✅ |

## Cart Store API

```typescript
interface CartItem {
  menuId: number;
  name: string;
  unitPrice: number;
  quantity: number;       // 1~99
}

useCartStore({
  items: CartItem[],
  add(menu, quantity=1): void;     // 기존 아이템이면 수량 증가
  remove(menuId): void;
  setQuantity(menuId, qty): void;  // qty<=0이면 자동 삭제
  inc(menuId): void;                // dec → 1 미만이면 remove
  dec(menuId): void;
  clear(): void;
  total(): number;                  // Σ(unitPrice × quantity)
  count(): number;                  // Σ quantity
});
```

**Persist**: `name: 'cart'`, `partialize: items만`, `onRehydrateStorage` 에서 deserialization 에러 시 clear

## Stories 매핑 (6)

| Story | 위치 |
|---|---|
| US-C-11 메뉴 추가 | `cart-store.add` (멱등 / 기존 아이템 수량+1) + `MenuDetailModal` 의 `onAddToCart` 연결 |
| US-C-12 메뉴 삭제 | `cart-store.remove` + `cart-item-row` 삭제 버튼 |
| US-C-13 수량 증감 | `cart-store.inc/dec` + `−`/`＋` 버튼, 1~99 클램프, 0이면 자동 삭제 |
| US-C-14 총액 실시간 계산 | `cart-store.total()` selector → `floating-cart-button` + `cart/page` footer |
| US-C-15 비우기 | `cart/page` 우측 버튼 + `window.confirm` |
| US-C-16 localStorage 영속화 | `persist` 미들웨어, 직렬화 실패 시 fallback |

## UI 결정

- **FloatingCartButton**: 메뉴 화면 하단 중앙 fixed pill. `items.length > 0`일 때만 표시. 개수 뱃지 + 총액 노출
- **장바구니 페이지**: 헤더(뒤로/비우기) + 아이템 리스트 + 고정 footer(총액 + 주문하기)
- **수량 컨트롤**: 원형 −/＋ 버튼 (44×44px), 가운데 숫자
- **빈 상태**: "장바구니가 비어 있습니다" + 메뉴로 돌아가기 버튼
- **주문하기 버튼**: `/checkout` 으로 라우팅 (U6에서 구현)

## SSR 안전성

- Zustand persist는 client-side. 첫 SSR 렌더에서 `items=[]` → 클라이언트 hydration 후 localStorage 복원
- FloatingCartButton은 첫 SSR 렌더에서 `count===0`이라 렌더 안 됨 → flash 최소
- 모든 cart 사용 컴포넌트는 `'use client'`

## 후속 연결 포인트 (U6)

- `/cart` "주문하기" 버튼 → `/checkout` 페이지로 라우팅
- U6에서 `/checkout`: 주문 확정 화면 + `useCreateOrder` mutation + 성공 시 `cart.clear()` + 5초 후 `/` redirect

## Verification (수동)

```bash
# Customer FE 실행 후:
# 1. 메뉴 화면에서 카드 → 상세 모달 → "장바구니 담기"
# 2. 우하단(중앙) Floating 버튼에 개수/총액 표시 확인
# 3. 클릭 → /cart 진입
# 4. 수량 +/− 클릭 → 총액 즉시 갱신
# 5. 페이지 새로고침 → 장바구니 유지 (localStorage 검증)
# 6. "비우기" 클릭 → confirm 후 빈 상태로 이동
# 7. localStorage.getItem('cart') 로 직접 확인 가능
```
