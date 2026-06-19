# 테이블오더 서비스 요구사항 명확화 질문

제공해주신 `requirements/table-order-requirements.md`와 `requirements/constraints.md`를 분석한 결과, 비기능 요구사항·기술 결정·범위 영역에서 명확화가 필요한 항목들이 있습니다.

각 질문의 `[Answer]:` 태그 뒤에 알파벳을 채워주세요. 옵션이 적합하지 않으면 마지막 옵션(Other)을 선택하고 설명을 적어주세요.

답변 완료 시 "완료" 또는 "done"이라고 알려주세요.

---

## Question 1
서비스 운영 범위는 어떻게 가져갈까요? (멀티 매장 SaaS vs 단일 매장)

A) **단일 매장 전용** — 한 매장의 테이블 N개만 운영, 매장 식별자는 고정/단일

B) **소규모 멀티 매장(2~10개)** — 매장별 데이터 격리 / 매장 식별자로 구분, MVP 시점 운영팀이 직접 매장 프로비저닝

C) **본격 멀티 테넌트 SaaS** — 매장 자가 가입·관리, 데이터 격리, 매장 수 제한 없음

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
배포 환경(인프라 타겟)을 어떻게 가져갈까요?

A) **로컬/Docker Compose 단일 머신** — PoC / 시연 위주, 운영 인프라 없음

B) **AWS 클라우드** — ECS/EKS + RDS + CloudFront 등 production-grade

C) **온프레미스 / VM** — 매장 내 또는 사내 서버 직접 배포

D) **클라우드는 미정이지만 컨테이너 기반(Kubernetes/Docker)로 만들어두기** — 인프라 결정 추후

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
프론트엔드 기술 스택은 어떻게 갈까요? (Customer FE + Admin FE)

A) **Next.js (React) + TypeScript** — App Router 권장 (현재 SOCAR/모두의주차장 표준)

B) **순수 React (Vite) + TypeScript** — SSR 불필요, SPA

C) **Vue.js + TypeScript**

D) **Customer는 가벼운 React, Admin은 Next.js** 등 분리 전략

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
백엔드 기술 스택은 어떻게 갈까요?

A) **Node.js + NestJS (TypeScript)** — 현재 사내(모두의주차장) 표준, SSE 지원 우수

B) **Node.js + Express/Fastify (TypeScript)** — 경량

C) **Python + FastAPI**

D) **Java/Kotlin + Spring Boot**

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
데이터 저장소 선택은 어떻게 갈까요?

A) **RDB (PostgreSQL)** — 관계 명확, 트랜잭션, 분석 편의

B) **RDB (MySQL/MariaDB)** — 사내 표준과 일관

C) **NoSQL Document (MongoDB)** — 메뉴/주문 스키마 유연

D) **하이브리드** — 주문/세션은 RDB, 캐시(주문 실시간 큐)는 Redis

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
메뉴 이미지 저장·관리 방식은 어떻게 가져갈까요? (제약사항 문서에 "이미지 리사이징/최적화 제외" 명시됨)

A) **외부 이미지 URL만 입력받음** — 관리자가 이미 호스팅된 이미지 URL 등록, 서버 저장/업로드 없음

B) **서버 업로드 + 로컬 디스크/볼륨 저장** — 서버 파일시스템에 그대로 저장

C) **서버 업로드 + 객체 스토리지(S3/MinIO)** — 원본 그대로 저장 (리사이징 없음)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
**메뉴 카테고리** 관리 범위는 어디까지 가져갈까요? (요구사항에 카테고리 CRUD 명시 없음)

A) **카테고리 마스터 데이터 CRUD 포함** — 관리자가 카테고리 직접 생성/수정/삭제/순서 변경

B) **카테고리는 메뉴의 자유 입력 문자열** — 별도 마스터 테이블 없이 메뉴 등록 시 카테고리명 입력

C) **고정 카테고리 N개 시드** — 시스템에 카테고리 사전 정의, 수정 불가

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
"메뉴 노출 순서 조정"의 범위는 어떻게 정의할까요?

A) **카테고리 내부 메뉴 순서만 조정** (드래그 앤 드롭 또는 sortOrder 필드)

