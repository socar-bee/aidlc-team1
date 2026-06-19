# U4 Menu Browse (Customer) — Code Summary

## 생성/수정 파일 (7개)

### Customer FE
- **Created** `src/lib/image-url.ts` — `toAbsoluteImageUrl()` helper (API_URL prefix)
- **Created** `src/lib/queries/menu.ts` — `useCategories`, `useMenusByCategory`
- **Created** `src/components/menu/category-tabs.tsx` — 가로 스크롤 탭 (sticky)
- **Created** `src/components/menu/menu-card.tsx` — 카드(이미지+이름+가격+설명)
- **Created** `src/components/menu/menu-detail-modal.tsx` — 바텀시트/모달 + ESC + AddToCart slot
- **Created** `src/components/menu/menu-screen.tsx` — 통합 메뉴 화면 (카테고리·메뉴·상세 조합)
- **Modified** `src/app/page.tsx` — 토큰 검증 후 MenuScreen 렌더

## Stage 결정

| Stage | 결정 |
|---|---|
| Functional Design | inline (categories sortOrder asc / 첫 카테고리 기본 선택 / 카드 터치 → 상세 모달) |
| NFR | inline (최소 touch 44×44, 가격 천단위 콤마, lazy 데이터 fetch) |
| Code Generation | ✅ |

## Stories 매핑

| Story | 위치 |
|---|---|
| US-C-06 메뉴 화면 기본 | `app/page.tsx` MenuScreen 렌더 |
| US-C-07 카테고리 탭 표시 | `category-tabs.tsx` (sortOrder asc) + 첫 카테고리 자동 선택 |
| US-C-08 카테고리 선택 시 필터링 | `menu-screen.tsx` `selectedId` 상태 + `useMenusByCategory` |
| US-C-09 메뉴 카드 (이름/가격/이미지/설명) | `menu-card.tsx` + 가격 `toLocaleString('ko-KR')` + placeholder |
| US-C-10 메뉴 상세 보기 | `menu-detail-modal.tsx` (Should — onAddToCart prop은 U5에서 연결) |

## API 연동

| Endpoint | Hook |
|---|---|
| `GET /categories` | `useCategories()` (staleTime 60s) |
| `GET /menus/by-category/:id` | `useMenusByCategory(id)` (staleTime 30s) |

> Backend는 U3에서 이미 public read로 노출됨 — 토큰 없이 호출 가능

## UI/UX 결정

- **카테고리 탭**: 가로 스크롤 + sticky top, 활성 탭 파란색 강조
- **메뉴 카드**: 그리드 (모바일 2열 / sm 3열 / lg 4열), aspect-square 이미지
- **이미지 없음**: placeholder "이미지 없음" 텍스트
- **상세 모달**: 모바일은 bottom sheet, 데스크탑은 가운데 모달, ESC + 배경 클릭으로 닫기
- **터치**: `min-h-touch` (44px) 적용 — 탭/카드/버튼 모두
- **빈 상태**: 카테고리 없음 / 메뉴 없음 별도 메시지

## 후속 연결 포인트 (U5/U6)

- `MenuDetailModal`의 `onAddToCart` prop → U5에서 cart store action 연결
- `MenuCard` 자체에 빠른 추가 버튼은 미구현 (상세 모달 경유 흐름 일관성)

## Verification (수동)

```bash
# Backend 기동 + 시드 데이터 (store/admin/category/menu) 필요
# Customer FE
pnpm dev:customer
# 브라우저: http://localhost:3000
# 1. 토큰 없으면 /setup 리다이렉트
# 2. setup 완료 후 / → 카테고리 탭 + 메뉴 그리드 표시
# 3. 카드 터치 → 상세 모달 (ESC/배경 클릭/X로 닫기)
```
