# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- **Start development server**: `npm run dev` - Starts the server with Node.js watch mode
- **Start production server**: `npm start` - Runs server.js directly
- **Linting**: `npm run lint` - Run ESLint
- **Fix linting issues**: `npm run lint:fix` - Auto-fix ESLint issues
- **Format code**: `npm run format` - Format with Prettier
- **Check formatting**: `npm run format:check` - Verify Prettier formatting

### Database Operations
- **Generate migrations**: `npm run db:generate` - Generate Drizzle migrations
- **Run migrations**: `npm run db:migrate` - Apply database migrations
- **Database studio**: `npm run db:studio` - Launch Drizzle Studio for database management

## Architecture Overview

### Project Structure
This is a Node.js Express API built with ES modules, using:
- **Database**: PostgreSQL with Neon serverless driver and Drizzle ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Validation**: Zod schemas for request validation
- **Logging**: Winston for structured logging

### Module System
The project uses Node.js import maps for clean path resolution:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

### Key Components

#### Entry Points
- `src/index.js` - Main entry point that loads environment and starts server
- `src/server.js` - HTTP server setup
- `src/app.js` - Express application configuration with middleware and routes

#### Database Layer
- `src/config/database.js` - Neon PostgreSQL connection and Drizzle setup
- `src/models/user.model.js` - Drizzle schema definitions (currently only users table)

#### Authentication Flow
- Uses JWT tokens stored in HTTP-only cookies for security
- Password hashing with bcrypt (10 salt rounds)
- Zod validation schemas for request data
- Role-based access (user/admin roles)

#### Utilities
- `src/utils/jwt.js` - JWT token generation and verification
- `src/utils/cookies.js` - Cookie management utilities with security defaults
- `src/config/logger.js` - Winston logger with file and console transports

### Logging Configuration
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode
- Morgan HTTP request logging integrated with Winston

### Code Style
- ESLint configuration enforces single quotes, semicolons, and 2-space indentation
- Prettier formatting with trailing commas and arrow function parentheses avoided
- Unix line endings enforced

## Development Notes

### Database Migrations
When modifying models in `src/models/`, run `npm run db:generate` to create migrations, then `npm run db:migrate` to apply them.

### Authentication Implementation
The current auth controller has bugs:
- Line 10: validation logic is inverted (returns error on success)
- Line 21: uses undefined `jwbtoken` instead of imported JWT utility
- Route in `auth.routes.js` line 8: missing `/` in `'sign-up'` endpoint

### Environment Variables Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment mode (affects logging and security settings)
- `PORT` - Server port (defaults to 3000)
- `LOG_LEVEL` - Winston log level (defaults to 'info')