B) **카테고리 순서 + 카테고리 내부 메뉴 순서** 모두 조정

C) **순서 조정 없음** (메뉴 생성 순서 또는 알파벳 순)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
관리자 JWT 토큰 저장 위치 및 보안 정책은 어떻게 가져갈까요?

A) **httpOnly Secure Cookie + CSRF 토큰** (XSS 노출 최소화, 표준 보안 강함)

B) **localStorage / sessionStorage** (구현 단순, XSS 노출 위험)

C) **httpOnly Cookie (개발), localStorage (운영) 등 단순 운영** — 보안 강화는 후속

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 10
관리자 로그인 시도 제한 정책은 어떻게 설정할까요?

A) **계정당 5회 실패 시 15분 잠금** (일반적 OWASP 권장)

B) **IP당 10회/분 rate limit + 계정 잠금** (강화)

C) **시도 횟수 카운트만 로깅, 잠금 없음** — MVP 단순화

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 11
테이블 태블릿(고객용) 자동 로그인 정보 저장 방식 및 보안은?

A) **localStorage에 매장ID + 테이블번호 + 테이블 비밀번호 평문 저장** — 태블릿은 매장 전용 기기 가정, 단순 구현

B) **로그인 성공 시 발급된 long-lived 세션 토큰(테이블 토큰)만 localStorage 저장** — 비밀번호는 저장 X, 토큰 만료 시 재로그인

C) **httpOnly Cookie 기반 테이블 세션 토큰** — 보안 강화

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 12
실시간 SSE 동시 접속/성능 목표는 어떻게 설정할까요?

A) **소규모** — 매장당 동시 관리자 화면 5개 이내, 분당 주문 50건 이내 (MVP)

B) **중규모** — 매장당 관리자 화면 20개, 분당 주문 200건

C) **명확한 목표 없음, 일단 합리적인 디폴트로** — Standard 깊이 NFR에서 결정

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 13
주문 상태 모델 및 전이 정책은?

A) **3-state**: `대기중(PENDING) → 준비중(PREPARING) → 완료(COMPLETED)` — 요구사항 명시 그대로

B) **3-state + `취소(CANCELED)`** — 관리자 "주문 삭제"를 soft-delete(취소) 상태로 관리

C) **3-state + `삭제(DELETED)` hard delete** — 삭제는 즉시 DB 제거

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 14
통화·언어 단위는 어떻게 가져갈까요?

A) **단일 통화(KRW) + 단일 언어(한국어)** — 다국어/다통화 미지원 (constraints와 일치)

B) **단일 통화(KRW) + 한국어, 다만 i18n 구조는 미리 잡아둠** — 추후 확장 용이

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 15
테스트 전략 범위는 어디까지 가져갈까요? (Build & Test 단계 입력)

A) **단위 + 통합 + E2E 모두** — 핵심 플로우 E2E 포함 (Playwright 권장)

B) **단위 + 통합** — E2E는 후속

C) **단위 + 핵심 통합만** — 최소 안전망

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 16: Security Extensions
보안 baseline rule을 강제 적용할까요?

**설명**: 활성화 시 인증, 입력 검증, 비밀 관리, 권한 관리 등 보안 best practice가 차단 제약(blocking constraint)으로 적용됩니다.

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 17: Resiliency Extensions
회복탄력성(resiliency) baseline을 적용할까요?

**설명**: AWS Well-Architected Reliability Pillar 기반 directional best practice. fault tolerance, HA, observability, recoverability 설계 가이드 적용. **production 보증이 아니라 design-time 가이드**입니다.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 18: Property-Based Testing Extension
Property-Based Testing(PBT) rule을 강제 적용할까요?

**설명**: 비즈니스 로직, 데이터 변환, 직렬화, stateful 컴포넌트에 대한 속성 기반 테스트. fast-check(JS) 등 사용.

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## 답변 완료 후
모든 `[Answer]:` 태그를 채우신 후 "완료" 또는 "done"이라고 알려주세요. 답변 분석 후 모순/모호 항목이 있으면 추가 질문을 드리고, 없으면 `requirements.md` 작성으로 진행합니다.
