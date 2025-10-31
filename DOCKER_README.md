# Docker Setup Guide - Acquisitions App with Neon Database

Complete guide for running the Acquisitions application in Docker with Neon Database support for both development and production environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## 🎯 Overview

This application uses:
- **Development**: Neon Local (ephemeral database branches for local testing)
- **Production**: Neon Cloud Database (managed PostgreSQL)
- **Multi-stage Docker builds** for optimized images
- **Health checks** for reliability
- **Hot reload** in development mode

## ✅ Prerequisites

- Docker Desktop installed and running
- Neon account with API credentials ([console.neon.tech](https://console.neon.tech))
- Node.js 20+ (for local development outside Docker)
- Git (for version control integration with Neon Local)

## 🔧 Development Environment

### Setup Steps

1. **Configure environment variables**
   
   Copy and update `.env.development` with your Neon credentials:
   ```bash
   # Already configured in .env.development
   NEON_API_KEY=your_api_key_here
   NEON_PROJECT_ID=your_project_id_here
   PARENT_BRANCH_ID=your_branch_id_here
   ```

2. **Start development environment**
   
   ```bash
   npm run dev:docker
   ```

   Or manually:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - Database: `postgres://neon:npg@localhost:5432/neondb`
   - Health check: http://localhost:3000/health

### Development Features

✅ **Neon Local Integration**
- Automatically creates ephemeral database branches
- Branches tied to your Git branch (optional)
- Auto-cleanup on container shutdown (configurable)

✅ **Hot Reload**
- Source code mounted as volume
- Changes reflect immediately without rebuild
- Node.js `--watch` mode enabled

✅ **Database Migrations**
- Automatically run on container startup
- Using Drizzle ORM
- Safe failure handling (continues if migrations fail)

### Development Commands

```bash
# Start containers in detached mode
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml logs -f neon-local

# Stop containers
docker compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml up --build

# Check container status
docker compose -f docker-compose.dev.yml ps
```

## 🚀 Production Environment

### Setup Steps

1. **Configure production environment**
   
   Update `.env.production` with your Neon Cloud connection string:
   ```bash
   # Get from: https://console.neon.tech/app/projects -> Your Project -> Connection Details
   DATABASE_URL=postgresql://user:password@your-project.neon.tech/dbname?sslmode=require
   ```

   ⚠️ **IMPORTANT**: In real production, use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)

2. **Build and run production**
   
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

3. **Verify deployment**
   ```bash
   # Check container status
   docker compose -f docker-compose.prod.yml ps
   
   # Check logs
   docker compose -f docker-compose.prod.yml logs -f
   
   # Test health endpoint
   curl http://localhost:3000/health
   ```

### Production Features

✅ **Optimized Build**
- Multi-stage build with production dependencies only
- Smaller image size
- No dev dependencies included

✅ **Health Checks**
- Automatic health monitoring
- Restart on failure
- Integration with orchestration platforms

✅ **Security**
- NODE_ENV=production
- Minimal attack surface
- No source code mounting

### Production Commands

```bash
# Start production containers
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop containers
docker compose -f docker-compose.prod.yml down

# Scale (if needed)
docker compose -f docker-compose.prod.yml up -d --scale app=3
```

## 🌍 Environment Variables

### Development (`.env.development`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `LOG_LEVEL` | Logging verbosity | `debug` |
| `DATABASE_URL` | Database connection | `postgres://neon:npg@neon-local:5432/neondb` |
| `NEON_API_KEY` | Neon API key | `napi_...` |
| `NEON_PROJECT_ID` | Neon project ID | `round-wind-...` |
| `PARENT_BRANCH_ID` | Branch to fork from | `br-jolly-block-...` |
| `DELETE_BRANCH` | Auto-delete branches | `true` |

### Production (`.env.production`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `DATABASE_URL` | Neon Cloud connection | `postgresql://...neon.tech/dbname` |
| `RUN_MIGRATIONS` | Run migrations on startup | `true` (optional) |

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check Docker is running
docker info

# View detailed logs
docker compose -f docker-compose.dev.yml logs --tail=100

# Remove and rebuild
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up --build --force-recreate
```

### Database Connection Issues

```bash
# Check Neon Local is healthy
docker compose -f docker-compose.dev.yml ps

# Test database connection
docker compose -f docker-compose.dev.yml exec neon-local psql -U neon -d neondb -c 'SELECT 1'

# Check network
docker network inspect acquisitions_app-network
```

### Migration Failures

- Migrations are non-blocking (app continues on failure)
- Check DATABASE_URL format (use `postgres://` not websockets for Neon Local)
- Verify migration files exist in `./drizzle` directory
- Run migrations manually:
  ```bash
  docker compose -f docker-compose.dev.yml exec app npm run db:migrate
  ```

### Port Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Change port in docker-compose.*.yml
# ports:
#   - '3001:3000'  # Map to different host port
```

### Hot Reload Not Working

- Ensure source code is mounted correctly
- Check volume mounts in `docker-compose.dev.yml`
- Verify `node --watch` is supported in Node 20+
- Restart container: `docker compose -f docker-compose.dev.yml restart app`

## 🏗️ Architecture

### Development Stack

```
┌─────────────────────────────────────────────┐
│           Docker Host (Windows)             │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │     acquisitions-app-dev              │ │
│  │     - Node.js 20 Alpine               │ │
│  │     - Hot reload enabled              │ │
│  │     - Source mounted as volume        │ │
│  │     - Port 3000:3000                  │ │
│  │     - Health checks                   │ │
│  └───────────────┬───────────────────────┘ │
│                  │ Docker Network          │
│                  │ (app-network)           │
│  ┌───────────────▼───────────────────────┐ │
│  │     acquisitions-neon-local           │ │
│  │     - Neon Local Proxy                │ │
│  │     - Ephemeral branches              │ │
│  │     - Port 5432:5432                  │ │
│  │     - Git integration                 │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Production Stack

```
┌─────────────────────────────────────────────┐
│        Production Environment               │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │     acquisitions-app-prod             │ │
│  │     - Node.js 20 Alpine               │ │
│  │     - Optimized build                 │ │
│  │     - Production deps only            │ │
│  │     - Port 3000:3000                  │ │
│  │     - Health checks                   │ │
│  └───────────────┬───────────────────────┘ │
│                  │                         │
│                  │ HTTPS/TLS               │
│                  ▼                         │
│         ┌─────────────────┐                │
│         │  Neon Cloud DB  │                │
│         │  (neon.tech)    │                │
│         └─────────────────┘                │
└─────────────────────────────────────────────┘
```

### Dockerfile Stages

1. **base**: Base image with package.json copied
2. **deps**: Full dependencies (dev + prod)
3. **production-deps**: Production dependencies only
4. **development**: Development image with hot reload
5. **production**: Optimized production image

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Guide](https://neon.tech/docs/local/neon-local)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Verify environment variables are set correctly
3. Ensure Docker has sufficient resources (RAM/CPU)
4. Check firewall/antivirus isn't blocking Docker ports
5. Review Neon console for API/branch issues

---

**Last Updated**: 2025-10-31  
**Docker Version**: 20.10+  
**Node Version**: 20.19.5
