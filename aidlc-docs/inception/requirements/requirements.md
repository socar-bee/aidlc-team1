# 테이블오더 서비스 요구사항 정의서 (AI-DLC Requirements)

**프로젝트명**: 테이블오더 서비스 (Table Order Service)
**작성일**: 2026-06-19
**상태**: Pending Approval
**소스**: `requirements/table-order-requirements.md`, `requirements/constraints.md`, `requirement-verification-questions.md`

---

## 1. Intent Analysis Summary

| 항목 | 내용 |
|---|---|
| User Request | "테이블오더 서비스를 구축하고 싶습니다" + 상세 기능 명세 + 제약사항 |
| Request Type | **New Project (Greenfield)** |
| Scope Estimate | **System-wide** — Customer FE + Admin FE + Backend API + DB + 실시간 스트리밍 |
| Complexity Estimate | **Moderate~Complex** — 실시간 SSE, 세션 라이프사이클, 다수 페르소나 |
| Requirements Depth | **Standard** |

### 1.1 Problem Statement
디지털 주문 시스템을 통해 **고객**에게는 대기 없는 주문 경험을, **매장 운영자**에게는 효율적 실시간 주문 관리 환경을 제공하는 테이블오더 플랫폼.

### 1.2 Stakeholders
| 페르소나 | 역할 | 주요 인터페이스 |
|---|---|---|
| **고객(Customer)** | 테이블에서 메뉴 탐색·주문 | Customer FE (테이블 태블릿 웹UI) |
| **매장 운영자(Admin)** | 주문 모니터링·테이블 관리·메뉴 관리 | Admin FE (PC/태블릿 웹UI) |

---

## 2. Functional Requirements (기능 요구사항)

각 요구사항은 `FR-{영역}-{번호}` 형식으로 식별합니다. 영역: CUS(Customer), ADM(Admin), SYS(System).

### 2.1 고객용 기능 (Customer)

#### FR-CUS-01: 테이블 태블릿 자동 로그인 및 세션 관리
- **목적**: 별도 로그인 절차 없이 즉시 주문 가능
- **요구사항**:
  - 초기 설정(관리자 1회 수행): 매장 식별자 / 테이블 번호 / 테이블 비밀번호 입력 후 서버 인증
  - 인증 성공 시 **테이블 토큰(long-lived session token)** 발급, `localStorage`에 저장 (테이블 비밀번호 평문 저장 X)
  - 다음 접근부터 토큰으로 자동 로그인
  - 토큰 만료 시 재로그인 화면

#### FR-CUS-02: 메뉴 조회 및 탐색
- **목적**: 고객이 매장 메뉴를 쉽게 탐색·선택
- **요구사항**:
  - 메뉴 화면이 기본(랜딩) 화면
  - **카테고리별** 메뉴 분류 및 표시, 카테고리 간 빠른 이동
  - 메뉴 상세: 메뉴명 / 가격 / 설명 / 이미지
  - 카드 형태 레이아웃, 터치 친화 버튼(≥ 44×44px), 명확한 시각적 계층

#### FR-CUS-03: 장바구니 관리
- **목적**: 주문 전 임시 저장·수정
- **요구사항**:
  - 메뉴 추가/삭제, 수량 증감
  - 총 금액 실시간 계산
  - 장바구니 비우기
  - `localStorage` 기반 클라이언트 임시 저장 (페이지 새로고침 시 유지)
  - 서버 전송은 **주문 확정 시점에만**

#### FR-CUS-04: 주문 생성
- **목적**: 장바구니 → 실제 주문 전환
- **요구사항**:
  - 주문 내역 최종 확인 화면
  - 주문 확정 버튼
  - **성공 플로우**: 주문 번호 표시 → 5초 후 메뉴 화면으로 자동 리다이렉트, 장바구니 자동 비우기
  - **실패 플로우**: 에러 메시지 표시, 장바구니 유지
  - 주문 페이로드: 매장 식별 / 테이블 식별 / 메뉴 목록(메뉴명·수량·단가) / 총 금액 / 세션 ID
  - **세션 첫 주문 시**: 새 테이블 세션 자동 시작(서버)

