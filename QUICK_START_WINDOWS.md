# Quick Start Guide (Windows)

This is a simplified guide for getting started with Docker on Windows.

## Prerequisites

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Ensure Docker Desktop is running (check system tray)

## Development Setup (5 minutes)

### Step 1: Configure Neon Credentials

1. Copy the development environment template:

```powershell
Copy-Item .env.development .env
```

2. Edit `.env` file and replace placeholders:
   - `NEON_API_KEY` - Get from: https://console.neon.tech/app/settings/api-keys
   - `NEON_PROJECT_ID` - Get from: Project Settings → General

### Step 2: Start Development Environment

```powershell
docker-compose -f docker-compose.dev.yml up
```

That's it! Your app is now running with Neon Local at:

- **App:** http://localhost:3000
- **Database:** Ephemeral branch (auto-created)

### Step 3: Stop Development Environment

Press `Ctrl+C` in the terminal, then:

```powershell
docker-compose -f docker-compose.dev.yml down
```

## Production Setup

### Step 1: Configure Production Database

1. Copy production template:

```powershell
Copy-Item .env.production .env
```

2. Edit `.env` and set your Neon Cloud database URL:

```env
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/dbname?sslmode=require
```

### Step 2: Start Production

```powershell
docker-compose -f docker-compose.prod.yml up --build -d
```

### Step 3: View Logs

```powershell
docker-compose -f docker-compose.prod.yml logs -f app
```

### Step 4: Stop Production

```powershell
docker-compose -f docker-compose.prod.yml down
```

## Common Commands (Windows PowerShell)

```powershell
# Development
docker-compose -f docker-compose.dev.yml up           # Start
docker-compose -f docker-compose.dev.yml up -d        # Start in background
docker-compose -f docker-compose.dev.yml logs -f      # View logs
docker-compose -f docker-compose.dev.yml down         # Stop

# Production
docker-compose -f docker-compose.prod.yml up -d --build  # Build & start
docker-compose -f docker-compose.prod.yml logs -f app    # View logs
docker-compose -f docker-compose.prod.yml down           # Stop

# Database migrations (dev)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access container shell
docker-compose -f docker-compose.dev.yml exec app sh
```

## Troubleshooting

### Docker Desktop not starting

- Open Docker Desktop manually from Start Menu
- Wait for "Docker Desktop is running" notification

### Port 5432 already in use

- Stop any local PostgreSQL services
- Or change port in `docker-compose.dev.yml`: `- '5433:5432'`

### Cannot connect to database

- Ensure Docker containers are running: `docker ps`
- Check logs: `docker-compose -f docker-compose.dev.yml logs neon-local`

## Need More Help?

See full documentation: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
