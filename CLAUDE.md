# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build            # Build for production

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting without modifying

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report

# Database
npx prisma generate      # Generate Prisma client (runs automatically on npm install)
npx prisma db push       # Push schema changes to database
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open Prisma Studio GUI
```

## Architecture Overview

This is an Italian language learning app built with Next.js 16 App Router, React 19, TypeScript, and PostgreSQL (via Prisma).

### Tech Stack

- **Frontend**: React 19, Material-UI 7, Redux Toolkit with RTK Query
- **Backend**: Next.js API routes, Prisma ORM, JWT authentication
- **Validation**: Zod schemas for all API inputs
- **Node.js**: Requires 22.12.0+ (see .nvmrc)

### Key Directories

- `app/api/` - API routes organized by feature (auth, verbs, nouns, adjectives, admin)
- `app/components/` - React components (see component structure pattern below)
- `app/store/` - Redux store with RTK Query APIs (baseApi.ts, verbsApi.ts, etc.)
- `lib/services/` - Business logic layer
- `lib/repositories/` - Data access layer
- `lib/validation/` - Zod schemas for API validation
- `lib/auth.ts` - JWT middleware (withAuth, withAdmin)
- `lib/errors.ts` - Centralized error handling
- `prisma/schema.prisma` - Database schema

### Data Flow

API routes → Services (`lib/services/`) → Repositories (`lib/repositories/`) → Prisma

### Component Structure Pattern

When components exceed ~600 lines, they're organized as:

```
ComponentName/
├── ComponentName.tsx
└── internals/
    ├── SubComponent1.tsx
    └── SubComponent2.tsx
```

### Authentication

- JWT tokens stored in localStorage (`italiano_token`)
- `withAuth()` middleware for protected routes
- `withAdmin()` middleware for admin-only routes

### Database Models

Core vocabulary models (Verb, Noun, Adjective) with JSON fields for complex forms (conjugations, singular/plural, gender variants). Each has a corresponding statistics model per user for progress tracking.

## Code Conventions

- All text, comments, and filenames in English
- Use RTK Query for API state management and data fetching
- Use React Testing Library for unit tests
- Pre-commit hooks run ESLint and Prettier on staged files

## CI/CD

GitHub Actions runs on push/PR to main: lint → format → test → build (all must pass).
