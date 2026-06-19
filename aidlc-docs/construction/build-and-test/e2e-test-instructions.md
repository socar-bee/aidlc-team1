# E2E Test Instructions

**도구**: Playwright (4 환경: chromium / webkit / Mobile Chrome / Mobile Safari)
**설정**: `playwright.config.ts` (U9 산출), `testDir: e2e/`
**전제**: 전체 스택 기동 + seed

## 준비 & 실행

```bash
# 1) 스택 기동
docker compose up -d --build
docker compose exec backend sh -c "pnpm migration:run && pnpm seed"

# 2) Playwright 브라우저 설치 (최초 1회)
pnpm exec playwright install

# 3) 실행
pnpm test:e2e
# 단일 환경: pnpm test:e2e --project=chromium
```

## 작성된 플로우 (대표 1 — 골든 플로우)

### `e2e/customer-order.spec.ts` — Customer 주문

setup(테이블 토큰) → 메뉴 카드 → 상세 모달 담기 → 장바구니 → 체크아웃 → **주문번호 발급**.

selector 는 FE `data-testid` 기반 (`setup-submit`, `menu-grid`, `menu-detail-add-to-cart`, `floating-cart-button`, `cart-checkout`, `checkout-confirm`, `order-success`, `order-number`).

## 상태 — 실측 ✅

> **구동 확인 완료** (전체 스택 + seed 실제 기동, OrbStack): **4 passed / 4** — chromium / webkit / Mobile Chrome / Mobile Safari 전 환경 골든플로우 통과 (~10s).
>
> 비고: webkit 모바일은 controlled-input 상태반영 레이스 회피 위해 제출 전 `await expect(submit).toBeEnabled()` 대기 추가.

## 후속 (G5 풀 커버 — 3~5 플로우)

| 플로우 | 대상 |
|---|---|
| Admin 실시간 모니터링 | 로그인 → 대시보드 2초 폴링 → 신규 주문 강조 |
| 세션 종료 | Admin "이용 완료" → 현재 주문 비움 |
| 주문 상태 전이 | PENDING→PREPARING→COMPLETED, 역방향 차단 |
