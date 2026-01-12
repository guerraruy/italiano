# Italiano - Italian Learning Application

A comprehensive web application for learning Italian, featuring interactive practice for verbs, nouns, and adjectives with full conjugation support and progress tracking.

## Features

### For Learners

- **Verb Conjugation Practice** - Practice Italian verb conjugations across all tenses and moods
- **Verb Translation Practice** - Learn Italian verbs with Portuguese and English translations
- **Noun Translation Practice** - Master Italian nouns with articles in singular and plural forms
- **Adjective Translation Practice** - Practice Italian adjectives in all gender and number forms
- **Statistics Tracking** - Monitor your progress with detailed statistics for each word and conjugation
- **Personalized Learning** - Select your native language (Portuguese or English) and enabled verb tenses
- **User Profile** - Customize your learning experience with profile settings

### For Administrators

- **User Management** - View, edit, and manage user accounts
- **Content Import** - Bulk import verbs, nouns, adjectives, and conjugations from JSON files
- **Conflict Resolution** - Smart conflict detection when importing duplicate content
- **Content Editing** - Edit and delete vocabulary items directly from the admin panel

## Tech Stack

- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - Latest React with improved performance
- **TypeScript 5** - Type-safe development
- **Material-UI 7.3.6** - Modern React component library
- **@emotion/styled** - CSS-in-JS styling solution
- **Redux Toolkit 2.11.2** - State management with RTK Query for API calls
- **Prisma 7.2.0** - Type-safe ORM for database management
- **PostgreSQL (Neon)** - Serverless PostgreSQL database
- **Zod 4.3.5** - Schema validation for API inputs
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## Prerequisites

- **Node.js 22.12.0 or higher** (required for Prisma 7.2.0)
- **PostgreSQL database** (or Neon serverless PostgreSQL)
- **npm or yarn** package manager

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT Configuration (REQUIRED - minimum 32 characters)
JWT_SECRET="your-secure-random-secret-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Refresh Token Configuration
REFRESH_TOKEN_SECRET="different-secure-random-secret-32-chars"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Environment
NODE_ENV="development"
```

**Security Note:** Generate secure secrets using:

```bash
openssl rand -base64 32
```

### 3. Set Up Database

Generate the Prisma client and apply the database schema:

```bash
npx prisma generate
npx prisma db push
```

Or use migrations:

```bash
npx prisma migrate dev
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Admin User

After registration, set a user as admin using Prisma Studio:

```bash
npx prisma studio
```

Then update the `admin` field to `true` for your user account.

## Project Structure

```
italiano/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── profile/              # User profile
│   │   ├── verbs/                # Verb practice APIs
│   │   ├── nouns/                # Noun practice APIs
│   │   ├── adjectives/           # Adjective practice APIs
│   │   └── admin/                # Admin-only endpoints
│   ├── components/               # React components
│   │   ├── AdminPanel/           # Admin management UI
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── LoginModal.tsx        # Login/Register modal
│   │   └── SettingsModal.tsx     # User settings
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Authentication context
│   ├── store/                    # Redux store
│   │   ├── api.ts                # RTK Query API definitions
│   │   ├── store.ts              # Store configuration
│   │   └── ReduxProvider.tsx     # Redux provider
│   ├── verbs-translations/       # Verb practice page
│   ├── verb-tenses/              # Conjugation practice page
│   ├── nouns-translations/       # Noun practice page
│   ├── adjectives-translations/  # Adjective practice page
│   ├── admin/                    # Admin panel page
│   └── page.tsx                  # Home page
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication middleware
│   ├── env.ts                    # Environment validation
│   ├── prisma.ts                 # Prisma client
│   └── validation/               # Zod validation schemas
├── prisma/
│   └── schema.prisma             # Database schema
├── data/
│   └── samples/                  # Sample import files
│       ├── verbs.json
│       ├── nouns.json
│       ├── adjectives.json
│       └── conjugations/
└── package.json
```

## Database Schema

### Core Models

- **User** - User accounts with authentication
- **UserProfile** - User preferences (native language, enabled tenses)

### Vocabulary Models

- **Verb** - Italian verbs with translations
- **VerbConjugation** - Complete conjugation data for each verb
- **Noun** - Italian nouns with singular/plural translations
- **Adjective** - Italian adjectives with gender/number forms

### Statistics Models

- **VerbStatistic** - User practice statistics for verbs
- **ConjugationStatistic** - Statistics for each conjugation form
- **NounStatistic** - User practice statistics for nouns
- **AdjectiveStatistic** - User practice statistics for adjectives

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Database
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma migrate dev # Create and apply migration
```

## Security Features

### Phase 1 Security Implementation (Completed)

- **Centralized Authentication** - Reusable `withAuth` and `withAdmin` middleware
- **Environment Validation** - App validates required environment variables on startup
- **Input Validation** - Zod schemas validate all API inputs
- **Password Security** - bcrypt hashing with 10 rounds
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **No Hardcoded Secrets** - All secrets must be provided via environment variables

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### User Profile

- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile settings

### Practice APIs (Authenticated)

- `GET /api/verbs` - Get verbs for practice
- `GET /api/nouns` - Get nouns for practice
- `GET /api/adjectives` - Get adjectives for practice
- `GET /api/verbs/conjugations` - Get verb conjugations
- `GET/POST /api/verbs/statistics` - Verb statistics
- `GET/POST /api/nouns/statistics` - Noun statistics
- `GET/POST /api/adjectives/statistics` - Adjective statistics
- `GET/POST /api/verbs/conjugations/statistics` - Conjugation statistics

### Admin APIs (Admin Only)

- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id` - Update user (admin status)
- `DELETE /api/admin/users/:id` - Delete user
- `GET/POST /api/admin/verbs/import` - Import verbs
- `GET/POST /api/admin/nouns/import` - Import nouns
- `GET/POST /api/admin/adjectives/import` - Import adjectives
- `GET/POST /api/admin/verbs/conjugations/import` - Import conjugations
- `PATCH/DELETE /api/admin/verbs/:id` - Edit/delete verb
- `PATCH/DELETE /api/admin/nouns/:id` - Edit/delete noun
- `PATCH/DELETE /api/admin/adjectives/:id` - Edit/delete adjective

## Import Data Format

Sample JSON files are provided in `data/samples/` directory. See `IMPORT_GUIDES.md` for detailed format specifications.

## Development Tools

### Code Quality

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

### Testing

- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction testing

## Documentation

- **FEATURES.md** - Detailed feature documentation
- **ADMIN_GUIDE.md** - Administrator guide
- **IMPORT_GUIDES.md** - Data import guides
- **DEVELOPMENT.md** - Development notes and technical details

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Requirements

- **Node.js**: >= 22.12.0
- **PostgreSQL**: Any version (Neon serverless recommended)
- **Browser**: Modern browsers with ES6+ support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and not licensed for public use.

## Support

For issues or questions, please create an issue in the GitHub repository.
