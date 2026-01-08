---
name: Code Quality Improvements
overview: Systematic refactoring to improve security, maintainability, performance, and code quality across the Italian learning application, addressing critical security issues, eliminating code duplication, and implementing industry best practices.
todos:
  - id: env-validation
    content: Create environment validation and centralized auth middleware
    status: pending
  - id: remove-hardcoded-secrets
    content: Remove all hardcoded JWT secret fallbacks across API routes
    status: pending
  - id: error-handling
    content: Implement centralized error handling and logging system
    status: pending
  - id: service-layer
    content: Create database service layer to extract Prisma queries from routes
    status: pending
  - id: validation-schemas
    content: Setup Zod validation schemas for all API inputs
    status: pending
  - id: refactor-large-components
    content: Break down large page components (600+ lines) into smaller pieces
    status: pending
  - id: custom-hooks
    content: Extract reusable logic into custom hooks
    status: pending
  - id: performance-optimization
    content: Optimize database queries and add caching strategies
    status: pending
  - id: testing-setup
    content: Setup testing infrastructure (Jest, RTL, Playwright)
    status: pending
  - id: api-documentation
    content: Create API documentation with Swagger/OpenAPI
    status: pending
---

# Italian App Code Quality Improvements Plan

## Phase 1: Critical Security Fixes (High Priority)

### 1.1 Centralize Authentication & Remove Hardcoded Secrets

- Create `lib/auth.ts` with reusable authentication middleware
- Create `lib/env.ts` to validate environment variables on startup
- Remove all instances of `process.env.JWT_SECRET || 'your-secret-key'` fallback
- Create `.env.example` file documenting required environment variables
- Update all 30+ API routes to use centralized auth middleware

**Files to modify:**

- Create: [`lib/auth.ts`](lib/auth.ts), [`lib/env.ts`](lib/env.ts), [`.env.example`](.env.example)
- Update: All API routes in [`app/api/`](app/api/) (auth, verbs, nouns, adjectives, admin, profile)

### 1.2 Improve Token Security

- Consider HttpOnly cookies instead of localStorage (if possible with Next.js app router)
- Add token refresh mechanism
- Implement CSRF protection
- Add rate limiting to authentication endpoints

**Files to modify:**

- [`app/contexts/AuthContext.tsx`](app/contexts/AuthContext.tsx)
- [`app/store/api.ts`](app/store/api.ts)
- [`app/api/auth/login/route.ts`](app/api/auth/login/route.ts)
- [`app/api/auth/register/route.ts`](app/api/auth/register/route.ts)

### 1.3 Input Validation & Sanitization

- Install and configure Zod for schema validation
- Create validation schemas for all API inputs
- Add sanitization for user inputs to prevent XSS/injection attacks

**Files to create:**

- [`lib/validation/auth.ts`](lib/validation/auth.ts)
- [`lib/validation/verbs.ts`](lib/validation/verbs.ts)
- [`lib/validation/nouns.ts`](lib/validation/nouns.ts)
- [`lib/validation/adjectives.ts`](lib/validation/adjectives.ts)

## Phase 2: Code Organization & DRY Principles (High Priority)

### 2.1 Create Centralized Error Handling

- Create standardized error classes
- Create error handler middleware
- Replace all 52 `console.error` instances with proper logging
- Implement structured logging (consider pino or winston)

**Files to create:**

- [`lib/errors.ts`](lib/errors.ts) - Custom error classes
- [`lib/logger.ts`](lib/logger.ts) - Centralized logging
- [`lib/api-response.ts`](lib/api-response.ts) - Standardized API responses

### 2.2 Create Database Service Layer

- Extract Prisma queries into service classes
- Centralize database transaction logic
- Add query optimization and caching strategies

**Files to create:**

- [`lib/services/user.service.ts`](lib/services/user.service.ts)
- [`lib/services/verb.service.ts`](lib/services/verb.service.ts)
- [`lib/services/noun.service.ts`](lib/services/noun.service.ts)
- [`lib/services/adjective.service.ts`](lib/services/adjective.service.ts)
- [`lib/services/statistics.service.ts`](lib/services/statistics.service.ts)

### 2.3 Extract Custom Hooks

- Create reusable hooks for common patterns
- Extract business logic from page components

**Files to create:**

- [`app/hooks/useStatistics.ts`](app/hooks/useStatistics.ts)
- [`app/hooks/usePracticeSession.ts`](app/hooks/usePracticeSession.ts)
- [`app/hooks/useValidation.ts`](app/hooks/useValidation.ts)

### 2.4 Create Constants & Configuration Files

- Centralize error messages, validation rules, API endpoints
- Create type-safe configuration objects

**Files to create:**

- [`lib/constants/messages.ts`](lib/constants/messages.ts)
- [`lib/constants/validation-rules.ts`](lib/constants/validation-rules.ts)
- [`lib/config/app.config.ts`](lib/config/app.config.ts)

## Phase 3: Component Refactoring (Medium Priority)

### 3.1 Break Down Large Page Components

Large page files (600-700+ lines) should be split into smaller, focused components:

- [`app/nouns-translations/page.tsx`](app/nouns-translations/page.tsx) (659 lines)
- [`app/verb-tenses/page.tsx`](app/verb-tenses/page.tsx) (864 lines)
- [`app/verbs-translations/page.tsx`](app/verbs-translations/page.tsx) (742 lines)
- [`app/adjectives-translations/page.tsx`](app/adjectives-translations/page.tsx) (705 lines)

**Extract to internals:**

- Filter controls components
- Practice item components
- Statistics display components
- Dialog/modal components

### 3.2 Shared Component Library

