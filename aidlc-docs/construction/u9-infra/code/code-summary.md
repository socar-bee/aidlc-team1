# U9 Infra & DevX — Code Summary

**Unit**: U9 Infra & DevX (Per-Unit 루프 마지막)
**설계 근거**: `aidlc-docs/construction/shared/shared-infrastructure.md`
**Stories**: 없음 (인프라 단위)

## 산출물

| 파일 | 유형 | 내용 |
|---|---|---|
| `docker-compose.yml` | Created | 프로덕션 4서비스(mysql/backend/customer-fe/admin-fe) + 2볼륨 + bridge net + healthcheck 기동순서 |
| `apps/backend/Dockerfile` | Created | Node20-alpine multi-stage(deps→build→runner), pnpm, shared-types+backend 빌드, `/var/lib/uploads` 볼륨, `node dist/main.js` |
| `apps/customer-fe/Dockerfile` | Created | Next standalone multi-stage, `NEXT_PUBLIC_API_URL` build-arg, :3000 |
| `apps/admin-fe/Dockerfile` | Created | 동일 패턴, :3001 |
| `.dockerignore` | Created | node_modules/.next/dist/.env/aidlc-docs 등 제외 |
| `.env.example` (루트) | Created | MySQL + JWT_SECRET + NEXT_PUBLIC_API_URL + TZ 통합 |
| `playwright.config.ts` | Created | E2E 실행환경, 4 프로젝트(chromium/webkit/Mobile Chrome/Mobile Safari), `e2e/` testDir |
| `scripts/backup.sh` / `restore.sh` | Created | named volume(mysql-data/image-uploads) tar 백업·복원 |
| `README.md` | Created | 실행/seed/테스트/백업/환경변수 가이드 (기존 빈 파일 → 작성) |
| `package.json` (루트) | Modified | `test`/`test:e2e`/`stack:up`/`stack:down`/`stack:reset` 스크립트 + `@playwright/test` devDep |
| `apps/customer-fe/.env.example` | Modified | `NEXT_PUBLIC_SSE_URL` 제거 (U8 폴링 전환 정합화) |
| `apps/admin-fe/.env.example` | Modified | 동일 |

## 정합성 조치 (U8 SSE→폴링)

- per-app `.env.example` 의 `NEXT_PUBLIC_SSE_URL` / `/sse/stream` 잔재 제거.
- `docker-compose.yml` 에는 SSE 환경변수 미포함 (폴링 기준).

## 검증 결과 (실측)

| 항목 | 결과 |
|---|---|
| `docker compose -f docker-compose.yml config -q` | ✅ 유효 |
| `docker compose -f docker-compose.dev.yml config -q` | ✅ 유효 (version 경고는 기존 dev 파일) |
| `bash -n scripts/backup.sh` / `restore.sh` | ✅ 문법 OK |
| `package.json` JSON 파싱 | ✅ 유효 |

## 미수행 / 다음 단계 위임

- **테스트 코드 작성·실행은 Build & Test 단계** (Q4=B). U9 는 playwright 실행환경(config)까지만.
- Docker 이미지 실제 빌드/기동(`docker compose up --build`)은 환경 의존이라 미수행 — README 절차 제공.
- `@playwright/test` 는 `pnpm install` 시 설치 (잠금파일 갱신은 Build & Test에서).

## DoD

| 기준 | 상태 |
|---|---|
| clone → install → `docker compose up` → 3서비스 접근 가이드 | ✅ (compose 유효 + README) |
| seed 후 Admin 로그인 + Customer 메뉴 조회 절차 | ✅ (seed 기존 + README) |
| lint/type-check 통과 경로 | ✅ (스크립트 제공) |
