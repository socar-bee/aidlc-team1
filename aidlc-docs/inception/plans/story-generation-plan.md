# User Stories — Generation Plan & Questions

이 문서는 두 파트로 구성됩니다.
- **Part 1 (현재)**: Story 생성 방법론 결정을 위한 질문 + 실행 체크리스트
- **Part 2 (승인 후)**: 이 체크리스트를 따라 `stories.md` / `personas.md` 생성

먼저 **5개 질문**에 답변해주세요. 답변 완료 후 "완료" 또는 "done" 알려주세요.

---

## Part 1: Planning Questions

### Question 1: 페르소나 세분화 수준
어디까지 세분화할까요?

A) **2개 페르소나**: Customer(고객) / Admin(매장 운영자) — 단순, MVP에 충분

B) **3개 페르소나**: Customer / Store Owner(점주) / Part-time Staff(아르바이트) — Admin을 세분화하여 책임/숙련도 차이 반영

C) **4개 페르소나**: Customer / Store Owner / Part-time Staff / System Operator(운영팀 — 매장 프로비저닝) — 운영자 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: 스토리 그래뉼래러티(크기)
스토리를 어떤 크기로 쪼갤까요?

A) **Feature-level (큰 단위)**: 기능 단위 1개 = 스토리 1개 (예: "메뉴를 조회한다") — 스토리 ≈ 15~20개

B) **Capability-level (중간 단위)**: 하위 행동까지 분리 (예: "메뉴를 카테고리별로 본다", "메뉴 상세를 본다" 분리) — 스토리 ≈ 25~35개

C) **Task-level (작은 단위)**: 모든 인터랙션 단위 (예: "카테고리 탭을 누르면 해당 카테고리 메뉴만 보인다") — 스토리 ≈ 40~60개

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 3: 스토리 breakdown 방식 (조직화)
스토리를 어떻게 그룹핑할까요?

A) **Persona-based**: 페르소나별 섹션(Customer / Admin / System) — 추후 Unit 분할 시 페르소나 단위 응답성 비교 쉬움

B) **User Journey-based**: 워크플로우 순서(태블릿 셋업 → 주문 → 상태 변경 → 세션 종료) — Journey 흐름 추적 좋음

C) **Feature-based**: 기능 영역별(인증 / 메뉴 / 주문 / 세션 / 모니터링) — 후속 Unit 분할과 1:1 매핑 가장 자연스러움

D) **하이브리드**: Persona 1차 그룹 + 내부에서 Feature 2차 그룹

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4: Acceptance Criteria 포맷
스토리당 수용 기준은 어떤 형식으로 작성할까요?

A) **Given-When-Then (Gherkin 스타일)**: 시나리오 명확, Playwright E2E와 직결 가능 — 작성 비용 ↑

B) **체크리스트형**: 검증 항목 bullet 나열 — 가독성 높고 작성 부담 ↓

C) **혼합**: 핵심 happy-path는 Given-When-Then, 부가 조건은 체크리스트

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 5: 스토리 우선순위/사이즈 표기
스토리에 우선순위 / 추정 사이즈를 함께 표기할까요?

A) **MoSCoW(Must/Should/Could/Won't) + T-shirt size(S/M/L)** — 후속 Workflow Planning / Units Generation 입력으로 활용

B) **MoSCoW만** — 우선순위만 표기, 사이즈는 후속 단계에서 결정

C) **표기 없음** — 단순화, 모든 스토리 동일 처리

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 답변 완료 후
모든 `[Answer]:` 태그를 채운 후 "완료" 또는 "done" 알려주세요. 답변 분석 후 모호 항목 있으면 follow-up, 없으면 아래 Part 2 체크리스트를 그대로 실행합니다.

---

## Part 2: Generation Checklist (승인 후 실행)

다음 체크리스트는 답변 기반으로 보정되며, 사용자 승인 후 순차 실행됩니다.

- [x] requirements.md의 모든 FR(FR-CUS-01~05, FR-ADM-01~06, FR-SYS-01~03)을 user story로 변환
- [x] 답변된 페르소나 수(2개)에 맞춰 `personas.md` 작성 (Customer 민준 / Admin 지우)
- [x] Task-level(Q2=C) 기준으로 story 분할 → 64개 (C 25 + A 34 + System 5)
- [x] Persona-based(Q3=A) 섹션 구성 + System Behaviors 부록
- [x] 각 story에 INVEST 검토 통합 적용 (도큐 상단 요약)
- [x] 각 story 형식: "As a [persona], I want [capability], so that [value]"
- [x] Acceptance Criteria 혼합(Q4=C) — 핵심 happy-path G-W-T + 부가 체크리스트
- [x] MoSCoW 우선순위(Q5=B) 표기 — Must 41 / Should 17 / Could 4
- [x] FR ID ↔ story ID traceability 매트릭스 작성
- [x] persona → story 매핑 표 작성
- [x] `stories.md` / `personas.md` 저장 완료
- [x] aidlc-state.md User Stories 단계 진행 표시