- Create reusable UI components
- Standardize loading states with skeletons
- Create consistent error/empty state components

**Files to create:**

- [`app/components/shared/LoadingSkeleton.tsx`](app/components/shared/LoadingSkeleton.tsx)
- [`app/components/shared/ErrorState.tsx`](app/components/shared/ErrorState.tsx)
- [`app/components/shared/EmptyState.tsx`](app/components/shared/EmptyState.tsx)
- [`app/components/shared/PracticeItem.tsx`](app/components/shared/PracticeItem.tsx)

### 3.3 Improve Accessibility

- Add ARIA labels to interactive elements
- Ensure keyboard navigation works properly
- Add proper focus management in dialogs
- Test with screen readers

## Phase 4: Performance Optimizations (Medium Priority)

### 4.1 Database Optimization

- Add missing composite indexes to Prisma schema
- Optimize queries with proper select/include
- Implement connection pooling configuration
- Consider denormalization for statistics aggregations

**Files to modify:**

- [`prisma/schema.prisma`](prisma/schema.prisma)
- All service layer files

### 4.2 API Response Optimization

- Implement response caching (Redis or in-memory)
- Add pagination to all list endpoints
- Optimize large JSON field queries
- Add database query result caching

### 4.3 Frontend Performance

- Implement proper code splitting for admin routes
- Add image optimization if images are added
- Optimize RTK Query cache configuration
- Consider React.memo for expensive components

**Files to modify:**

- [`app/store/api.ts`](app/store/api.ts) - Better cache configuration
- [`app/store/store.ts`](app/store/store.ts) - Add persistence if needed

### 4.4 Bundle Size Optimization

- Analyze and reduce bundle size
- Lazy load admin components
- Review and remove unused dependencies

## Phase 5: Testing Infrastructure (Medium Priority)

### 5.1 Setup Testing Framework

- Install and configure Jest, React Testing Library
- Install Playwright for e2e tests
- Create test utilities and helpers
- Setup test database configuration

**Files to create:**

- [`jest.config.js`](jest.config.js)
- [`playwright.config.ts`](playwright.config.ts)
- [`tests/setup.ts`](tests/setup.ts)
- [`tests/helpers/test-utils.tsx`](tests/helpers/test-utils.tsx)

### 5.2 Write Unit Tests

- Test utility functions and hooks
- Test service layer functions
- Test validation schemas
- Target 70%+ coverage for critical paths

**Files to create:**

- [`tests/unit/lib/auth.test.ts`](tests/unit/lib/auth.test.ts)
- [`tests/unit/lib/validation.test.ts`](tests/unit/lib/validation.test.ts)
- [`tests/unit/services/*.test.ts`](tests/unit/services/)

### 5.3 Write Integration Tests

- Test API endpoints
- Test authentication flow
- Test database operations

**Files to create:**

- [`tests/integration/api/auth.test.ts`](tests/integration/api/auth.test.ts)
- [`tests/integration/api/verbs.test.ts`](tests/integration/api/verbs.test.ts)

### 5.4 Write E2E Tests

- Test critical user flows
- Test admin functionality
- Test practice sessions

**Files to create:**

- [`tests/e2e/auth-flow.spec.ts`](tests/e2e/auth-flow.spec.ts)
- [`tests/e2e/practice-session.spec.ts`](tests/e2e/practice-session.spec.ts)

## Phase 6: Type Safety & API Documentation (Low Priority)

### 6.1 Enhance Type Safety

- Create type guards for runtime validation
- Remove `any` and loose type assertions
- Add stricter TypeScript configuration
- Generate types from Prisma schema more effectively

### 6.2 API Documentation

- Setup Swagger/OpenAPI documentation
- Document all API endpoints
- Create API usage examples
- Version the API properly

**Files to create:**

- [`app/api/docs/route.ts`](app/api/docs/route.ts)
- [`lib/swagger.ts`](lib/swagger.ts)

## Phase 7: Developer Experience (Low Priority)

### 7.1 Development Tooling

- Add pre-commit hooks (Husky)
- Setup ESLint rules for code quality
- Add Prettier for consistent formatting
- Create development scripts

**Files to create/modify:**

- [`.husky/pre-commit`](.husky/pre-commit)
- [`eslint.config.mjs`](eslint.config.mjs) - Enhance rules
- [`.prettierrc`](.prettierrc)

### 7.2 Documentation

- Create comprehensive README
- Document architecture decisions
- Create contribution guidelines
- Document deployment process

**Files to create:**

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

### 7.3 CI/CD Pipeline

- Setup GitHub Actions or similar
- Automate testing on PRs
- Automate deployment
- Add code quality checks

**Files to create:**

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

## Implementation Strategy

### Recommended Order:

1. **Week 1**: Phase 1 (Security) - Critical, must be done first
2. **Week 2**: Phase 2.1-2.2 (Error handling, Service layer) - Foundation for other work
3. **Week 3**: Phase 2.3-2.4 (Hooks, Constants) + Phase 3.1 (Component refactoring)
4. **Week 4**: Phase 4 (Performance) - Now that code is cleaner
5. **Week 5-6**: Phase 5 (Testing) - Test the refactored code
6. **Week 7**: Phase 6-7 (Documentation, DX improvements)

### Quick Wins (Can do immediately):

- Create `.env.example` file
- Replace console.log/error with proper logging
- Add missing TypeScript strict checks
- Create constants file for error messages

### Breaking Changes:

- Token storage change (localStorage → httpOnly cookies) may require user re-login
- API response format standardization may break frontend temporarily
- Service layer introduction requires careful migration

## Success Metrics

- ✅ Zero hardcoded secrets in codebase
- ✅ < 5 console.log/error instances (only in dev)
