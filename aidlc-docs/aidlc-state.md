# AI-DLC State Tracking

## Project Information
- **Project Name**: 테이블오더 서비스 (Table Order Service)
- **Project Type**: Greenfield
- **Start Date**: 2026-06-19T10:35:00+09:00
- **Current Stage**: INCEPTION - Requirements Analysis

## Workspace State
- **Existing Code**: No
- **Reverse Engineering Needed**: No
- **Workspace Root**: /Users/admin/Desktop/aidlc-modu
- **Rule Details Directory**: .aws-aidlc-rule-details/

## Code Location Rules
- **Application Code**: Workspace root (NEVER in aidlc-docs/)
- **Documentation**: aidlc-docs/ only
- **Structure patterns**: See code-generation.md Critical Rules

## Source Inputs
- requirements/table-order-requirements.md (사용자 제공 요구사항)
- requirements/constraints.md (구현 예외사항)

## Stage Progress
### 🔵 INCEPTION PHASE
- [x] Workspace Detection
- [ ] Reverse Engineering (N/A — Greenfield)
- [x] Requirements Analysis
- [x] User Stories (Customer 25 + Admin 34 + System 5 = 64 stories)
- [x] Workflow Planning
- [x] Application Design (5 artifacts: components/methods/services/dependency/integrated)
- [x] Units Generation (9 units, 3 artifacts: unit-of-work/dependency/story-map)

### 🟢 CONSTRUCTION PHASE
- [x] Infrastructure Design (one-shot, minimal) ✅
- **Per-Unit Progress**:
  - [x] **U1 Foundation** — Code Generation ✅ (25 steps)
  - [x] **U2 Auth** — AuthService + Guards + 2 FE 인증 화면 ✅
  - [x] **U3 Category & Menu & Image** — CRUD + Multer + Admin FE 화면 ✅
  - [x] **U4 Menu Browse** — 카테고리 탭 + 메뉴 카드 + 상세 모달 ✅
  - [x] **U5 Cart** — Zustand persist + 장바구니 화면 + FloatingCartButton ✅
  - [x] **U6 Order + Session** — 주문 트랜잭션(세션 자동 시작 + 스냅샷) + checkout/성공 화면 ✅
  - [x] **U7 Order History** — 현재/과거 분리(endedAt) + 세션 종료 + Customer/Admin 내역 화면 ✅
  - [x] **U8 Polling Dashboard** — 2초 폴링 대시보드 + 상태변경(비관적 락)/soft-delete + 테이블 등록 ✅ (SSE→폴링 설계 변경)
  - [x] **U9 Infra & DevX** — prod docker-compose + 3 Dockerfile + .dockerignore + root .env.example + playwright.config + backup/restore + README ✅ (SSE→폴링 정합화)
- [x] **Build and Test** — 핵심 슬라이스 + 지침문서 ✅
  - Unit(Jest Pure Mock): 13 passed/13 (주문합계·세션전이·인증토큰·bcrypt), backend type-check ✅
  - Integration(Supertest+Testcontainers): Auth 로그인 대표 1 작성(Docker 필요·미구동)
  - E2E(Playwright 4환경): Customer 골든플로우 대표 1 작성(스택 필요·미구동)
  - 지침문서 6종 + summary, lint config 부재는 선제 이슈(범위 밖)

### 🟡 OPERATIONS PHASE
- [ ] Operations (Placeholder)

## Extension Configuration
| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | No | Requirements Analysis (Q16=B) |
| Resiliency Baseline | No | Requirements Analysis (Q17=B) |
| Property-Based Testing | No | Requirements Analysis (Q18=C) |

## Key Technical Decisions (from Requirements Analysis)
- **Scope**: 단일 매장 전용
- **Deployment**: 로컬 / Docker Compose
- **Stack**: Next.js 14 (TS) + NestJS (TS) + MySQL 8
- **Realtime**: SSE
- **Auth**: JWT 16h (localStorage) / Table Token (localStorage)
- **Image**: 서버 로컬 디스크 업로드 (multer)
- **i18n**: 한국어, 구조만 사전 적용 (next-intl)
- **Test**: Unit + Integration + E2E (Playwright)