#### FR-CUS-05: 주문 내역 조회
- **목적**: 현재 테이블 세션의 주문 이력 확인
- **요구사항**:
  - 주문 시간 역순 정렬
  - 표시 항목: 주문 번호 / 주문 시각 / 메뉴 및 수량 / 금액 / 상태(대기중/준비중/완료)
  - **현재 테이블 세션 주문만** 노출 (이전 세션·이용 완료 처리된 주문 제외)
  - 페이지네이션 또는 무한 스크롤
  - (선택) 폴링 기반 상태 주기적 갱신 (2초 주기)

### 2.2 관리자용 기능 (Admin)

#### FR-ADM-01: 매장 인증
- **요구사항**:
  - 입력: 매장 식별자 / 사용자명 / 비밀번호
  - **JWT 토큰 기반 인증**, 16시간 만료
  - 토큰 `localStorage` 저장 (브라우저 새로고침 시 세션 유지)
  - 만료 시 자동 로그아웃 → 로그인 화면
  - 비밀번호 **bcrypt 해싱** 저장
  - 로그인 시도 횟수는 **로깅만**(잠금 정책 없음)

#### FR-ADM-02: 실시간 주문 모니터링
- **요구사항**:
  - **폴링(2초 주기)** 기반 주기적 갱신 (React Query `refetchInterval`)
  - **그리드/대시보드 레이아웃**: 테이블별 카드
  - 카드 내용: 테이블 번호 / 총 주문액 / 최신 주문 N개 미리보기(메뉴명·수량 축약)
  - 신규 주문 시각적 강조(색상 변경 또는 애니메이션)
  - 카드 클릭 시 해당 테이블 주문의 전체 메뉴 상세 표시
  - 주문 상태 변경: `대기중 → 준비중 → 완료`
  - 테이블별 필터링
  - **2초 이내** 신규 주문 표시

#### FR-ADM-03: 테이블 관리

**3.1 테이블 태블릿 초기 설정**
- 테이블 번호 + 테이블 비밀번호 설정
- 16시간 테이블 세션 생성(개념적 토큰 만료 기준)
- 설정 정보 저장 + 자동 로그인 활성화

**3.2 주문 삭제 (직권 수정)**
- 주문 삭제 버튼 + 확인 팝업
- 주문 상태를 **`CANCELED` (soft-delete)** 로 전환 (감사·재계산 가능)
- 테이블 총 주문액 자동 재계산
- 성공/실패 피드백

**3.3 테이블 세션 처리 (이용 완료)**
- 테이블 세션 종료 버튼 + 확인 팝업
- 종료 시: 해당 세션 주문 전체를 과거 이력으로 이동(논리적), 현재 주문 목록 및 총 주문액 0으로 리셋
- 새 고객이 이전 주문 흔적 없이 시작 가능
- 세션 시작은 명시적 액션 불필요 — **다음 첫 주문이 자동으로 새 세션 트리거**

**3.4 과거 주문 내역 조회**
- "과거 내역" 버튼
- 테이블별 과거 주문 목록 (시간 역순)
- 항목: 주문 번호 / 시각 / 메뉴 / 금액 / 매장 이용 완료 시각
- 날짜 필터링
- "닫기" 버튼으로 대시보드 복귀

#### FR-ADM-04: 메뉴 관리
- **메뉴 CRUD**: 등록 / 수정 / 삭제 / 조회
- 메뉴 속성: 메뉴명 / 가격 / 설명 / 카테고리 / 이미지(서버 업로드)
- 카테고리별 조회
- **메뉴 노출 순서 조정** (카테고리 내부 메뉴 순서, `sortOrder` 기반 드래그 또는 명시 입력)
- 데이터 검증: 필수 필드 / 가격 범위(> 0)

