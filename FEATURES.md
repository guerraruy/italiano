# Features Documentation

Comprehensive documentation of all features in the Italiano learning application.

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [User Profile & Settings](#user-profile--settings)
3. [Verb Features](#verb-features)
4. [Noun Features](#noun-features)
5. [Adjective Features](#adjective-features)
6. [Admin Features](#admin-features)
7. [Statistics & Progress Tracking](#statistics--progress-tracking)

---

## Authentication & User Management

### User Registration

- Create new user accounts with username, email, and password
- Minimum password length: 8 characters
- Minimum username length: 3 characters
- Email format validation
- Password hashing with bcrypt (10 rounds)
- Automatic JWT token generation on registration

### User Login

- Login with username or email
- JWT-based authentication
- Tokens stored in localStorage
- Access token (7-day expiration by default)
- Refresh token support (30-day expiration by default)

### Password Management

- Change password functionality for logged-in users
- Requires current password verification
- Password validation on change

### Security Features

- Centralized authentication middleware (`withAuth`, `withAdmin`)
- Environment variable validation on startup
- No hardcoded secrets
- Input validation with Zod schemas
- HttpOnly cookie support (infrastructure ready)

---

## User Profile & Settings

### Native Language Selection

- Choose between Portuguese (Brasil) or English as native language
- Affects translations displayed throughout the app
- Stored in `UserProfile` database table
- Automatically created on first profile access
- Default: Portuguese (Brasil)

**Database Model:**

- One-to-one relationship with User
- Fields: `nativeLanguage`, `enabledVerbTenses`

### Verb Tense Preferences

- Select which verb tenses to practice
- Customizable per user
- Only selected tenses appear in conjugation practice

**Available Tenses:**

- Indicativo: Presente, Passato Prossimo, Imperfetto, Trapassato Prossimo, Futuro Semplice, Passato Remoto
- Congiuntivo: Presente, Passato, Imperfetto, Trapassato
- Condizionale: Presente, Passato
- Imperativo: Affirmativo, Negativo
- Participio, Gerundio, Infinito

---

## Verb Features

### Verb Translation Practice

**Location:** `/verbs-translations`

**Features:**

- Practice Italian verb translations
- Translations in Portuguese and English
- Filter by verb type: All, Regular, Irregular, Reflexive
- Real-time validation on user input
- Visual feedback (green for correct, red for incorrect)
- Accent-insensitive comparison
- Show answer functionality
- Clear input buttons
- Statistics tracking per verb

**Database Models:**

- `Verb` - Italian verbs with `tr_ptBR` and `tr_en` translations
- `VerbStatistic` - User practice statistics

**Import Format (JSON):**

```json
{
  "verbInfinitive": {
    "regular": boolean,
    "reflexive": boolean,
    "tr_ptBR": "Portuguese translation",
    "tr_en": "English translation (optional)"
  }
}
```

### Verb Conjugation Practice

**Location:** `/verb-tenses`

**Features:**

- Practice conjugating Italian verbs across all tenses
- Verb type filtering (Regular, Irregular, Reflexive)
- Filter persistence per user (localStorage)
- Dynamic input fields based on enabled tenses
- Person-based conjugations (io, tu, lui/lei, noi, voi, loro)
- Special forms support (Participio, Gerundio, Infinito)
- Real-time validation on blur or Enter
- Visual feedback for correct/incorrect answers
- Granular statistics per conjugation
- Reset statistics functionality

**Database Models:**

- `VerbConjugation` - Complete conjugation data (JSONB)
- `ConjugationStatistic` - Per verb-tense-person statistics

**Conjugation Structure:**

- Organized by Mood (Modo) → Tense (Tempo) → Person (Persona)
- Supports all standard Italian verb forms
- Special handling for Imperativo (no "io" person)

**Import Format (JSON):**

```json
{
  "Indicativo": {
    "Presente": {
      "io": "...",
      "tu": "...",
      "lui/lei": "...",
      "noi": "...",
      "voi": "...",
      "loro": "..."
    }
  }
}
```

---

## Noun Features

### Noun Translation Practice

**Location:** `/nouns-translations`

**Features:**

- Practice Italian nouns with articles
- Singular and plural forms
- Translations in Italian, Portuguese, and English
- Real-time validation
- Visual feedback on answers
- Statistics tracking
- Show answer functionality
- Clear input buttons

**Database Models:**

- `Noun` - Italian nouns with singular/plural translations (JSONB)
- `NounStatistic` - User practice statistics

**Noun Structure:**

- Base form: Italian noun without article
- Singolare: { it, pt, en } with articles
- Plurale: { it, pt, en } with articles

**Import Format (JSON):**

```json
{
  "baseForm": {
    "singolare": {
      "it": "article + noun",
      "pt": "article + noun",
      "en": "article + noun"
    },
    "plurale": {
      "it": "article + noun",
      "pt": "article + noun",
      "en": "article + noun"
    }
  }
}
```

**Example:**

```json
{
  "libro": {
    "singolare": {
      "it": "il libro",
      "pt": "o livro",
      "en": "the book"
    },
    "plurale": {
      "it": "i libri",
      "pt": "os livros",
      "en": "the books"
    }
  }
}
```

---

## Adjective Features

### Adjective Translation Practice

**Location:** `/adjectives-translations`

**Features:**

- Practice Italian adjectives in all forms
- Masculine and feminine forms
- Singular and plural for each gender
- Translations in Italian, Portuguese, and English
- Real-time validation
- Visual feedback
- Statistics tracking
- Show answer functionality

**Database Models:**

- `Adjective` - Italian adjectives with gender/number forms (JSONB)
- `AdjectiveStatistic` - User practice statistics

**Adjective Structure:**

- Base form: Masculine singular (italian field)
- Maschile: { singolare: {it, pt, en}, plurale: {it, pt, en} }
- Femminile: { singolare: {it, pt, en}, plurale: {it, pt, en} }

**Import Format (JSON):**

```json
{
  "baseForm": {
    "maschile": {
      "singolare": { "it": "...", "pt": "...", "en": "..." },
      "plurale": { "it": "...", "pt": "...", "en": "..." }
    },
    "femminile": {
      "singolare": { "it": "...", "pt": "...", "en": "..." },
      "plurale": { "it": "...", "pt": "...", "en": "..." }
    }
  }
}
```

---

## Admin Features

### User Management

**Location:** `/admin` (Users tab)

**Features:**

- View all registered users
- User information displayed:
  - Username
  - Email
  - Full name
  - Admin status
  - Number of completed lessons
  - Registration date
- Promote user to admin
- Remove admin permissions
- Delete users
- Self-protection (cannot delete or demote yourself)

**Permissions:**

- Only users with `admin: true` can access
- JWT authentication required

### Content Management

**Location:** `/admin` (Various tabs)

**Features:**

#### Manage Verbs

- Import verbs from JSON files
- View all imported verbs
- Edit verb translations
- Delete verbs
- Conflict resolution on duplicate imports

#### Manage Verb Conjugations

- Import conjugation data from JSON files
- View all verb conjugations
- Edit conjugations
- Delete conjugations
- Expandable conjugation view

#### Manage Nouns

- Import nouns from JSON files
- View all imported nouns
- Edit noun forms
- Delete nouns
- Side-by-side conflict comparison

#### Manage Adjectives

- Import adjectives from JSON files
- View all imported adjectives
- Edit adjective forms (all genders/numbers)
- Delete adjectives
- Search and pagination

### Import Features (All Content Types)

**Common Features:**

- JSON file validation
- Preview before import
- Conflict detection
- Side-by-side comparison of existing vs new data
- Choose to keep existing or replace with new
- Batch operations
- Success/error notifications
- Transactional imports (all-or-nothing)

**Supported Import Types:**

- Verbs (translations only)
- Verb conjugations (complete conjugation data)
- Nouns (singular/plural with translations)
- Adjectives (masculine/feminine, singular/plural)

---

## Statistics & Progress Tracking

### Granular Statistics

**Per-Item Statistics:**

- Each vocabulary item tracks:
  - Correct attempts count
  - Wrong attempts count
  - Last practice date
  - Creation date
  - Last update date

**Per-Conjugation Statistics:**

- Each verb tense-person combination tracks separately:
  - Correct attempts
  - Wrong attempts
  - Last practiced date
  - Unique key: `userId:verbId:mood:tense:person`

### Visual Display

- Statistics chips next to each input field
- Green chip: Correct attempts count
- Red chip: Wrong attempts count
- Real-time updates on validation

### Reset Functionality

- Reset all statistics for a specific verb
- Reset all statistics for a specific noun
- Reset all statistics for a specific adjective
- Confirmation dialog before reset
- Cascade delete when content is deleted

### Statistics Storage

**Database Tables:**

- `VerbStatistic` - Verb translation practice
- `ConjugationStatistic` - Conjugation practice
- `NounStatistic` - Noun practice
- `AdjectiveStatistic` - Adjective practice

**Unique Constraints:**

- One statistic record per user-item combination
- Prevents duplicate statistics
- Automatic updates on practice

---

## Technical Implementation Details

### State Management

- **Redux Toolkit** with RTK Query for all API calls
- Centralized API definitions in `app/store/api.ts`
- Automatic caching and refetching
- Optimistic updates
- Type-safe API hooks

### Validation

- **Zod schemas** for all API inputs
- Client-side and server-side validation
- Detailed error messages
- Type inference from schemas

### Authentication Flow

1. User logs in or registers
2. Server generates JWT tokens (access + refresh)
3. Tokens stored in localStorage
4. All API requests include Authorization header
5. Server validates token using centralized middleware
6. Token refresh mechanism (infrastructure ready)

### RTK Query Cache Tags

- `Users` - Invalidated on user create/update/delete
- `Verbs` - Invalidated on verb import/update/delete
- `Nouns` - Invalidated on noun import/update/delete
- `Adjectives` - Invalidated on adjective import/update/delete
- `VerbsPractice` - For practice mode data
- `NounsPractice` - For practice mode data
- `AdjectivesPractice` - For practice mode data
- `VerbStatistics` - For verb statistics
- `ConjugationStatistics` - For conjugation statistics
- `NounStatistics` - For noun statistics
- `AdjectiveStatistics` - For adjective statistics
- `Profile` - For user profile data

### Database Relationships

```
User (1) ──── (1) UserProfile
  │
  ├── (1:N) VerbStatistic
  ├── (1:N) ConjugationStatistic
  ├── (1:N) NounStatistic
  └── (1:N) AdjectiveStatistic

Verb (1) ──── (1) VerbConjugation
  │
  └── (1:N) VerbStatistic

Noun (1) ──── (1:N) NounStatistic

Adjective (1) ──── (1:N) AdjectiveStatistic
```

### Performance Optimizations

- Database indexes on foreign keys
- Composite indexes for statistics queries
- JSONB fields for flexible data storage
- RTK Query caching
- Deferred input for search filtering
- React.memo for expensive components
- Pagination for large datasets

---

## Future Enhancements

### Planned Features (Phase 2+)

1. **Service Layer** - Extract database logic from API routes
2. **Custom Hooks** - Reusable hooks for common patterns
3. **Component Refactoring** - Break down large page components
4. **Testing** - Unit, integration, and E2E tests
5. **API Documentation** - Swagger/OpenAPI documentation
6. **Performance** - Database query optimization, caching
7. **Accessibility** - ARIA labels, keyboard navigation
8. **Mobile Optimization** - Better touch targets and layouts

### Potential Features

- Audio pronunciation for words
- Timed practice challenges
- Progress dashboards
- Export statistics
- Practice mode with weak conjugations focus
- Flashcard mode
- Spaced repetition algorithm
- Multi-language support (Spanish, French)
- Social features (leaderboards, sharing)

---

## Migration History

### RTK Query Migration (Completed)

- Migrated from `fetch` to RTK Query
- Centralized API management
- Automatic caching and refetching
- Type-safe API calls
- Better developer experience

### Phase 1 Security (Completed)

- Centralized authentication middleware
- Environment variable validation
- Input validation with Zod
- Removed hardcoded secrets
- Password security improvements

---

## Sample Data

Sample import files are provided in `data/samples/`:

- `verbs.json` - Sample Italian verbs
- `nouns.json` - Sample Italian nouns
- `adjectives.json` - Sample Italian adjectives
- `conjugations/aiutare.json` - Sample conjugation data

These files serve as templates and examples for creating your own import data.
