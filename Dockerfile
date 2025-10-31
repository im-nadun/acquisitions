# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./

# Stage 2: Development dependencies
FROM base AS deps
RUN npm ci

# Stage 3: Production dependencies
FROM base AS production-deps
RUN npm ci --omit=dev

# Stage 4: Development image
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create entrypoint script inline to avoid Windows line ending issues
RUN printf '#!/bin/sh\n\
set -e\n\
echo "Starting application..."\n\
echo "Waiting for database connection..."\n\
retry_count=0\n\
max_retries=30\n\
while [ $retry_count -lt $max_retries ]; do\n\
  if nc -z neon-local 5432 2>/dev/null; then\n\
    echo "Database connection established"\n\
    break\n\
  fi\n\
  retry_count=$((retry_count + 1))\n\
  echo "Database not ready yet (attempt $retry_count/$max_retries)..."\n\
  sleep 2\n\
done\n\
if [ $retry_count -eq $max_retries ]; then\n\
  echo "Failed to connect to database"\n\
  exit 1\n\
fi\n\
if [ "$NODE_ENV" = "development" ] || [ "$RUN_MIGRATIONS" = "true" ]; then\n\
  echo "Running database migrations..."\n\
  npm run db:migrate || echo "Migration failed, but continuing..."\n\
fi\n\
echo "Starting application server..."\n\
exec "$@"\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    apk add --no-cache netcat-openbsd

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Stage 5: Production image
FROM base AS production
ENV NODE_ENV=production
COPY --from=production-deps /app/node_modules ./node_modules
COPY . .

# Create entrypoint script for production (no database wait needed for cloud)
RUN printf '#!/bin/sh\n\
set -e\n\
echo "Starting production application..."\n\
if [ "$RUN_MIGRATIONS" = "true" ]; then\n\
  echo "Running database migrations..."\n\
  npm run db:migrate || echo "Migration failed, but continuing..."\n\
fi\n\
echo "Starting application server..."\n\
exec "$@"\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