#### FR-ADM-05: 카테고리 관리
- **카테고리 마스터 CRUD**: 카테고리 생성 / 수정 / 삭제
- 속성: 카테고리명 / `sortOrder`(고객용 화면 노출 순서)
- 메뉴가 연결된 카테고리는 삭제 차단 (또는 확인 후 차단)

#### FR-ADM-06: 메뉴 이미지 업로드
- 관리자가 이미지 파일 업로드
- 서버 **로컬 디스크/볼륨**에 원본 그대로 저장 (리사이징·최적화 미수행 — constraints 준수)
- 업로드 후 정적 서빙 경로 URL 반환

### 2.3 시스템 기능 (System)

#### FR-SYS-01: 테이블 세션 라이프사이클
- 세션 시작 트리거: 테이블의 **첫 주문 생성** 시 자동 생성
- 세션 종료 트리거: 관리자의 "이용 완료" 처리
- 세션 ID로 주문 그룹화
- 세션 종료 후 새 주문은 새 세션 생성

#### FR-SYS-02: 주문 이력 보존
- 세션 종료 시점에 주문이 "과거 이력"으로 논리 전환(별도 테이블 이동 또는 `completedAt` 필드 세팅)
- 과거 주문은 통계·감사 목적으로 유지

#### FR-SYS-03: 주기적 갱신 (폴링)
- 푸시 채널 없음 — 클라이언트가 **2초 주기 폴링**으로 최신 상태 조회
- 대상: Admin 대시보드 요약(`GET /tables/summary`), 테이블 상세(`GET /tables/:id/current-orders`), Customer 현재 주문(`GET /orders/current`)
- 별도 이벤트 페이로드/구독 불필요 — 기존 REST 조회 재사용
- (설계 변경: SSE 푸시 → 폴링 다운그레이드. 단순성/운영 부담 감소 우선. 이력: U8 GATE 설계 변경)

---

## 3. Non-Functional Requirements (비기능 요구사항)

### 3.1 성능 (Performance)

| ID | 요구사항 | 목표 |
|---|---|---|
| NFR-PERF-01 | 신규 주문 → 관리자 화면 표시 | **≤ 2초** (폴링 주기 = 2초) |
| NFR-PERF-02 | 메뉴 조회 API 응답 | **≤ 500ms** (p95) |
| NFR-PERF-03 | 주문 생성 API 응답 | **≤ 1초** (p95) |
| NFR-PERF-04 | 동시 폴링 클라이언트 | 매장당 ≥ **5 클라이언트** |
| NFR-PERF-05 | 주문 처리 throughput | 매장당 ≥ **50 orders/min** |

### 3.2 확장성 (Scalability)
| ID | 요구사항 |
|---|---|
| NFR-SCAL-01 | 단일 매장 운영 가정, 멀티 매장 확장은 후속 (코드 구조상 매장 식별자 기준 분리만) |
| NFR-SCAL-02 | 테이블 수: ≤ 50 (MVP 가정) |
| NFR-SCAL-03 | 메뉴 수: ≤ 200 |

### 3.3 보안 (Security) — MVP/PoC 수준
| ID | 요구사항 |
|---|---|
| NFR-SEC-01 | 관리자 비밀번호 bcrypt 해싱 (cost ≥ 10) |
| NFR-SEC-02 | JWT 토큰 만료 16시간, 서명 알고리즘 HS256 또는 RS256 |
| NFR-SEC-03 | 테이블 비밀번호 평문 저장 금지 — 인증 후 토큰만 클라이언트 저장 |
| NFR-SEC-04 | 모든 API HTTPS (운영 가정) / 로컬은 HTTP 허용 |
| NFR-SEC-05 | 기본 입력 검증: 길이 / 타입 / 가격 양수 |
| **참고** | **Security baseline extension은 OFF** (사용자 선택 — Q16=B). 본 NFR-SEC는 기본 위생 수준 |

