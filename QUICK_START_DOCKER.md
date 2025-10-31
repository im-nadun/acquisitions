# Quick Start - Docker Setup

Get your Acquisitions app running in Docker in 5 minutes.

## 🚀 Development (Local)

### 1. Prerequisites
- ✅ Docker Desktop running
- ✅ Neon account and API key from [console.neon.tech](https://console.neon.tech)

### 2. Configure Environment

Update `.env.development` with your Neon credentials:
```bash
NEON_API_KEY=your_neon_api_key
NEON_PROJECT_ID=your_project_id
PARENT_BRANCH_ID=your_branch_id
```

### 3. Start Development

```bash
npm run dev:docker
```

**That's it!** Your app is now running:
- 🌐 Application: http://localhost:3000
- ❤️ Health check: http://localhost:3000/health
- 🗄️ Database: `postgres://neon:npg@localhost:5432/neondb`

### 4. View Logs

```bash
docker compose -f docker-compose.dev.yml logs -f app
```

### 5. Stop

Press `Ctrl+C` or run:
```bash
docker compose -f docker-compose.dev.yml down
```

---

## 🌍 Production (Cloud)

### 1. Configure Production Database

Update `.env.production` with your Neon Cloud connection string:
```bash
DATABASE_URL=postgresql://user:password@your-project.neon.tech/dbname?sslmode=require
```

### 2. Start Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Verify

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# Test application
curl http://localhost:3000/health
```

### 4. Stop

```bash
docker compose -f docker-compose.prod.yml down
```

---

## 🔧 Common Commands

| Task | Command |
|------|---------|
| **Start dev** | `npm run dev:docker` |
| **Start prod** | `docker compose -f docker-compose.prod.yml up -d` |
| **View logs** | `docker compose -f docker-compose.dev.yml logs -f` |
| **Stop all** | `docker compose -f docker-compose.dev.yml down` |
| **Rebuild** | `docker compose -f docker-compose.dev.yml up --build` |
| **Check status** | `docker compose -f docker-compose.dev.yml ps` |

---

## 🆘 Troubleshooting

### Can't connect to database?
```bash
# Restart containers
docker compose -f docker-compose.dev.yml restart
```

### Port 3000 already in use?
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Or change the port in docker-compose.dev.yml
```

### Need fresh start?
```bash
# Remove everything and start over
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

---

For detailed documentation, see [DOCKER_README.md](./DOCKER_README.md)
