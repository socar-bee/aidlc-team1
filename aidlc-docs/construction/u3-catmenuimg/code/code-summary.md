# U3 Category & Menu & Image — Code Summary

## 생성/수정 파일

### Backend (Created/Modified)
- **Created** `category/dto/` 4 (create / update / reorder / index)
- **Created** `category/repositories/category.repository.ts`
- **Created** `category/services/category.service.ts`
- **Created** `category/controllers/category.controller.ts`
- **Modified** `category/category.module.ts` — controller/service/repository, AuthModule + StoreModule import
- **Created** `menu/dto/` 4 (create / update / reorder / index)
- **Created** `menu/repositories/menu.repository.ts`
- **Created** `menu/services/menu.service.ts`
- **Created** `menu/controllers/menu.controller.ts`
- **Modified** `menu/menu.module.ts` — controller/service/repository, CategoryModule import
- **Created** `image/multer.config.ts` — diskStorage + UUID 파일명 + MIME 검증 + 5MB 제한
- **Created** `image/services/image.service.ts`
- **Created** `image/controllers/image.controller.ts`
- **Created** `image/image.module.ts`
- **Modified** `app.module.ts` — ImageModule + ServeStaticModule (`/static/uploads/*`) 추가

### Admin FE (Created/Modified)
- **Created** `lib/auth-fetch.ts` — apiFetch + authStore token 자동 부착
- **Created** `lib/queries/category.ts` — useCategories/Create/Update/Delete/Reorder
- **Created** `lib/queries/menu.ts` — useMenus/Create/Update/Delete/Reorder
- **Created** `lib/queries/image.ts` — useUploadImage + toAbsoluteImageUrl helper
- **Created** `components/shared/sidebar.tsx` — 좌측 네비
- **Modified** `app/(dashboard)/layout.tsx` — Sidebar 통합 + ready gate
- **Created** `app/(dashboard)/categories/page.tsx` — 카테고리 CRUD 화면
- **Created** `app/(dashboard)/menus/page.tsx` — 메뉴 CRUD 화면 + 이미지 업로드

### 문서
- **Created** `aidlc-docs/construction/u3-catmenuimg/code/code-summary.md`

## REST 엔드포인트 추가

| Method | Path | Guard | 비고 |
|---|---|---|---|
| GET | `/categories` | Public | sortOrder asc |
| POST | `/categories` | JwtAdmin | sortOrder 자동 |
| PATCH | `/categories/reorder` | JwtAdmin | orderedIds[] |
| PATCH | `/categories/:id` | JwtAdmin | |
| DELETE | `/categories/:id` | JwtAdmin | 메뉴 연결 시 409 |
| GET | `/menus?categoryId=` | Public | isActive=true 필터 |
| GET | `/menus/by-category/:id` | Public | |
| POST | `/menus` | JwtAdmin | sortOrder 자동 |
| PATCH | `/menus/reorder` | JwtAdmin | categoryId + orderedIds[] |
| PATCH | `/menus/:id` | JwtAdmin | |
| DELETE | `/menus/:id` | JwtAdmin | |
| POST | `/images/upload` | JwtAdmin | multipart `file` |
| GET | `/static/uploads/*` | Public | 정적 서빙 |

## 비즈니스 룰

- 카테고리 삭제: 메뉴 ≥ 1 연결 시 **409 Conflict** "연결된 메뉴를 먼저 정리하세요"
- 카테고리/메뉴 생성: sortOrder 자동 (MAX+1)
- 메뉴 가격: `> 0`, decimal(10,2) — DTO에서는 number, DB는 string으로 저장 후 응답 시 Number 변환
- 카테고리명 중복: store 내 unique (DB 제약 + Service ConflictException 사전 검증)
- 메뉴 categoryId 변경 시 같은 store의 categoryId 인지 검증

## 이미지 업로드 제약 (NFR)

- MIME: `image/jpeg`, `image/png`, `image/webp`
- 확장자: `.jpg`, `.jpeg`, `.png`, `.webp`
- 크기: ≤ **5MB**
- 파일명: `{uuid}.{ext}` (path traversal 방지)
- 저장: `IMAGE_UPLOAD_DIR` env (기본 `/var/lib/uploads`), 디렉토리 자동 생성
- 정적 서빙: `/static/uploads/{filename}` (캐시 7d)
- 리사이징/최적화 없음 (constraints 준수)

## Stories 매핑

| Story | 위치 |
|---|---|
| US-A-23 메뉴 목록 카테고리별 | menu.controller `GET /menus` + admin-fe menus page |
| US-A-24 메뉴 등록 | menu.service.create + admin-fe form |
| US-A-25 메뉴 수정 | menu.service.update + admin-fe form (edit) |
| US-A-26 메뉴 삭제 | menu.service.delete + confirm popup |
| US-A-27 메뉴 sortOrder 조정 | menu.service.reorder (드래그 UI는 향후) |
| US-A-28 카테고리 목록 | category.controller GET + admin-fe page |
| US-A-29 카테고리 생성 | category.service.create |
| US-A-30 카테고리 수정 | category.service.update + edit form |
| US-A-31 카테고리 삭제 (차단) | category.service.delete + menu count 체크 |
| US-A-32 카테고리 sortOrder | category.service.reorder |
| US-A-33 이미지 업로드 | image.controller + Multer + 검증 |
| US-A-34 로컬 저장 + URL | image.service.buildUrl + ServeStatic |

## Stage 결정 (이번 Unit)

| Stage | 결정 | 메모 |
|---|---|---|
| Functional Design | **EXECUTE (inline)** | plan에 5 섹션 (Category / Menu / Image / 권한 / 정렬 규칙) |
| NFR Requirements | **EXECUTE (inline)** | 파일 크기 / MIME / path traversal / decimal precision |
| NFR Design | **EXECUTE (inline)** | Multer diskStorage + UUID + ServeStatic 캐시 |
| Infrastructure Design | DONE (shared) | Image volume 이미 정의 |
| Code Generation | EXECUTE ✅ | |

## 단순화 / 후속

- 카테고리 / 메뉴 **드래그 앤 드롭 reorder UI** 미구현 — API는 있음. 후속 UX 작업 시 추가
- 이미지 삭제(unlink) 미구현 — 메뉴 삭제 시 orphan file 가능. constraints 허용
- DB transaction 미사용(단순 CRUD) — 동시성 충돌 가능성 낮은 PoC 가정

## Verification (수동)

```bash
# 1. Admin 로그인 후 token 확보
TOKEN=$(curl -s -X POST http://localhost:4000/auth/admin/login \
  -H 'content-type: application/json' \
  -d '{"storeCode":"TEST","username":"admin","password":"..."}' | jq -r .accessToken)

# 2. 카테고리 생성
curl -X POST http://localhost:4000/categories \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"name":"음료"}'

# 3. 이미지 업로드
curl -X POST http://localhost:4000/images/upload \
  -H "authorization: Bearer $TOKEN" \
  -F file=@/path/to/test.jpg

# 4. 메뉴 생성
curl -X POST http://localhost:4000/menus \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"categoryId":1,"name":"아메리카노","price":4500,"imageUrl":"/static/uploads/...jpg"}'

# 5. 공개 조회
curl http://localhost:4000/menus
curl http://localhost:4000/categories

# 6. Admin FE 화면
# http://localhost:3001/categories
# http://localhost:3001/menus
```