### 3.4 가용성 / 신뢰성 (Reliability) — MVP 수준
| ID | 요구사항 |
|---|---|
| NFR-REL-01 | 주문 생성 트랜잭션 무결성 (RDB 트랜잭션) |
| NFR-REL-02 | ~~SSE 연결 끊김 시 클라이언트 자동 재연결~~ → **제거** (폴링 전환으로 영속 연결 없음. 폴링 실패는 다음 주기에 자연 복구) |
| NFR-REL-04 | 관리자 동시 편집 시 주문 상태 변경 원자성 (비관적 락 + 정방향 전이 재검증) |
| NFR-REL-03 | 서버 재시작 시 진행 중 세션·주문 상태 영속 |
| **참고** | **Resiliency baseline extension은 OFF** (Q17=B) |

### 3.5 사용성 (Usability)
| ID | 요구사항 |
|---|---|
| NFR-USE-01 | Customer FE: 터치 친화, 버튼 최소 44×44px |
| NFR-USE-02 | Customer FE: 1920×1080 (가로) 및 1080×1920 (세로) 태블릿 해상도 대응 |
| NFR-USE-03 | Admin FE: PC(≥1366×768) 대응 |
| NFR-USE-04 | 한국어 단일 UI, **i18n 구조는 사전 준비** (Q14=B) — `next-intl` 등 적용, 추가 언어는 후속 |

### 3.6 유지보수성 / 품질 (Maintainability & Quality)
| ID | 요구사항 |
|---|---|
| NFR-QUAL-01 | TypeScript strict 모드 |
| NFR-QUAL-02 | 단위 테스트 + 통합 테스트 + E2E 테스트 (Playwright) — 핵심 플로우 커버 |
| NFR-QUAL-03 | ESLint + Prettier 적용 |
| NFR-QUAL-04 | API 문서: OpenAPI / Swagger 자동 생성 |

### 3.7 관측성 (Observability) — 최소 수준
| ID | 요구사항 |
|---|---|
| NFR-OBS-01 | 구조화된 JSON 로그 (request id, user id, action) |
| NFR-OBS-02 | 주요 API 응답 시간 / 에러율 로그 |

---

## 4. Out-of-Scope (제외 범위)

`requirements/constraints.md` 그대로 적용:

| 영역 | 제외 항목 |
|---|---|
| 결제 | 실제 결제·PG 연동·영수증·환불·포인트/쿠폰 |
| 인증/보안 | OAuth / SNS 로그인 / 2FA / OTP |
| 파일/콘텐츠 | 이미지 리사이징·최적화 / CMS / 광고 |
| 알림 | 푸시·SMS·이메일·소리·진동 |
| 주방 | 주방 전달·재고 관리 |
| 고급 기능 | 데이터 분석·매출 리포트·재고·직원/권한·예약·리뷰·다국어(UI 한정) |
| 외부 연동 | 배달 플랫폼·POS·소셜미디어·지도·번역 API |

---

## 5. Technical Decisions (기술 결정 사항)

| 영역 | 결정 | 근거(질문) |
|---|---|---|
| 운영 범위 | **단일 매장 전용** | Q1=A |
| 배포 환경 | **로컬 / Docker Compose 단일 머신** (PoC) | Q2=A |
| Frontend | **Next.js 14+ (App Router) + TypeScript** — Customer App / Admin App 분리, 모노레포 권장(pnpm workspaces) | Q3=A |
| Backend | **NestJS (Node.js + TypeScript)** — 모듈 구조 | Q4=A |
| Database | **MySQL 8.x** + TypeORM 또는 Prisma | Q5=B |
| Cache/PubSub | 불필요 — 실시간은 **클라이언트 폴링(2초)** 으로 처리 (푸시 채널 없음) | — |
| 메뉴 이미지 | **서버 업로드 + 로컬 디스크/볼륨** 정적 서빙, `multer` 사용 | Q6=B |
| 카테고리 | **마스터 데이터 CRUD** + 별도 테이블 + sortOrder | Q7=A |
| 메뉴 순서 | **카테고리 내부 메뉴 sortOrder만** | Q8=A |
| Admin 인증 | **JWT 16h + localStorage 저장** | Q9=B |
| 로그인 시도 제한 | **로깅만, 잠금 없음** | Q10=C |
| Table 인증 | **테이블 토큰 localStorage**, 비밀번호 평문 저장 X | Q11=B |
| 주문 상태 | **PENDING → PREPARING → COMPLETED + CANCELED(soft-delete)** | Q13=B |
| i18n | KRW/한국어, **i18n 구조 사전 적용** (`next-intl`) | Q14=B |
| 실시간 통신 | **폴링** (React Query `refetchInterval` 2초) — SSE에서 다운그레이드 | U8 GATE 설계 변경 |
| 컨테이너화 | **Docker Compose**: Frontend (Customer/Admin) + Backend + MySQL | Q2=A |

