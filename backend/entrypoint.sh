#!/bin/sh
set -e

# ==============================================================================
# PocketBase Docker Entrypoint Script
# ==============================================================================

PORT="${PORT:-8090}"
DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"

mkdir -p "$DATA_DIR"

# 1. Tự động khởi tạo tài khoản Superuser Admin nếu được cấu hình qua ENV
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  echo "[PocketBase Entrypoint] Checking/Creating initial superuser: $PB_ADMIN_EMAIL..."
  /pb/pocketbase admin create "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir="$DATA_DIR" 2>/dev/null || true
fi

# 2. Khởi chạy PocketBase Web Server gắn với địa chỉ 0.0.0.0 và PORT Render
echo "[PocketBase Entrypoint] Starting PocketBase on 0.0.0.0:$PORT with data directory: $DATA_DIR..."
exec /pb/pocketbase serve --http="0.0.0.0:$PORT" --dir="$DATA_DIR"
