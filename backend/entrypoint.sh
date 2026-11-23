#!/bin/sh
set -e

# ==============================================================================
# PocketBase Docker Entrypoint Script
# ==============================================================================

PORT="${PORT:-8090}"
DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"
PB_ADMIN_EMAIL="${PB_ADMIN_EMAIL:-admin@demo.local}"
PB_ADMIN_PASSWORD="${PB_ADMIN_PASSWORD:-Admin@123456}"

mkdir -p "$DATA_DIR"

# 1. Tự động áp dụng các migrations cơ sở dữ liệu trước khi khởi động
echo "[PocketBase Entrypoint] Initializing database migrations..."
/pb/pocketbase migrate up --dir="$DATA_DIR" || true

# 2. Tự động khởi tạo tài khoản Superuser Admin nếu được cấu hình qua ENV
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  echo "[PocketBase Entrypoint] Checking/Creating initial superuser: $PB_ADMIN_EMAIL..."
  /pb/pocketbase admin create "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir="$DATA_DIR" 2>/dev/null || true
fi

# 3. Khởi chạy PocketBase Web Server ở chế độ nền
echo "[PocketBase Entrypoint] Starting PocketBase on 0.0.0.0:$PORT with data directory: $DATA_DIR..."
/pb/pocketbase serve --http="0.0.0.0:$PORT" --dir="$DATA_DIR" &
PB_PID=$!

# 4. Tự động kiểm tra và seed dữ liệu mẫu lần đầu
if [ -f "/pb/seed.js" ]; then
  echo "[PocketBase Entrypoint] Waiting for PocketBase to be healthy before seeding..."
  for i in $(seq 1 30); do
    if curl -s "http://127.0.0.1:$PORT/api/health" | grep -q "API is healthy"; then
      # Đảm bảo admin user tồn tại sau khi serve
      if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
        /pb/pocketbase admin create "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir="$DATA_DIR" 2>/dev/null || true
      fi
      echo "[PocketBase Entrypoint] Server is healthy. Running automated database seed..."
      PB_URL="http://127.0.0.1:$PORT" PB_ADMIN_EMAIL="$PB_ADMIN_EMAIL" PB_ADMIN_PASSWORD="$PB_ADMIN_PASSWORD" node /pb/seed.js || echo "[PocketBase Entrypoint] Seed script finished with non-fatal notice."
      break
    fi
    sleep 1
  done
fi

echo "[PocketBase Entrypoint] PocketBase is running and ready for traffic (PID: $PB_PID)."
wait $PB_PID
