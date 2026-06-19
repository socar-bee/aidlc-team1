# U2 Auth — Functional Design + NFR + Code Generation (Combined)

**Unit**: U2 Auth (Admin + Table)
**Stories**: US-C-01~05 (5) + US-A-01~06 (6) = 11
**FR**: FR-CUS-01, FR-ADM-01
**의존**: U1 (Entity, Common, shared-types)

---

## Functional Design (요약)

### 1. Admin Login Flow
```
POST /auth/admin/login { storeCode, username, password }
  → StoreService.findByCode(storeCode) → store
  → AdminUserRepository.find(storeId, username) → admin
  → PasswordService.compare(password, admin.passwordHash)
  → JwtTokenService.signAdmin({ id, storeId, username }) → accessToken (16h)
  → 응답: { accessToken, expiresAt, user }
실패 시: 401 일관 메시지 ("로그인 정보를 확인하세요") — 매장/사용자/비번 어떤 것이 틀린지 노출 X
시도 로깅: storeCode/username/success/ip/timestamp → console JSON (잠금 없음, Q10=C)
```

### 2. Table Setup Flow
```
POST /auth/table/setup { tableNumber, password }  (Admin JWT 필요)
  @CurrentAdmin → admin.storeId
  → TableRepository.findOrCreate(storeId, tableNumber)
     - 존재하면 비밀번호 해시 갱신
     - 없으면 새로 생성 (passwordHash = bcrypt(password))
  → JwtTokenService.signTable({ tableId, storeId, tableNumber }) → tableToken (90d)
  → 응답: { tableToken, table: { id, tableNumber } }
```

### 3. Guards
- **JwtAdminGuard**: `Authorization: Bearer <token>` → verify HS256, payload type='admin' → request.admin 주입
- **TableTokenGuard**: 동일하나 type='table' → request.table 주입

### 4. Customer FE 자동 로그인 흐름 (FR-CUS-01)
```
앱 로드
  ├ localStorage 'table_token' 있음? 
  │    └ Yes → ping /menus (예: GET /menus 로 검증) → 200이면 메뉴 화면, 401이면 토큰 제거 → setup 화면
  │    └ No → setup 화면 (정보 안내)
```
**중요**: setup 화면은 Admin 권한이 필요한 엔드포인트를 호출 — 즉, Admin이 태블릿에서 직접 등록할 수 있도록 setup 화면이 Admin 로그인을 거치게 하거나(설계상 복잡), 또는 더 단순하게 **"태블릿 setup은 Admin FE에서 등록 → 토큰을 태블릿에 입력/QR" 방식**. PoC 단순화를 위해 **U2 단계에서는**: setup 화면이 storeCode + adminUsername + adminPassword + tableNumber + tablePassword 받아서 한 번에 admin 인증 + table 등록을 처리. 이는 PoC 단순화 — 후속에 분리 가능.

### 5. Admin FE 로그인 흐름 (FR-ADM-01)
```
/login 페이지 → 폼 입력 → useAdminLogin mutation
  → 성공: token + user → Zustand auth-store (persist localStorage)
  → /로 redirect (대시보드는 U8)
  → 실패: 401 메시지 표시
(dashboard) 레이아웃에서 토큰 검증 — 없으면 /login redirect, 16h 초과 만료면 logout
```

---

## NFR (요약)

| 항목 | 결정 |
|---|---|
| Password 해싱 | bcrypt cost 12 |
| JWT 알고리즘 | HS256 |
| JWT 만료 | Admin 16h / Table 90d (.env 환경변수) |
| Token 저장 | localStorage (Q9=B, Q11=B) — XSS risk 인지된 PoC 선택 |
| Rate limit | 미적용 (Q10=C) |
| 로그인 시도 잠금 | 미적용, 로깅만 |
| Validation | class-validator (storeCode/username min 1, password min 1) |

---

## Generation Steps

### Backend
- [x] Step 1: 추가 dependency 없음 (bcrypt, jsonwebtoken, class-validator 이미 U1 package.json)
- [x] Step 2: `auth/dto/` — admin-login.dto / setup-table.dto / index
- [x] Step 3: `store/services/store.service.ts` — findByCode + getCurrent
- [x] Step 4: `auth/services/password.service.ts` — bcrypt hash/compare
- [x] Step 5: `auth/services/jwt-token.service.ts` — signAdmin/Table + verifyAdmin/Table
- [x] Step 6: `auth/repositories/admin-user.repository.ts`, `table.repository.ts`
- [x] Step 7: `auth/services/auth.service.ts` — orchestration
- [x] Step 8: `auth/guards/jwt-admin.guard.ts`, `table-token.guard.ts`
- [x] Step 9: `auth/controllers/auth.controller.ts` — `POST /auth/admin/login`, `POST /auth/table/setup`
- [x] Step 10: `auth/auth.module.ts` 업데이트 — providers/controllers/exports
- [x] Step 11: `store/store.module.ts` 업데이트 — StoreService export

### Customer FE
- [x] Step 12: `src/lib/auth.ts` — localStorage helpers (getTableToken/setTableToken/clearTableToken)
- [x] Step 13: `src/lib/queries/auth.ts` — useTableSetup
- [x] Step 14: `src/app/setup/page.tsx` + `setup-form.tsx` (admin 자격 + 테이블 정보 입력)
- [x] Step 15: `src/app/page.tsx` 업데이트 — 토큰 검증 → setup 또는 placeholder

### Admin FE
- [x] Step 16: `src/stores/auth-store.ts` — Zustand persist
- [x] Step 17: `src/lib/queries/auth.ts` — useAdminLogin
- [x] Step 18: `src/app/login/page.tsx` + `login-form.tsx`
- [x] Step 19: `src/app/(dashboard)/layout.tsx` — auth guard
- [x] Step 20: `src/app/page.tsx` 업데이트 — auth 체크 후 redirect

### Docs
- [x] Step 21: `aidlc-docs/construction/u2-auth/code/code-summary.md`
