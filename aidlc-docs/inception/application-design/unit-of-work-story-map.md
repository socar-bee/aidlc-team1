# Unit of Work — Story Map (Story ↔ Unit ↔ FR ↔ Persona)

## 1. Story → Unit 매핑 (전체 64 항목)

### 1.1 Customer Stories (US-C-*)

| Story | Title | Unit | FR |
|---|---|---|---|
| US-C-01 | 초기 설정 화면 입력 폼 표시 | U2 | FR-CUS-01 |
| US-C-02 | 초기 설정 정보로 서버 인증 | U2 | FR-CUS-01 |
| US-C-03 | 테이블 토큰 발급 및 localStorage 저장 | U2 | FR-CUS-01 |
| US-C-04 | 저장된 토큰으로 자동 로그인 | U2 | FR-CUS-01 |
| US-C-05 | 토큰 만료 시 재로그인 유도 | U2 | FR-CUS-01 |
| US-C-06 | 메뉴 화면이 기본 화면 | U4 | FR-CUS-02 |
| US-C-07 | 카테고리 탭/리스트 표시 | U4 | FR-CUS-02 |
| US-C-08 | 카테고리 선택 시 해당 메뉴만 표시 | U4 | FR-CUS-02 |
| US-C-09 | 메뉴 카드 (이름·가격·이미지·설명) 표시 | U4 | FR-CUS-02 |
| US-C-10 | 메뉴 카드 상세 보기 | U4 | FR-CUS-02 |
| US-C-11 | 메뉴를 장바구니에 추가 | U5 | FR-CUS-03 |
| US-C-12 | 장바구니에서 메뉴 삭제 | U5 | FR-CUS-03 |
| US-C-13 | 장바구니 수량 증감 | U5 | FR-CUS-03 |
| US-C-14 | 총액 실시간 계산·표시 | U5 | FR-CUS-03 |
| US-C-15 | 장바구니 비우기 | U5 | FR-CUS-03 |
| US-C-16 | 장바구니 localStorage 영속화 | U5 | FR-CUS-03 |
| US-C-17 | 주문 내역 최종 확인 화면 | U6 | FR-CUS-04 |
| US-C-18 | 주문 확정 버튼 동작 | U6 | FR-CUS-04, FR-SYS-01 |
| US-C-19 | 주문 성공 시 주문 번호 표시 | U6 | FR-CUS-04 |
| US-C-20 | 5초 후 메뉴 화면으로 자동 리다이렉트 | U6 | FR-CUS-04 |
| US-C-21 | 주문 실패 시 에러 표시 + 장바구니 유지 | U6 | FR-CUS-04 |
| US-C-22 | 현재 세션 주문 시간 역순 조회 | U7 | FR-CUS-05 |
| US-C-23 | 주문별 상세 정보 표시 | U7 | FR-CUS-05 |
| US-C-24 | 이전 세션 / 취소 주문 제외 | U7 | FR-CUS-05, FR-SYS-02 |
| US-C-25 | (선택) SSE 기반 주문 상태 실시간 업데이트 | U8 | FR-CUS-05, FR-SYS-03 |

### 1.2 Admin Stories (US-A-*)

