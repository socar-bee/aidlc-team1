# Unit Test Execution

**도구**: Jest + ts-jest + @golevelup/ts-jest (Pure Mock, DB 연결 없음)
**위치**: `apps/backend/src/**/*.spec.ts`
**범위(G3)**: 핵심 도메인 로직 — 주문 합계 / 세션 상태 전이 / 인증 토큰 발급

## 실행

```bash
pnpm --filter @table-order/backend test
# 또는 루트: pnpm test
```

## 작성된 테스트 (핵심 슬라이스)

| Spec | 커버 |
|---|---|
| `auth/services/jwt-token.service.spec.ts` | admin/table 토큰 발급·검증 라운드트립, 타입 불일치·변조 거부 |
| `auth/services/password.service.spec.ts` | bcrypt 해시/compare 성공·실패 |
| `session/services/session.service.spec.ts` | findActive 매핑, end() 활성없음 404 / endedAt 기록 |
| `order/services/order.service.spec.ts` | 주문 합계(단가×수량), 비활성 메뉴 BadRequest |

## 결과 (실측)

- **Test Suites**: 4 passed / 4
- **Tests**: 13 passed / 13
- **Time**: ~5s
- `pnpm --filter @table-order/backend type-check` ✅

## 실패 시

1. `pnpm install` 재실행 (테스트 의존성 확인)
2. `apps/backend/test/jest-setup-env.ts` 의 `JWT_SECRET` 주입 확인
3. 개별 실행: `pnpm --filter @table-order/backend test -- order.service`

## 후속 (미작성 — 풀 스위트 확장 시)

- category / menu / table / image 서비스 단위 테스트
- FE(Jest + React Testing Library): cart store, viewModel 훅
