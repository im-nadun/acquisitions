#!/bin/sh
set -e

echo "🔄 Starting application..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
max_retries=30
retry_count=0

until node -e "
  import { neon } from '@neondatabase/serverless';
  const sql = neon(process.env.DATABASE_URL);
  sql\`SELECT 1\`.then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null || [ $retry_count -eq $max_retries ]; do
  retry_count=$((retry_count + 1))
  echo "Database not ready yet (attempt $retry_count/$max_retries)..."
  sleep 2
done

if [ $retry_count -eq $max_retries ]; then
  echo "❌ Failed to connect to database after $max_retries attempts"
  exit 1
fi

echo "✅ Database connection established"

# Run migrations if in development or if SKIP_MIGRATIONS is not set
if [ "$NODE_ENV" = "development" ] || [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📜 Running database migrations..."
  npm run db:migrate || {
    echo "⚠️  Migration failed, but continuing..."
  }
fi

# Execute the main command
echo "🚀 Starting application server..."
exec "$@"
