import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 실행 환경 설정 (U9).
 * 실제 테스트 코드는 Build & Test 단계에서 `e2e/` 하위에 작성한다.
 *
 * 전제: docker compose up 으로 customer-fe(3000) / admin-fe(3001) / backend(4000) 기동 후 실행.
 *   pnpm test:e2e
 *
 * 4개 환경(chromium / webkit / Mobile Chrome / Mobile Safari)에서 핵심 플로우 3~5개 커버.
 * 기본 baseURL 은 customer-fe(3000). admin 플로우는 절대경로(http://localhost:3001) 사용.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
