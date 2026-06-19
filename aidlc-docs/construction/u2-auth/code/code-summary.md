# U2 Auth — Code Summary

## 생성/수정 파일

### Backend (modified + new)
- **Modified** `apps/backend/src/store/store.module.ts` — StoreService provider/export 추가
- **Created** `apps/backend/src/store/services/store.service.ts`
- **Created** `apps/backend/src/auth/dto/admin-login.dto.ts`
- **Created** `apps/backend/src/auth/dto/setup-table.dto.ts`
- **Created** `apps/backend/src/auth/dto/index.ts`
- **Created** `apps/backend/src/auth/services/password.service.ts` (bcrypt cost 12)
- **Created** `apps/backend/src/auth/services/jwt-token.service.ts` (HS256, type='admin'/'table' 구분)
- **Created** `apps/backend/src/auth/services/auth.service.ts`
- **Created** `apps/backend/src/auth/repositories/admin-user.repository.ts`
- **Created** `apps/backend/src/auth/repositories/table.repository.ts`
- **Created** `apps/backend/src/auth/guards/jwt-admin.guard.ts`
- **Created** `apps/backend/src/auth/guards/table-token.guard.ts`
- **Created** `apps/backend/src/auth/controllers/auth.controller.ts`
- **Modified** `apps/backend/src/auth/auth.module.ts` — providers/controllers/exports 추가

### Customer FE
- **Created** `apps/customer-fe/src/lib/auth.ts` — localStorage helpers
- **Created** `apps/customer-fe/src/lib/queries/auth.ts` — useCombinedTableSetup (admin 인증 + table setup 묶음)
- **Created** `apps/customer-fe/src/app/setup/page.tsx`
- **Created** `apps/customer-fe/src/app/setup/setup-form.tsx`
- **Modified** `apps/customer-fe/src/app/page.tsx` — 토큰 없으면 /setup 리다이렉트

### Admin FE
- **Created** `apps/admin-fe/src/stores/auth-store.ts` — Zustand persist (`admin_token`)
- **Created** `apps/admin-fe/src/lib/queries/auth.ts` — useAdminLogin
- **Created** `apps/admin-fe/src/app/login/page.tsx`
- **Created** `apps/admin-fe/src/app/login/login-form.tsx`
- **Created** `apps/admin-fe/src/app/(dashboard)/layout.tsx` — auth guard
- **Created** `apps/admin-fe/src/app/(dashboard)/page.tsx` — 임시 대시보드 (U8에서 교체)
- **Modified** `apps/admin-fe/src/app/page.tsx` — 인증 여부에 따라 redirect

## REST 엔드포인트

| Method | Path | Guard | Body | Response |
|---|---|---|---|---|
| POST | /auth/admin/login | — | AdminLoginDto | AdminLoginResponse |
| POST | /auth/table/setup | JwtAdmin | SetupTableDto | TableSetupResponse |

## 보안 적용

- Password: bcrypt cost **12**
- JWT: HS256, Admin **16h**, Table **90d**
- 로그인 실패 메시지 통일 ("로그인 정보를 확인하세요")
- 로그인 시도는 구조화 JSON 로그 (잠금 없음, Q10=C)

## Stories 구현 매핑

| Story | 위치 |
|---|---|
| US-C-01 | setup-form.tsx |
| US-C-02 | useCombinedTableSetup + AuthService.adminLogin |
| US-C-03 | setup-form.tsx onSubmit setTableToken |
| US-C-04 | customer-fe/src/app/page.tsx useEffect 검증 |
| US-C-05 | api-client ApiError 401 → 후속 Unit에서 자동 redirect 구현 (현재는 호출자 책임) |
| US-A-01 | admin-fe login-form.tsx |
| US-A-02 | AuthService.adminLogin + JwtTokenService.signAdmin |
| US-A-03 | auth-store.ts persist |
| US-A-04 | Zustand persist + (dashboard)/layout 검증 |
| US-A-05 | auth-store.isAuthenticated() expiresAt 검증 |
| US-A-06 | AuthService.logLoginAttempt |

## 의존성 확인

- `bcrypt`, `jsonwebtoken`, `class-validator`, `class-transformer` 이미 U1 backend package.json에 포함
- FE는 `zustand`, `@tanstack/react-query` 이미 포함
- `pnpm install` 후 사용 가능

## 후속 Unit 활용 가이드

- `JwtAdminGuard`, `TableTokenGuard`는 `AuthModule`에서 export. 다른 모듈에서 `imports: [AuthModule]` 후 `@UseGuards(...)` 사용 가능
- `AuthModule`도 `TableRepository` export — U6/U7/U8에서 테이블 데이터 조회에 사용 가능
- Customer FE의 `getTableToken()`은 다른 query hook 의 `getToken` 콜백으로 전달
- Admin FE는 `useAuthStore.getState().token` 또는 selector로 토큰 접근

## Verification (수동)

```bash
# 1. seed로 store + admin + 데이터 넣기 (U9 seed 후 또는 SQL 직접)
# 임시: DB에 직접 row 삽입
INSERT INTO store (name, code) VALUES ('테스트매장', 'TEST');
# bcrypt 해시 생성 후 admin_user 삽입

# 2. Admin login
curl -X POST http://localhost:4000/auth/admin/login \
  -H 'content-type: application/json' \
  -d '{"storeCode":"TEST","username":"admin","password":"..."}'

# 3. Table setup (위 응답의 accessToken 사용)
curl -X POST http://localhost:4000/auth/table/setup \
  -H 'authorization: Bearer <admin_token>' \
  -H 'content-type: application/json' \
  -d '{"tableNumber":1,"password":"pw1234"}'

# 4. FE
# admin-fe :3001 → /login → 로그인 후 / 로 이동
# customer-fe :3000 → 토큰 없음 → /setup → 등록 → / 로 이동
```
