/**
 * E2E 골든 플로우 (대표 1) — Customer 주문.
 * setup(테이블 토큰) → 메뉴 → 장바구니 담기 → 체크아웃 → 주문 완료.
 *
 * 전제: 전체 스택 기동 + seed 완료.
 *   docker compose up -d --build
 *   docker compose exec backend sh -c "pnpm migration:run && pnpm seed"
 *   pnpm test:e2e
 *
 * seed 기본값: 매장 TEST / 관리자 admin / admin1234.
 * (테이블 비밀번호는 setup 시 임의 지정)
 */
import { test, expect } from '@playwright/test';

test('고객이 메뉴를 담아 주문하면 주문번호가 발급된다', async ({ page }) => {
  // 1) 테이블 셋업 → 테이블 토큰 발급
  await page.goto('/setup');
  await page.getByTestId('setup-store-code').fill('TEST');
  await page.getByTestId('setup-admin-username').fill('admin');
  await page.getByTestId('setup-admin-password').fill('admin1234');
  await page.getByTestId('setup-table-number').fill('1');
  await page.getByTestId('setup-table-password').fill('table1234');
  await page.getByTestId('setup-submit').click();

  // 2) 메뉴 화면 — 첫 메뉴 카드 클릭 → 상세 모달 → 담기
  await expect(page.getByTestId('menu-grid')).toBeVisible();
  await page.getByTestId('menu-grid').locator('[data-testid^="menu-card-"]').first().click();
  await expect(page.getByTestId('menu-detail-modal')).toBeVisible();
  await page.getByTestId('menu-detail-add-to-cart').click();

  // 3) 장바구니 → 체크아웃
  await page.getByTestId('floating-cart-button').click();
  await expect(page.getByTestId('cart-screen')).toBeVisible();
  await page.getByTestId('cart-checkout').click();

  // 4) 주문 확정 → 완료 화면 + 주문번호
  await expect(page.getByTestId('checkout-screen')).toBeVisible();
  await page.getByTestId('checkout-confirm').click();

  await expect(page.getByTestId('order-success')).toBeVisible();
  await expect(page.getByTestId('order-number')).not.toBeEmpty();
});
