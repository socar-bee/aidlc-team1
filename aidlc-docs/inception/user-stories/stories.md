# User Stories — 테이블오더 서비스

**Breakdown**: Persona-based (Customer / Admin / System Behaviors)
**Granularity**: Task-level (~53 stories)
**Template**: "As a {persona}, I want {capability}, so that {value}"
**Acceptance Criteria**: 핵심 happy-path는 Given-When-Then, 부가 조건은 체크리스트 (혼합)
**Priority**: MoSCoW (Must / Should / Could / Won't)

---

## INVEST 검토 요약

| 기준 | 적용 방식 |
|---|---|
| **Independent** | Task-level 분해로 스토리 간 의존 최소화. 의존 있으면 `Dependencies` 명시 |
| **Negotiable** | AC는 명세이되 구현 방식은 후속 단계(Application Design, Code Gen)에서 협상 |
| **Valuable** | 모든 스토리는 페르소나 가치(`so that`) 명시 |
| **Estimable** | Task-level은 1~3시간 구현 단위 추정 가능 |
| **Small** | Task 1개 = 메서드/엔드포인트/화면 컴포넌트 1개 수준 |
| **Testable** | Given-When-Then이 있는 happy-path는 E2E 시나리오와 1:1 매핑 |

---

# 🧑 Customer Stories (P1 - 민준)

## Epic C1: 테이블 태블릿 인증 & 세션 (FR-CUS-01)

### US-C-01 — 초기 설정 화면 입력 폼 표시
- **Story**: As a Customer, I want to see the initial setup form on a fresh tablet, so that the admin can register this table once.
- **Priority**: Must
- **FR**: FR-CUS-01
- **AC (Given-When-Then)**:
  - **Given** 태블릿 브라우저에 저장된 인증 정보가 없을 때
  - **When** 앱을 처음 로드하면
  - **Then** 매장 식별자 / 테이블 번호 / 테이블 비밀번호 입력 폼이 표시된다
- **AC (체크리스트)**:
  - [ ] 세 입력 필드 모두 필수
  - [ ] 입력 검증 에러 시 인라인 메시지 표시
  - [ ] "등록" 버튼은 모든 필드가 채워지기 전에는 비활성화

### US-C-02 — 초기 설정 정보로 서버 인증
- **Story**: As a Customer, I want the tablet to authenticate against the server with my entered info, so that this table is bound to the store.
- **Priority**: Must
- **FR**: FR-CUS-01
- **AC (Given-When-Then)**:
  - **Given** 매장ID + 테이블 번호 + 테이블 비밀번호를 입력하고
  - **When** "등록" 버튼을 누르면
  - **Then** 서버가 유효성을 검증하고 인증 결과를 반환한다
- **AC (체크리스트)**:
  - [ ] 잘못된 매장ID/테이블 번호 → "정보를 확인하세요" 에러
  - [ ] 비밀번호 불일치 → 동일 메시지(매장 추정 방지)

### US-C-03 — 테이블 토큰 발급 및 localStorage 저장
- **Story**: As a Customer, I want a long-lived table token to be issued upon successful auth, so that subsequent uses skip the login flow.
- **Priority**: Must
- **FR**: FR-CUS-01, NFR-SEC-03
- **AC (G-W-T)**:
  - **Given** 인증이 성공했을 때
  - **When** 서버가 토큰을 반환하면
  - **Then** 토큰은 localStorage 의 `table_token` 키에 저장된다
- **AC (체크리스트)**:
  - [ ] 입력한 테이블 비밀번호는 어떤 저장소에도 저장하지 않는다
  - [ ] 토큰에는 매장ID·테이블ID 정보가 포함된다(서버 서명)

### US-C-04 — 저장된 토큰으로 자동 로그인
- **Story**: As a Customer, I want the tablet to auto-login on next launch using the stored token, so that I can start ordering immediately.
- **Priority**: Must
- **FR**: FR-CUS-01
- **AC (G-W-T)**:
  - **Given** localStorage 에 유효한 `table_token` 이 있을 때
  - **When** 앱을 로드하면
  - **Then** 인증 화면을 건너뛰고 메뉴 화면으로 이동한다

### US-C-05 — 토큰 만료 시 재로그인 유도
- **Story**: As a Customer (실제론 Admin이 재설정), I want the system to detect an expired token and prompt re-setup, so that an outdated tablet doesn't silently fail.
- **Priority**: Should
- **FR**: FR-CUS-01
- **AC (체크리스트)**:
  - [ ] API 호출 시 401 응답이면 토큰을 제거하고 초기 설정 화면으로 이동
  - [ ] 화면 로드 시점에도 토큰 만료를 미리 검증

---

## Epic C2: 메뉴 조회 (FR-CUS-02)

### US-C-06 — 메뉴 화면이 기본 화면
- **Story**: As a Customer, I want the menu screen to be the default landing, so that I don't have to navigate to start ordering.
- **Priority**: Must
- **FR**: FR-CUS-02
- **AC**:
  - [ ] 자동 로그인 직후 메뉴 화면이 표시된다
  - [ ] URL `/` 진입 시에도 동일

### US-C-07 — 카테고리 탭/리스트 표시
- **Story**: As a Customer, I want to see category tabs, so that I can find a kind of menu quickly.
- **Priority**: Must
- **FR**: FR-CUS-02
- **AC**:
  - [ ] 카테고리는 sortOrder 오름차순 표시
  - [ ] 첫 카테고리가 기본 선택

### US-C-08 — 카테고리 선택 시 해당 메뉴만 표시
- **Story**: As a Customer, I want clicking a category to filter the menu list, so that I can browse focused items.
- **Priority**: Must
- **FR**: FR-CUS-02
- **AC (G-W-T)**:
  - **Given** 카테고리 탭이 표시된 상태에서
  - **When** 사용자가 다른 카테고리를 탭하면
  - **Then** 해당 카테고리의 메뉴만 카드 그리드로 표시된다

### US-C-09 — 메뉴 카드 (이름·가격·이미지·설명) 표시
- **Story**: As a Customer, I want each menu card to show name, price, image, and brief description, so that I can decide quickly.
- **Priority**: Must
- **FR**: FR-CUS-02, NFR-USE-01
- **AC**:
  - [ ] 카드 터치 영역 ≥ 44×44px
  - [ ] 이미지 없으면 placeholder 표시
  - [ ] 가격은 KRW + 천단위 콤마 (예: ₩12,000)

### US-C-10 — 메뉴 카드 상세 보기
- **Story**: As a Customer, I want to see a fuller description by tapping a card, so that I can read details before adding.
- **Priority**: Should
- **FR**: FR-CUS-02
- **AC**:
  - [ ] 모달 또는 상세 페이지에서 전체 설명·큰 이미지·가격 표시
  - [ ] 상세에서 바로 "장바구니 담기" 가능

---

## Epic C3: 장바구니 (FR-CUS-03)

### US-C-11 — 메뉴를 장바구니에 추가
- **Story**: As a Customer, I want to add a menu to the cart, so that I can build my order.
- **Priority**: Must
- **FR**: FR-CUS-03
- **AC (G-W-T)**:
  - **Given** 메뉴 카드를 보고 있을 때
  - **When** "담기" 버튼을 누르면
  - **Then** 장바구니에 수량 1로 추가되고 시각적 피드백이 표시된다

### US-C-12 — 장바구니에서 메뉴 삭제
- **Story**: As a Customer, I want to remove an item from the cart, so that I can change my mind.
- **Priority**: Must
- **FR**: FR-CUS-03
- **AC**:
  - [ ] 각 아이템에 삭제 버튼
  - [ ] 삭제 시 즉시 총액 재계산

### US-C-13 — 장바구니 수량 증감
- **Story**: As a Customer, I want to increase/decrease item quantity in the cart, so that I can fine-tune the order.
- **Priority**: Must
- **FR**: FR-CUS-03
- **AC**:
  - [ ] `−`/`+` 버튼 또는 수량 입력
  - [ ] 수량 0이면 자동 삭제(또는 1로 클램프 + 별도 삭제)
  - [ ] 최소 1, 최대 99 클램프

### US-C-14 — 총액 실시간 계산·표시
- **Story**: As a Customer, I want to see the running total at all times, so that I know what I'll spend.
- **Priority**: Must
- **FR**: FR-CUS-03
- **AC (G-W-T)**:
  - **Given** 장바구니에 아이템이 있을 때
  - **When** 수량을 바꾸거나 아이템을 추가/삭제하면
  - **Then** 합계 = Σ(단가 × 수량) 이 즉시 갱신된다

### US-C-15 — 장바구니 비우기
- **Story**: As a Customer, I want a "clear cart" action, so that I can restart easily.
- **Priority**: Should
- **FR**: FR-CUS-03
- **AC**:
  - [ ] "비우기" 버튼 + 확인 팝업
  - [ ] 확인 시 모든 아이템 제거 + 합계 0

### US-C-16 — 장바구니 localStorage 영속화
- **Story**: As a Customer, I want my cart to survive page refresh, so that I don't lose my selection.
- **Priority**: Must
- **FR**: FR-CUS-03
- **AC (G-W-T)**:
  - **Given** 장바구니에 아이템이 있고
  - **When** 페이지를 새로고침하면
  - **Then** 동일한 아이템과 수량이 그대로 복원된다
- **AC (체크리스트)**:
  - [ ] localStorage 키: `cart`
  - [ ] 직렬화/역직렬화 실패 시 빈 장바구니로 fallback

---

## Epic C4: 주문 생성 (FR-CUS-04)

### US-C-17 — 주문 내역 최종 확인 화면
- **Story**: As a Customer, I want to review my order summary before confirming, so that I avoid mistakes.
- **Priority**: Must
- **FR**: FR-CUS-04
- **AC**:
  - [ ] 메뉴명·수량·단가·소계·총액 표시
  - [ ] "수정" 액션 = 장바구니로 복귀

### US-C-18 — 주문 확정 버튼 동작
- **Story**: As a Customer, I want to confirm and submit my order, so that the kitchen/staff receives it.
- **Priority**: Must
- **FR**: FR-CUS-04, FR-SYS-01
- **AC (G-W-T)**:
  - **Given** 장바구니에 ≥ 1개 아이템이 있고
  - **When** "주문 확정" 버튼을 누르면
  - **Then** 서버에 주문이 생성되고 주문 번호가 반환된다
- **AC (체크리스트)**:
  - [ ] 페이로드: 매장ID / 테이블ID / 메뉴 목록(이름·수량·단가) / 총액 / 세션ID
  - [ ] 중복 클릭 방지(버튼 disabled + 디바운싱)

### US-C-19 — 주문 성공 시 주문 번호 표시
- **Story**: As a Customer, I want to see the order number on success, so that I can reference it with staff.
- **Priority**: Must
- **FR**: FR-CUS-04
- **AC**:
  - [ ] 성공 화면에 주문 번호 대형 표시
  - [ ] "곧 메뉴 화면으로 돌아갑니다" 안내

### US-C-20 — 5초 후 메뉴 화면으로 자동 리다이렉트
- **Story**: As a Customer, I want to be brought back to the menu automatically, so that I can keep ordering.
- **Priority**: Must
- **FR**: FR-CUS-04
- **AC (G-W-T)**:
  - **Given** 주문 성공 화면이 표시된 후
  - **When** 5초가 경과하면
  - **Then** 장바구니가 자동으로 비워지고 메뉴 화면으로 이동한다
- **AC (체크리스트)**:
  - [ ] 카운트다운 표시(선택)
  - [ ] "지금 이동" 버튼으로 즉시 이동 가능

### US-C-21 — 주문 실패 시 에러 표시 + 장바구니 유지
- **Story**: As a Customer, I want to see an error and keep my cart if the order fails, so that I can retry.
- **Priority**: Must
- **FR**: FR-CUS-04
- **AC (G-W-T)**:
  - **Given** 주문 확정 요청이 서버 에러로 실패할 때
  - **When** 응답이 5xx 또는 네트워크 에러이면
  - **Then** 에러 메시지가 표시되고 장바구니는 유지된 채 확정 화면에 머문다

---

## Epic C5: 주문 내역 조회 (FR-CUS-05)

### US-C-22 — 현재 세션 주문 시간 역순 조회
- **Story**: As a Customer, I want to see my orders from this session in newest-first order, so that I can track what I've ordered.
- **Priority**: Must
- **FR**: FR-CUS-05
- **AC (G-W-T)**:
  - **Given** "주문 내역" 화면에 진입할 때
  - **When** 데이터가 로드되면
  - **Then** 현재 테이블 세션의 주문만 최신 → 과거 순으로 표시된다

### US-C-23 — 주문별 상세 정보 표시
- **Story**: As a Customer, I want to see each order's details (number, time, items, amount, status), so that I have a full record.
- **Priority**: Must
- **FR**: FR-CUS-05
- **AC**:
  - [ ] 항목: 주문 번호 / 주문 시각 / 메뉴·수량 / 금액 / 상태 라벨
  - [ ] 상태 라벨: 대기중 / 준비중 / 완료 (색상 구분)

### US-C-24 — 이전 세션 / 취소 주문 제외
- **Story**: As a Customer, I want previously closed-session and canceled orders excluded, so that I don't see clutter.
- **Priority**: Must
- **FR**: FR-CUS-05, FR-SYS-02
- **AC**:
  - [ ] 다른 세션의 주문은 조회되지 않음
  - [ ] CANCELED 상태 주문도 표시 안 함

### US-C-25 — (선택) SSE 기반 주문 상태 실시간 업데이트
- **Story**: As a Customer, I want to see status changes (preparing → done) in real time, so that I know when to expect my food.
- **Priority**: Could
- **FR**: FR-CUS-05, FR-SYS-03
- **AC**:
  - [ ] Admin 측 상태 변경이 5초 이내 화면에 반영(SSE)
  - [ ] SSE 연결 끊김 시 정기 폴링 fallback

---

# 👨‍💼 Admin Stories (P2 - 지우)

## Epic A1: 매장 인증 (FR-ADM-01)

### US-A-01 — 로그인 화면 (매장ID/사용자/비밀번호)
- **Story**: As an Admin, I want a login form with three fields, so that I can authenticate my store.
- **Priority**: Must
- **FR**: FR-ADM-01
- **AC**:
  - [ ] 매장 식별자 / 사용자명 / 비밀번호 필드
  - [ ] 빈 필드 검증, 실패 시 인라인 메시지

### US-A-02 — 자격 증명 검증 및 JWT 발급
- **Story**: As an Admin, I want my credentials verified and a JWT issued, so that I can access protected admin features.
- **Priority**: Must
- **FR**: FR-ADM-01, NFR-SEC-01, NFR-SEC-02
- **AC (G-W-T)**:
  - **Given** 매장ID + 사용자명 + 비밀번호를 제출했을 때
  - **When** 서버가 bcrypt 해시 비교 후 성공이면
  - **Then** 24시간 만료의 JWT를 응답으로 반환한다
- **AC (체크리스트)**:
  - [ ] 실패 시 401 + 일반 메시지("로그인 정보 확인")
  - [ ] 시도 결과는 로깅(잠금은 없음 — Q10=C)

### US-A-03 — JWT localStorage 저장
- **Story**: As an Admin, I want my token persisted in localStorage, so that I stay logged in across refreshes.
- **Priority**: Must
- **FR**: FR-ADM-01
- **AC**:
  - [ ] 키: `admin_token`
  - [ ] 모든 보호 API 호출 시 `Authorization: Bearer` 헤더 포함

### US-A-04 — 새로고침 시 세션 유지
- **Story**: As an Admin, I want my session to survive a browser refresh, so that I don't have to log in repeatedly.
- **Priority**: Must
- **FR**: FR-ADM-01
- **AC**:
  - [ ] 페이지 로드 시 localStorage 토큰 확인 → 유효하면 대시보드 진입
  - [ ] 만료 토큰이면 로그인 화면으로 redirect

### US-A-05 — 24시간 후 자동 로그아웃
- **Story**: As an Admin, I want to be auto-logged-out after 16h, so that the session doesn't linger indefinitely.
- **Priority**: Must
- **FR**: FR-ADM-01
- **AC (G-W-T)**:
  - **Given** 마지막 로그인이 24시간을 초과했을 때
  - **When** 보호 API를 호출하면
  - **Then** 서버가 401을 반환하고 클라이언트는 토큰 제거 + 로그인 화면으로 이동한다

### US-A-06 — 로그인 시도 로깅
- **Story**: As an Admin, I want failed login attempts to be logged, so that we can audit suspicious access.
- **Priority**: Should
- **FR**: FR-ADM-01, NFR-OBS-01
- **AC**:
  - [ ] 시도별 로그: 매장ID / 사용자명 / 결과 / 타임스탬프 / IP
  - [ ] 잠금은 없음

---

## Epic A2: 실시간 주문 모니터링 (FR-ADM-02)

### US-A-07 — 그리드 대시보드 표시
- **Story**: As an Admin, I want a grid dashboard showing one card per table, so that I can scan all activity at a glance.
- **Priority**: Must
- **FR**: FR-ADM-02
- **AC**:
  - [ ] 반응형 그리드 (PC ≥ 1366×768)
  - [ ] 빈 테이블도 카드로 표시 (총액 ₩0)

### US-A-08 — 테이블 카드 (총액 + 최신 N개 미리보기)
- **Story**: As an Admin, I want each table card to show the running total and a preview of latest N orders, so that I get instant context.
- **Priority**: Must
- **FR**: FR-ADM-02
- **AC**:
  - [ ] 카드 상단: 테이블 번호, 총 주문액
  - [ ] 카드 본문: 최신 3개 주문 메뉴·수량 축약
  - [ ] 더보기 = 카드 클릭 시 상세

### US-A-09 — SSE 연결로 실시간 신규 주문 수신
- **Story**: As an Admin, I want new orders to appear via SSE within 2 seconds, so that I don't miss any.
- **Priority**: Must
- **FR**: FR-ADM-02, FR-SYS-03, NFR-PERF-01
- **AC (G-W-T)**:
  - **Given** 대시보드가 열려 있고 SSE가 연결된 상태에서
  - **When** Customer가 주문을 생성하면
  - **Then** 2초 이내 해당 테이블 카드가 갱신된다

### US-A-10 — 신규 주문 시각 강조
- **Story**: As an Admin, I want new orders highlighted (color/animation), so that my eye is drawn to them.
- **Priority**: Should
- **FR**: FR-ADM-02
- **AC**:
  - [ ] 신규 주문 카드: 5초간 강조 색상 또는 깜빡임
  - [ ] 강조 해제 후 일반 스타일

### US-A-11 — 카드 클릭 시 전체 주문 상세 표시
- **Story**: As an Admin, I want clicking a table card to open full order details, so that I can review or modify.
- **Priority**: Must
- **FR**: FR-ADM-02
- **AC**:
  - [ ] 사이드 패널 또는 모달에 해당 테이블의 모든 진행 중 주문 메뉴·수량·금액·상태 표시
  - [ ] 닫기 버튼

### US-A-12 — 주문 상태 변경 (PENDING → PREPARING → COMPLETED)
- **Story**: As an Admin, I want to advance order status, so that staff know what to prepare and what's done.
- **Priority**: Must
- **FR**: FR-ADM-02
- **AC (G-W-T)**:
  - **Given** 주문 상세에 상태 변경 액션이 있을 때
  - **When** 다음 상태로 진행 버튼을 누르면
  - **Then** 서버에 상태가 업데이트되고 SSE로 Customer 화면에도 전파된다
- **AC (체크리스트)**:
  - [ ] 역방향 전이 차단(COMPLETED → PENDING 불가)

### US-A-13 — 테이블별 필터링
- **Story**: As an Admin, I want to filter the dashboard by a specific table, so that I can focus on one table.
- **Priority**: Should
- **FR**: FR-ADM-02
- **AC**:
  - [ ] 필터 셀렉트 또는 검색
  - [ ] 적용 시 해당 테이블 카드만 표시

---

## Epic A3: 테이블 관리 (FR-ADM-03)

### US-A-14 — 테이블 태블릿 초기 설정 등록
- **Story**: As an Admin, I want to register a new table with number + password, so that the tablet can self-login.
- **Priority**: Must
- **FR**: FR-ADM-03 (3.1)
- **AC (G-W-T)**:
  - **Given** "테이블 등록" 화면에서
  - **When** 테이블 번호와 테이블 비밀번호를 입력 후 저장하면
  - **Then** 서버에 테이블이 생성되고 자동 로그인이 활성화된다
- **AC (체크리스트)**:
  - [ ] 중복 테이블 번호 방지
  - [ ] 비밀번호는 해싱 저장

### US-A-15 — 주문 삭제 버튼 + 확인 팝업
- **Story**: As an Admin, I want a delete button with confirmation, so that I don't delete by mistake.
- **Priority**: Must
- **FR**: FR-ADM-03 (3.2)
- **AC**:
  - [ ] 주문 상세에 "삭제" 버튼
  - [ ] 클릭 시 "정말 삭제하시겠습니까?" 확인 팝업

### US-A-16 — 주문 soft-delete (CANCELED 상태 전환)
- **Story**: As an Admin, I want delete to set the order to CANCELED rather than hard-removing, so that history is preserved for audit.
- **Priority**: Must
- **FR**: FR-ADM-03 (3.2)
- **AC (G-W-T)**:
  - **Given** 주문 삭제 확인 시
  - **When** 서버에 삭제 요청이 도달하면
  - **Then** 주문 상태가 CANCELED로 변경되고 현재 진행 목록·총액에서 제외된다

### US-A-17 — 테이블 총액 자동 재계산
- **Story**: As an Admin, I want the table's running total to update immediately after a delete, so that the dashboard stays accurate.
- **Priority**: Must
- **FR**: FR-ADM-03 (3.2)
- **AC**:
  - [ ] CANCELED는 합계에서 제외
  - [ ] SSE로 다른 Admin 화면도 동기화

### US-A-18 — 테이블 세션 종료 (이용 완료) 버튼 + 확인
- **Story**: As an Admin, I want to end a table session with confirmation, so that I prepare for next customers.
- **Priority**: Must
- **FR**: FR-ADM-03 (3.3)
- **AC**:
  - [ ] "이용 완료" 버튼 + 확인 팝업
  - [ ] 진행 중 주문이 있어도 강제 종료 가능 (선택적 경고)

### US-A-19 — 세션 종료 시 현재 주문 목록·총액 리셋
- **Story**: As an Admin, I want session end to clear current orders and reset total, so that the next customer starts fresh.
- **Priority**: Must
- **FR**: FR-ADM-03 (3.3), FR-SYS-02
- **AC (G-W-T)**:
  - **Given** 활성 세션이 있는 테이블에서
  - **When** 이용 완료 액션을 확정하면
  - **Then** 해당 세션의 모든 주문이 과거 이력으로 이동(`completedAt` 세팅)되고 테이블 카드 총액이 ₩0으로 리셋된다

### US-A-20 — 과거 주문 내역 조회 버튼
- **Story**: As an Admin, I want a "history" button per table, so that I can review past sessions.
- **Priority**: Should
- **FR**: FR-ADM-03 (3.4)
- **AC**:
  - [ ] 테이블 카드 또는 상세에 "과거 내역" 버튼
  - [ ] 클릭 시 과거 주문 화면 열림

### US-A-21 — 과거 주문 시간 역순 표시
- **Story**: As an Admin, I want past orders listed newest-first per table, so that recent activity is easy to find.
- **Priority**: Should
- **FR**: FR-ADM-03 (3.4)
- **AC**:
  - [ ] 항목: 주문 번호 / 시각 / 메뉴 / 금액 / 이용 완료 시각
  - [ ] 페이지네이션

### US-A-22 — 과거 주문 날짜 필터링
- **Story**: As an Admin, I want a date-range filter on past orders, so that I can audit a specific period.
- **Priority**: Could
- **FR**: FR-ADM-03 (3.4)
- **AC**:
  - [ ] 시작·종료 날짜 입력
  - [ ] 적용 시 해당 범위 주문만 표시

---

## Epic A4: 메뉴 관리 (FR-ADM-04)

### US-A-23 — 메뉴 목록 조회 (카테고리별)
- **Story**: As an Admin, I want to view menus grouped by category, so that I can manage them efficiently.
- **Priority**: Must
- **FR**: FR-ADM-04
- **AC**:
  - [ ] 카테고리 탭 또는 사이드 트리
  - [ ] 메뉴는 sortOrder 순

### US-A-24 — 메뉴 등록
- **Story**: As an Admin, I want to create a new menu with name/price/description/category/image, so that I can expand the offering.
- **Priority**: Must
- **FR**: FR-ADM-04
- **AC (G-W-T)**:
  - **Given** 메뉴 등록 폼에서
  - **When** 필수 필드(이름·가격·카테고리)를 채우고 저장하면
  - **Then** 메뉴가 생성되고 고객 화면에 즉시 반영된다
- **AC (체크리스트)**:
  - [ ] 가격 > 0 검증
  - [ ] 이미지 URL은 선택, 업로드는 별도(US-A-33)

### US-A-25 — 메뉴 수정
- **Story**: As an Admin, I want to edit existing menus, so that I can update pricing or details.
- **Priority**: Must
- **FR**: FR-ADM-04
- **AC**:
  - [ ] 동일 검증 룰 적용
  - [ ] 변경 후 고객 화면 다음 갱신부터 반영

### US-A-26 — 메뉴 삭제
- **Story**: As an Admin, I want to delete a menu, so that I can retire items.
- **Priority**: Should
- **FR**: FR-ADM-04
- **AC**:
  - [ ] 확인 팝업
  - [ ] 진행 중 주문에는 영향 없음 (메뉴 스냅샷 사용)

### US-A-27 — 메뉴 카테고리 내 sortOrder 조정
- **Story**: As an Admin, I want to reorder menus within a category, so that highlighted items appear first.
- **Priority**: Should
- **FR**: FR-ADM-04
- **AC**:
  - [ ] 드래그 앤 드롭 또는 sortOrder 직접 입력
  - [ ] 저장 시 즉시 고객 화면 반영

---

## Epic A5: 카테고리 관리 (FR-ADM-05)

### US-A-28 — 카테고리 목록 조회
- **Story**: As an Admin, I want to see all categories, so that I can plan menu organization.
- **Priority**: Must
- **FR**: FR-ADM-05
- **AC**:
  - [ ] sortOrder 오름차순
  - [ ] 카테고리별 메뉴 수 표시

### US-A-29 — 카테고리 생성
- **Story**: As an Admin, I want to create a category, so that I can organize menus.
- **Priority**: Must
- **FR**: FR-ADM-05
- **AC**:
  - [ ] 이름 필수, sortOrder 자동 부여(가장 큰 값 + 1)
  - [ ] 중복 이름 차단

### US-A-30 — 카테고리 수정
- **Story**: As an Admin, I want to rename a category, so that I can correct typos or rebrand.
- **Priority**: Should
- **FR**: FR-ADM-05
- **AC**:
  - [ ] 이름 변경 시 연결된 메뉴는 그대로 유지
  - [ ] 중복 이름 차단

### US-A-31 — 카테고리 삭제 (메뉴 연결 시 차단)
- **Story**: As an Admin, I want category deletion to be blocked if it has menus, so that I don't orphan items.
- **Priority**: Must
- **FR**: FR-ADM-05
- **AC (G-W-T)**:
  - **Given** 메뉴가 연결된 카테고리에서
  - **When** 삭제를 시도하면
  - **Then** "연결된 메뉴를 먼저 정리하세요" 에러로 차단된다

### US-A-32 — 카테고리 sortOrder 조정
- **Story**: As an Admin, I want to reorder categories, so that the customer view emphasizes priority categories.
- **Priority**: Could
- **FR**: FR-ADM-05
- **AC**:
  - [ ] sortOrder 입력 또는 드래그
  - [ ] 고객 화면 즉시 반영

---

## Epic A6: 메뉴 이미지 업로드 (FR-ADM-06)

### US-A-33 — 이미지 파일 업로드
- **Story**: As an Admin, I want to upload menu images directly, so that I don't need external image hosting.
- **Priority**: Must
- **FR**: FR-ADM-06
- **AC**:
  - [ ] 허용 포맷: JPG, PNG (선택: WebP)
  - [ ] 최대 파일 크기 (예: 5MB) 검증
  - [ ] 업로드 진행 표시

### US-A-34 — 서버 로컬 디스크 저장 + 정적 서빙 URL 반환
- **Story**: As an Admin, I want the server to store the file locally and return a URL, so that I can attach it to a menu.
- **Priority**: Must
- **FR**: FR-ADM-06, NFR-PERF-02
- **AC (G-W-T)**:
  - **Given** 이미지 파일을 업로드하면
  - **When** 서버가 검증 후 저장하면
  - **Then** 정적 경로 URL이 응답으로 반환되고 메뉴 등록 시 즉시 사용 가능하다
- **AC (체크리스트)**:
  - [ ] 파일명 충돌 방지(UUID 또는 timestamp prefix)
  - [ ] 리사이징·최적화 없음 (constraints 준수)

---

# 🤖 System Behaviors (페르소나 무관)

System Behaviors는 사용자 직접 인터랙션이 아닌 시스템 자동 행위로, `requirements.md` FR-SYS-01~03 에 대응합니다.

### US-S-01 — 첫 주문 시 자동 세션 시작
- **System Behavior**: 테이블의 활성 세션이 없는 상태에서 주문이 생성되면, 시스템은 자동으로 새 세션을 생성하고 해당 주문을 그 세션에 할당한다.
- **Priority**: Must
- **FR**: FR-SYS-01
- **AC**:
  - [ ] 세션 ID 생성 (UUID)
  - [ ] 세션 시작 시각 기록
  - [ ] 이후 같은 테이블 주문은 동일 세션에 귀속

### US-S-02 — 세션 종료 트리거 처리
- **System Behavior**: Admin의 "이용 완료" 액션이 실행되면, 세션 종료 시각을 기록하고 해당 세션 주문을 과거 이력으로 논리 전환한다.
- **Priority**: Must
- **FR**: FR-SYS-02
- **AC**:
  - [ ] `completedAt` 필드에 세션 종료 시각 저장
  - [ ] 종료된 세션 주문은 현재 주문 조회에서 제외

### US-S-03 — 세션 ID로 주문 그룹화
- **System Behavior**: 모든 주문 조회·집계는 `sessionId`를 기준으로 그룹화한다.
- **Priority**: Must
- **FR**: FR-SYS-01
- **AC**:
  - [ ] 주문 테이블에 `sessionId` 외래키
  - [ ] 현재/과거 분리는 `completedAt` IS NULL 기준

### US-S-04 — SSE 이벤트 채널 publish
- **System Behavior**: 매장 단위 SSE 채널에 다음 이벤트를 publish한다: `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, `ORDER_CANCELED`, `SESSION_ENDED`.
- **Priority**: Must
- **FR**: FR-SYS-03, NFR-PERF-01
- **AC**:
  - [ ] 각 이벤트 페이로드는 최소 정보 + 변경된 엔티티 ID
  - [ ] 2초 이내 publish 완료

### US-S-05 — SSE 클라이언트 자동 재연결
- **System Behavior**: SSE 클라이언트(Customer/Admin)는 연결 끊김 시 exponential backoff로 재연결한다.
- **Priority**: Should
- **FR**: FR-SYS-03, NFR-REL-02
- **AC**:
  - [ ] 초기 대기 1초, 2배수, 최대 30초
  - [ ] 재연결 시 마지막 이벤트 ID 기준 미수신 이벤트 catch-up (`Last-Event-ID` 헤더)

---

# 📊 Traceability Matrix

## Persona × Story 매핑

| Persona | Stories | Count |
|---|---|---|
| **P1 Customer (민준)** | US-C-01 ~ US-C-25 | 25 |
| **P2 Admin (지우)** | US-A-01 ~ US-A-34 | 34 |
| (System Behaviors) | US-S-01 ~ US-S-05 | 5 |
| **Total** | | **64** |

## FR × Story 매핑 (Requirements Traceability)

| FR | 매핑된 Stories |
|---|---|
| FR-CUS-01 (자동 로그인 / 세션) | US-C-01, US-C-02, US-C-03, US-C-04, US-C-05 |
| FR-CUS-02 (메뉴 조회) | US-C-06, US-C-07, US-C-08, US-C-09, US-C-10 |
| FR-CUS-03 (장바구니) | US-C-11, US-C-12, US-C-13, US-C-14, US-C-15, US-C-16 |
| FR-CUS-04 (주문 생성) | US-C-17, US-C-18, US-C-19, US-C-20, US-C-21 |
| FR-CUS-05 (주문 내역) | US-C-22, US-C-23, US-C-24, US-C-25 |
| FR-ADM-01 (매장 인증) | US-A-01, US-A-02, US-A-03, US-A-04, US-A-05, US-A-06 |
| FR-ADM-02 (실시간 모니터링) | US-A-07, US-A-08, US-A-09, US-A-10, US-A-11, US-A-12, US-A-13 |
| FR-ADM-03 (테이블 관리) | US-A-14, US-A-15, US-A-16, US-A-17, US-A-18, US-A-19, US-A-20, US-A-21, US-A-22 |
| FR-ADM-04 (메뉴 관리) | US-A-23, US-A-24, US-A-25, US-A-26, US-A-27 |
| FR-ADM-05 (카테고리 관리) | US-A-28, US-A-29, US-A-30, US-A-31, US-A-32 |
| FR-ADM-06 (이미지 업로드) | US-A-33, US-A-34 |
| FR-SYS-01 (세션 라이프사이클) | US-S-01, US-S-03 |
| FR-SYS-02 (이력 보존) | US-S-02 (+ US-A-19, US-C-24) |
| FR-SYS-03 (SSE 채널) | US-S-04, US-S-05 (+ US-A-09, US-C-25) |

## 우선순위 분포 (MoSCoW)

| Priority | Count | 주요 항목 |
|---|---|---|
| **Must** | 41 | 핵심 주문 플로우, 인증, 실시간 모니터링, 세션 라이프사이클 |
| **Should** | 17 | UX 개선, 이력 조회, 카테고리 수정, 신규 강조 |
| **Could** | 4 | 메뉴 상세 모달, 날짜 필터, SSE 상태 push, 카테고리 sortOrder |
| **Won't** | 0 | (Out-of-scope 항목은 requirements.md §4 참조) |

---

## 다음 단계

본 stories.md 의 51 user story + 5 system behavior 는 후속 **Workflow Planning** 의 입력으로 사용됩니다. Construction Phase에서 Units Generation 시 Epic 단위(C1~C5, A1~A6)를 자연스러운 Unit 후보로 활용 가능합니다.
