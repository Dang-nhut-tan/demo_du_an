# ==============================================================================
# Dockerfile for PocketBase Backend - U&I Logistics
# Optimized for Linux x86_64 container deployment on Render Web Service
# ==============================================================================
FROM alpine:3.20

ARG PB_VERSION=0.22.21

# Install runtime dependencies: ca-certificates for HTTPS, curl for healthcheck, unzip, nodejs for auto-seed
RUN apk add --no-cache \
    unzip \
    ca-certificates \
    curl \
    wget \
    tini \
    nodejs

WORKDIR /pb

# Download official PocketBase release matching development version 0.22.21
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb/ \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x /pb/pocketbase

# Copy PocketBase JavaScript migrations
COPY pb_migrations /pb/pb_migrations

# Copy automated seed script
COPY seed.js /pb/seed.js

# Copy startup entrypoint script
COPY entrypoint.sh /pb/entrypoint.sh
RUN chmod +x /pb/entrypoint.sh

# Render provides dynamic port via $PORT environment variable. Default to 8090.
EXPOSE 8090

# Health check using PocketBase built-in /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-8090}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/pb/entrypoint.sh"]