---

## 6. Test Strategy

**범위**: 단위 + 통합 + E2E 모두 (Q15=A)

| 레이어 | 도구(권장) | 커버 대상 |
|---|---|---|
| Unit | Jest | 도메인 로직 (주문 합계, 세션 상태 전이, 인증 토큰 발급) |
| Integration | Jest + Supertest + Testcontainers(MySQL) | API 엔드포인트, DB 트랜잭션 |
| E2E | Playwright | Customer 주문 골든 플로우 / Admin 실시간 모니터링 / 세션 종료 |
| Contract | (선택) Schema-first OpenAPI 검증 | FE-BE 계약 |

---

## 7. Extension Configuration

| Extension | Enabled | 사용자 선택 | 비고 |
|---|---|---|---|
| Security Baseline | **No** | Q16=B | MVP/PoC 의식적 선택, NFR-SEC 기본 위생만 적용 |
| Resiliency Baseline | **No** | Q17=B | MVP에는 과함 |
| Property-Based Testing | **No** | Q18=C | 단순 CRUD/UI 중심, 후속 옵션 |

---

## 8. Assumptions (전제)

1. 태블릿은 매장 전용 기기로, 분실·도난 가정은 운영 정책으로 관리
2. 매장 내부 네트워크가 안정적이라고 가정 (오프라인 모드 미지원)
3. 결제는 별도 (오프라인 카운터 결제 가정), 본 시스템은 주문 정보만 처리
4. 단일 매장 + 단일 관리자 계정 가능 가정 (다중 관리자 계정 기능은 미명세, 후속 검토)
5. 시간대는 `Asia/Seoul` 단일 고정

---

## 9. Open Questions / Risks

| ID | 사항 | 권장 처리 |
|---|---|---|
| OQ-01 | 다중 관리자 계정 / 권한 분리 필요 여부 | MVP 단일 계정 가정, 후속 |
| OQ-02 | 주문 취소(CANCELED) 후 복원 시나리오 | MVP 미지원, soft-delete 상태로 보관만 |
| OQ-03 | 메뉴 품절(SOLD_OUT) 표시 | 요구사항 미명세 → 후속 검토 |
| RISK-01 | localStorage JWT는 XSS 발생 시 토큰 탈취 위험 | PoC 의식적 선택. 운영 전환 시 httpOnly Cookie 재검토 권고 |
| RISK-02 | 로컬 디스크 이미지 저장 — 컨테이너 재배포 시 유실 위험 | Docker Volume 영속화 적용 필수 |

---

## 10. Glossary

| 용어 | 정의 |
|---|---|
| **테이블 세션** | 특정 테이블에 고객이 앉아 첫 주문을 시작한 시점부터 매장 "이용 완료" 처리까지 |
| **세션 ID** | 테이블 세션의 고유 식별자 (서버 발급) |
| **테이블 토큰** | 테이블 태블릿 자동 로그인용 long-lived 인증 토큰 |
| **soft-delete (CANCELED)** | 데이터를 물리적으로 삭제하지 않고 상태만 취소 처리 |
| **SSE** | Server-Sent Events, 서버 → 클라이언트 단방향 실시간 푸시 |
| **MVP** | Minimum Viable Product |

---

**다음 단계**: User Stories (권장) → Workflow Planning → Application Design → Units Generation → Construction