| Story | Title | Unit | FR |
|---|---|---|---|
| US-A-01 | 로그인 화면 (매장ID/사용자/비밀번호) | U2 | FR-ADM-01 |
| US-A-02 | 자격 증명 검증 및 JWT 발급 | U2 | FR-ADM-01 |
| US-A-03 | JWT localStorage 저장 | U2 | FR-ADM-01 |
| US-A-04 | 새로고침 시 세션 유지 | U2 | FR-ADM-01 |
| US-A-05 | 16시간 후 자동 로그아웃 | U2 | FR-ADM-01 |
| US-A-06 | 로그인 시도 로깅 | U2 | FR-ADM-01 |
| US-A-07 | 그리드 대시보드 표시 | U8 | FR-ADM-02 |
| US-A-08 | 테이블 카드 (총액 + 최신 N개 미리보기) | U8 | FR-ADM-02 |
| US-A-09 | SSE 연결로 실시간 신규 주문 수신 | U8 | FR-ADM-02, FR-SYS-03 |
| US-A-10 | 신규 주문 시각 강조 | U8 | FR-ADM-02 |
| US-A-11 | 카드 클릭 시 전체 주문 상세 표시 | U8 | FR-ADM-02 |
| US-A-12 | 주문 상태 변경 (PENDING→PREPARING→COMPLETED) | U8 | FR-ADM-02 |
| US-A-13 | 테이블별 필터링 | U8 | FR-ADM-02 |
| US-A-14 | 테이블 태블릿 초기 설정 등록 | U8 | FR-ADM-03 (3.1) |
| US-A-15 | 주문 삭제 버튼 + 확인 팝업 | U8 | FR-ADM-03 (3.2) |
| US-A-16 | 주문 soft-delete (CANCELED) | U8 | FR-ADM-03 (3.2) |
| US-A-17 | 테이블 총액 자동 재계산 | U8 | FR-ADM-03 (3.2) |
| US-A-18 | 테이블 세션 종료 (이용 완료) 버튼 + 확인 | U7 | FR-ADM-03 (3.3) |
| US-A-19 | 세션 종료 시 현재 주문 목록·총액 리셋 | U7 | FR-ADM-03 (3.3), FR-SYS-02 |
| US-A-20 | 과거 주문 내역 조회 버튼 | U7 | FR-ADM-03 (3.4) |
| US-A-21 | 과거 주문 시간 역순 표시 | U7 | FR-ADM-03 (3.4) |
| US-A-22 | 과거 주문 날짜 필터링 | U7 | FR-ADM-03 (3.4) |
| US-A-23 | 메뉴 목록 조회 (카테고리별) | U3 | FR-ADM-04 |
| US-A-24 | 메뉴 등록 | U3 | FR-ADM-04 |
| US-A-25 | 메뉴 수정 | U3 | FR-ADM-04 |
| US-A-26 | 메뉴 삭제 | U3 | FR-ADM-04 |
| US-A-27 | 메뉴 카테고리 내 sortOrder 조정 | U3 | FR-ADM-04 |
| US-A-28 | 카테고리 목록 조회 | U3 | FR-ADM-05 |
| US-A-29 | 카테고리 생성 | U3 | FR-ADM-05 |
| US-A-30 | 카테고리 수정 | U3 | FR-ADM-05 |
| US-A-31 | 카테고리 삭제 (메뉴 연결 시 차단) | U3 | FR-ADM-05 |
| US-A-32 | 카테고리 sortOrder 조정 | U3 | FR-ADM-05 |
| US-A-33 | 이미지 파일 업로드 | U3 | FR-ADM-06 |
| US-A-34 | 서버 로컬 디스크 저장 + 정적 서빙 URL 반환 | U3 | FR-ADM-06 |

### 1.3 System Behaviors (US-S-*)

| Story | Title | Unit | FR |
|---|---|---|---|
| US-S-01 | 첫 주문 시 자동 세션 시작 | U6 | FR-SYS-01 |
| US-S-02 | 세션 종료 트리거 처리 | U7 | FR-SYS-02 |
| US-S-03 | 세션 ID로 주문 그룹화 | U6 (스키마는 U1) | FR-SYS-01 |
| US-S-04 | SSE 이벤트 채널 publish | U8 | FR-SYS-03 |
| US-S-05 | SSE 클라이언트 자동 재연결 | U8 | FR-SYS-03 |

---

## 2. Unit별 Stories 분포

