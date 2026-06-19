# U3 Category & Menu & Image — Plan (Functional + NFR + Code Gen 통합)

**Unit**: U3
**Stories**: US-A-23~34 (12)
**FR**: FR-ADM-04, FR-ADM-05, FR-ADM-06
**의존**: U1, U2

## Functional Design (요약)

### Category
- list / create / update / delete / reorder
- delete 시 메뉴 1개라도 연결되어 있으면 **409 Conflict** ("연결된 메뉴를 먼저 정리하세요")
- create 시 sortOrder = MAX(sortOrder)+1 자동 부여
- 이름 unique per store (DB 제약)

### Menu
- list (전체 또는 categoryId 필터) / create / update / delete / reorder (categoryId 내부)
- 가격 > 0 검증 (DTO + DB)
- imageUrl 선택 — Image upload 후 URL 받아 첨부
- 카테고리 변경 가능

### Image
- multipart/form-data + Multer (memory or disk)
- 허용: image/jpeg, image/png, image/webp
- 최대 5MB
- 파일명: `{uuid}.{ext}` — 충돌 방지
- 저장: `process.env.IMAGE_UPLOAD_DIR` (기본 `/var/lib/uploads`)
- 응답: `{ url: '/static/uploads/{filename}', filename }`
- `ServeStaticModule`로 `/static/uploads/*` 정적 서빙
- 리사이징 / 최적화 없음 (constraints)

### 권한 / Public Read
- 모든 write 엔드포인트: JwtAdminGuard
- read 엔드포인트 (`GET /categories`, `GET /menus`, `GET /menus/by-category/:id`): **공개** — Customer가 토큰 없어도 메뉴 조회 가능 (US-C-06~10에서 사용)

## NFR (요약)
- 파일 크기 제한 (5MB), MIME 검증
- 이미지 파일명 path traversal 방지 (UUID 생성)
- 메뉴 가격 BigNumber 회피: decimal 문자열로 관리, FE에는 number로 응답 (PoC 안전 범위)

## 생성 파일

### Backend
- [x] Category DTO 5 + Service + Repository + Controller + Module 업데이트
- [x] Menu DTO 4 + Service + Repository + Controller + Module 업데이트
- [x] Image Service + Controller + Module + multer config
- [x] app.module에 ImageModule + ServeStaticModule 추가

### Admin FE
- [x] queries: useCategories/Create/Update/Delete/Reorder + useMenus/Create/Update/Delete/Reorder + useUploadImage
- [x] (dashboard)/categories/page + components
- [x] (dashboard)/menus/page + components (FormDialog + Image upload)
- [x] Sidebar (대시보드 layout 업그레이드)

### Docs
- [x] code-summary.md
