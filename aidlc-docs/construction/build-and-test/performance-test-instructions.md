# Performance Test Instructions

**범위**: MVP — 경량 spot check (G7). 본격 부하 테스트는 미적용(Resiliency baseline OFF, Q17=B).

## 성능 기준 (요구사항)

| 항목 | 목표 |
|---|---|
| 신규 주문 → Admin 대시보드 반영 | ≤ 2초 (폴링 주기 `refetchInterval: 2000`) — G7 |
| API 응답시간 | PoC 수준, 단일 매장 트래픽 |

## Spot Check 절차 (수동)

```bash
docker compose up -d --build
# 1) Customer 주문 생성 (또는 POST /orders)
# 2) Admin 대시보드(:3001)에서 신규 주문이 ≤2초 내 표시되는지 측정
```

## 후속 (필요 시)

- k6 / autocannon 으로 `GET /tables/summary`, `POST /orders` 처리량 측정
- 폴링 부하: Admin N탭 × 2초 주기 → backend QPS 추정

> 본 단계는 측정 **지침**만 제공. 자동 부하 스크립트는 미작성 (MVP 범위 외).
