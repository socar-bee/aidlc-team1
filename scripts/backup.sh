#!/usr/bin/env bash
# Docker named volume 백업 (mysql-data / image-uploads)
# 사용: ./scripts/backup.sh [출력디렉토리]   (기본: ./backups)
set -euo pipefail

OUT_DIR="${1:-./backups}"
PROJECT="${COMPOSE_PROJECT_NAME:-aidlc-modu}"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "[backup] mysql-data → $OUT_DIR/mysql-data-$STAMP.tgz"
docker run --rm \
  -v "${PROJECT}_mysql-data:/data:ro" \
  -v "$(pwd)/$OUT_DIR:/backup" \
  alpine tar czf "/backup/mysql-data-$STAMP.tgz" -C /data .

echo "[backup] image-uploads → $OUT_DIR/image-uploads-$STAMP.tgz"
docker run --rm \
  -v "${PROJECT}_image-uploads:/data:ro" \
  -v "$(pwd)/$OUT_DIR:/backup" \
  alpine tar czf "/backup/image-uploads-$STAMP.tgz" -C /data .

echo "[backup] done."