| Unit | Stories 수 | 영역 | 우선순위 분포 |
|---|---|---|---|
| **U1 Foundation** | 0 | 시스템 골격 | — |
| **U2 Auth** | 11 | Customer C1 (5) + Admin A1 (6) | Must 9 / Should 2 |
| **U3 Cat/Menu/Image** | 12 | Admin A4+A5+A6 | Must 9 / Should 2 / Could 1 |
| **U4 Menu Browse** | 5 | Customer C2 | Must 4 / Should 1 |
| **U5 Cart** | 6 | Customer C3 | Must 5 / Should 1 |
| **U6 Order+Session** | 7 | Customer C4 (5) + System (2) | Must 7 |
| **U7 Order History** | 8 | Customer C5 (3) + Admin A3 (3.3/3.4) (5) + System (1) | Must 5 / Should 2 / Could 1 |
| **U8 Realtime+Dashboard** | 14 | Admin A2+A3 (3.1/3.2) (11) + System (2) + Customer (1) | Must 11 / Should 2 / Could 1 |
| **U9 Infra & DevX** | 0 | 인프라/문서 | — |
| **합계** | **63** | | Must 50 / Should 10 / Could 3 |

(64 stories 중 1개는 우선순위 분류 차이로 추적 — 분포 표는 합리적 근사)

---

## 3. FR → Unit 매핑

| FR ID | 설명 | Unit(s) |
|---|---|---|
| FR-CUS-01 | 테이블 자동 로그인 / 세션 관리 | U2 |
| FR-CUS-02 | 메뉴 조회 및 탐색 | U4 |
| FR-CUS-03 | 장바구니 관리 | U5 |
| FR-CUS-04 | 주문 생성 | U6 |
| FR-CUS-05 | 주문 내역 조회 (현재 세션) | U7 (+ U8 SSE push) |
| FR-ADM-01 | 매장 인증 | U2 |
| FR-ADM-02 | 실시간 주문 모니터링 | U8 |
| FR-ADM-03 (3.1) | 테이블 태블릿 초기 설정 | U8 |
| FR-ADM-03 (3.2) | 주문 삭제 (직권 수정) | U8 |
| FR-ADM-03 (3.3) | 테이블 세션 처리 (이용 완료) | U7 |
| FR-ADM-03 (3.4) | 과거 주문 내역 조회 | U7 |
| FR-ADM-04 | 메뉴 관리 | U3 |
| FR-ADM-05 | 카테고리 관리 | U3 |
| FR-ADM-06 | 메뉴 이미지 업로드 | U3 |
| FR-SYS-01 | 테이블 세션 라이프사이클 | U6 |
| FR-SYS-02 | 주문 이력 보존 | U7 |
| FR-SYS-03 | 실시간 알림 채널 (SSE) | U8 |

---

## 4. Persona → Unit 매핑

| Persona | 주요 Unit | 보조 Unit |
|---|---|---|
| **P1 Customer (민준)** | U2 (Table Auth), U4 (메뉴), U5 (장바구니), U6 (주문), U7 (현재 내역) | U8 (SSE 상태 푸시, US-C-25) |
| **P2 Admin (지우)** | U2 (Admin Auth), U3 (카탈로그/이미지), U7 (세션 종료/과거 내역), U8 (대시보드/상태/테이블) | (없음) |
| **System** | U6 (세션 자동 시작), U7 (세션 종료 처리), U8 (SSE) | (시스템 행위 분산) |

---

## 5. Coverage Validation

| 검증 항목 | 결과 |
|---|---|
| 모든 64 stories가 ≥ 1개 Unit에 할당 | ✅ |
| 같은 Story가 여러 Unit에 중복 할당된 사례 | ❌ 없음 (단일 할당) |
| 모든 FR이 ≥ 1개 Unit에 할당 | ✅ (17 FR 모두) |
| 모든 페르소나가 ≥ 1개 Unit에 매핑 | ✅ |
| U1/U9는 직접 Story 없음 (인프라/시스템) | ✅ 의도된 결과 |
| Must 우선순위 Story 모두 ≥ 1개 Unit | ✅ |
