# Docker Setup Guide for Acquisitions App

This guide explains how to run the application using Docker with different configurations for development and production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Development Setup (Neon Local)](#development-setup-neon-local)
- [Production Setup (Neon Cloud)](#production-setup-neon-cloud)
- [Environment Variables](#environment-variables)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

1. **Docker & Docker Compose** installed on your system
   - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Neon Account** with an existing project
   - Sign up at [neon.tech](https://neon.tech)
   - Create a project and note your Project ID

3. **Neon API Key**
   - Generate from [Neon Console](https://console.neon.tech/app/settings/api-keys)

---

## Architecture Overview

### Development Environment
```
┌─────────────────┐         ┌──────────────────┐
│   Application   │────────▶│   Neon Local     │
│   Container     │         │   Proxy          │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Neon Cloud      │
                            │  (Ephemeral      │
                            │   Branch)        │
                            └──────────────────┘
```

- **Neon Local** creates ephemeral database branches automatically
- Each container start = fresh database branch
- Container stop = branch is deleted automatically
- No manual cleanup required

### Production Environment
```
┌─────────────────┐
│   Application   │
│   Container     │
└─────────────────┘
         │
         ▼
┌──────────────────┐
│  Neon Cloud      │
│  (Production DB) │
└──────────────────┘
```

- Direct connection to Neon Cloud
- No local proxy
- Uses production database URL

---

## Development Setup (Neon Local)

### Step 1: Configure Environment Variables

Copy the development environment template:

```bash
cp .env.development .env
```

Edit `.env` and set your Neon credentials:

```env
# Required: Get from https://console.neon.tech/app/settings/api-keys
NEON_API_KEY=neon_api_xxxxxxxxxxxxxxxxxxxxx

# Required: Get from Project Settings → General
NEON_PROJECT_ID=your-project-id-here

# Optional: Specify parent branch (leave empty for default branch)
PARENT_BRANCH_ID=

# Optional: Set to false to keep branches after shutdown
DELETE_BRANCH=true
```

### Step 2: Start the Development Environment

```bash
docker-compose -f docker-compose.dev.yml up
```

Or run in detached mode:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Step 3: Verify Services

Check that both services are running:

```bash
docker-compose -f docker-compose.dev.yml ps
```

You should see:
- `acquisitions-neon-local` (Neon Local proxy)
- `acquisitions-app-dev` (Application)

### Step 4: Access the Application

- **Application:** http://localhost:3000
- **Database:** `postgres://neon:npg@localhost:5432/neondb?sslmode=require`

### Step 5: View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f neon-local
```

### Step 6: Stop the Environment

```bash
docker-compose -f docker-compose.dev.yml down
```

**Note:** By default, the ephemeral database branch is automatically deleted when containers stop.

---

## Production Setup (Neon Cloud)

### Step 1: Configure Environment Variables

Create a production environment file:

```bash
cp .env.production .env
```

Edit `.env` and set your production database URL:

```env
NODE_ENV=production
LOG_LEVEL=info
PORT=3000

# Your actual Neon Cloud connection string
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/dbname?sslmode=require
```

**⚠️ Security Warning:** Never commit `.env` with real credentials to version control!

### Step 2: Build and Start Production Container

```bash
docker-compose -f docker-compose.prod.yml up --build
```

Or in detached mode:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 3: Verify Deployment

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f app
```

### Step 4: Stop Production Environment

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Environment Variables

### Development Variables (`.env.development`)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEON_API_KEY` | ✅ Yes | Your Neon API key | - |
| `NEON_PROJECT_ID` | ✅ Yes | Your Neon project ID | - |
| `PARENT_BRANCH_ID` | ❌ No | Parent branch for ephemeral branches | Default branch |
| `DELETE_BRANCH` | ❌ No | Delete branch on container stop | `true` |
| `DATABASE_URL_DEV` | ❌ No | Database connection string | Auto-configured |
| `PORT` | ❌ No | Application port | `3000` |
| `LOG_LEVEL` | ❌ No | Logging level | `debug` |

### Production Variables (`.env.production`)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | Neon Cloud database URL | - |
| `NODE_ENV` | ✅ Yes | Environment name | `production` |
| `PORT` | ❌ No | Application port | `3000` |
| `LOG_LEVEL` | ❌ No | Logging level | `info` |

---

## Common Commands

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Execute command in app container
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access app shell
docker-compose -f docker-compose.dev.yml exec app sh
```

### Production

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart app
docker-compose -f docker-compose.prod.yml restart app
```

### Database Migrations

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Production
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

---

## Troubleshooting

### Issue: Neon Local container fails to start

**Solution:** Verify your credentials in `.env`:
```bash
# Check if environment variables are loaded
docker-compose -f docker-compose.dev.yml config
```

### Issue: Application can't connect to database

**Development:**
- Ensure `DATABASE_URL_DEV` uses `neon-local` as hostname (not `localhost`)
- Check Neon Local health: `docker-compose -f docker-compose.dev.yml logs neon-local`

**Production:**
- Verify `DATABASE_URL` is correct and accessible
- Check network connectivity to Neon Cloud

### Issue: Port 5432 already in use

**Solution:** Stop local PostgreSQL or change the port mapping:
```yaml
# In docker-compose.dev.yml
ports:
  - '5433:5432'  # Use 5433 on host, 5432 in container
```

### Issue: Self-signed certificate errors (JavaScript apps)

If using `pg` or `postgres` library, add to your database connection config:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

### Issue: Git branch detection not working on Mac

If using Docker Desktop for Mac, ensure VM settings use **gRPC FUSE** instead of **VirtioFS**.

### Issue: Persistent branches not being created

Verify the volume mounts in `docker-compose.dev.yml` and check `.neon_local/` directory exists.

---

## Best Practices

1. **Never commit `.env` files** with real credentials
2. **Use `.env.example`** as a template for required variables
3. **In production**, inject secrets via:
   - Docker secrets
   - Environment variables from CI/CD
   - Cloud provider secret managers (AWS Secrets Manager, Azure Key Vault, etc.)
4. **Add `.neon_local/`** to `.gitignore` to avoid committing database metadata
5. **Use health checks** to ensure services are ready before connections
6. **Monitor logs** regularly in production

---

## Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon API Keys](https://console.neon.tech/app/settings/api-keys)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Neon Console](https://console.neon.tech/)

---

## Support

For issues related to:
- **Neon Local/Cloud:** [Neon Discord](https://discord.gg/neon)
- **Application:** Open an issue in the repository
