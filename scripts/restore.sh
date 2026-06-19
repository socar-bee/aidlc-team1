#!/usr/bin/env bash
# Docker named volume 복원
# 사용: ./scripts/restore.sh <mysql-data.tgz> <image-uploads.tgz>
# 주의: 복원 전 docker compose down 권장 (실행 중 복원 금지)
set -euo pipefail

MYSQL_TGZ="${1:?mysql-data tgz 경로 필요}"
IMAGES_TGZ="${2:?image-uploads tgz 경로 필요}"
PROJECT="${COMPOSE_PROJECT_NAME:-aidlc-modu}"

echo "[restore] mysql-data ← $MYSQL_TGZ"
docker run --rm \
  -v "${PROJECT}_mysql-data:/data" \
  -v "$(pwd)/$(dirname "$MYSQL_TGZ"):/backup" \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/$(basename "$MYSQL_TGZ") -C /data"

echo "[restore] image-uploads ← $IMAGES_TGZ"
docker run --rm \
  -v "${PROJECT}_image-uploads:/data" \
  -v "$(pwd)/$(dirname "$IMAGES_TGZ"):/backup" \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/$(basename "$IMAGES_TGZ") -C /data"

echo "[restore] done. docker compose up -d 로 재기동."
