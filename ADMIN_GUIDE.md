# Administrator Guide

Complete guide for administrators managing the Italiano learning application.

## Table of Contents

1. [Getting Started as Admin](#getting-started-as-admin)
2. [User Management](#user-management)
3. [Content Management](#content-management)
4. [Import Operations](#import-operations)
5. [Security & Permissions](#security--permissions)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started as Admin

### Creating the First Admin

After deploying the application, you need to create the first admin user:

**Option 1 - Via Prisma Studio:**

```bash
npx prisma studio
```

1. Open Prisma Studio
2. Select the User table
3. Find your user account
4. Set the `admin` field to `true`
5. Save changes

**Option 2 - Via Direct SQL:**

```sql
UPDATE "User" SET admin = true WHERE email = 'your_email@example.com';
```

**Option 3 - Via Neon Console:**

1. Log in to your Neon dashboard
2. Select your project and database
3. Open the SQL Editor
4. Run the UPDATE query above

### Accessing the Admin Panel

1. Log in to your account
2. You'll see an "Admin Panel" link in the navigation bar
3. Click it or navigate to `/admin`
4. You'll see multiple tabs for different management functions

### Admin Panel Tabs

1. **Manage Users** - User account management
2. **Manage Verbs** - Import and manage verb translations
3. **Manage Conjugations** - Import and manage verb conjugations
4. **Manage Nouns** - Import and manage noun translations
5. **Manage Adjectives** - Import and manage adjective translations

---

## User Management

### View All Users

The Users tab displays:

- Username
- Email address
- Full name (if provided)
- Admin status (Yes/No)
- Number of completed lessons
- Registration date
- Available actions

### Promote User to Admin

1. Locate the user in the table
2. Click the blue shield icon
3. Confirm the action
4. The user will gain admin access

### Remove Admin Permissions

1. Locate the admin user in the table
2. Click the orange person-remove icon
3. Confirm the action
4. The user will lose admin access

**Note:** You cannot remove your own admin permissions.

### Delete User

1. Locate the user in the table
2. Click the red trash icon
3. Confirm deletion in the dialog
4. User and all their data will be permanently deleted

**Protections:**

- Cannot delete your own account
- All user data is deleted (cascade):
  - User profile
  - Practice statistics
  - Progress data

**Confirmation Required:** The system will ask for confirmation before deletion.

---

## Content Management

### Overview

The admin panel allows you to manage all vocabulary content in the application:

- Italian verbs with translations
- Complete verb conjugations
- Italian nouns with articles
- Italian adjectives with all forms

### Common Operations

All content types support these operations:

- **Import** - Bulk import from JSON files
- **View** - Browse existing content in tables
- **Edit** - Modify individual items
- **Delete** - Remove items (with confirmation)
- **Search** - Filter content by name
- **Pagination** - Navigate through large datasets

---

## Import Operations

### General Import Process

1. **Prepare JSON File**
   - Follow the format specified for each content type
   - Validate JSON syntax
   - Check for required fields

2. **Select File**
   - Click "Choose JSON File"
   - Select your prepared file
   - Preview will show item count

3. **Import**
   - Click the import button
   - System validates the file
   - Checks for conflicts

4. **Resolve Conflicts (if any)**
   - View existing vs new data side-by-side
   - Choose action for each conflict:
     - **Keep Existing** - Skip this item
     - **Replace with New** - Update with imported data
   - All conflicts must be resolved before import

5. **Confirmation**
   - System displays import results
   - Shows count of created/updated items
   - Reports any errors

### Import: Verbs

**Tab:** Manage Verbs

**File Format:**

```json
{
  "verbInfinitive": {
    "regular": true,
    "reflexive": false,
    "tr_ptBR": "Portuguese translation",
    "tr_en": "English translation (optional)"
  }
}
```

**Example:**

```json
{
  "aiutare": {
    "regular": true,
    "reflexive": false,
    "tr_ptBR": "ajudar",
    "tr_en": "to help"
  },
  "essere": {
    "regular": false,
    "reflexive": false,
    "tr_ptBR": "ser/estar",
    "tr_en": "to be"
  }
}
```

**Key Points:**

- Verb infinitive (key) must be unique
- `tr_en` is optional
- `regular` and `reflexive` are booleans
- Conflicts detected by Italian infinitive

### Import: Verb Conjugations

**Tab:** Manage Conjugations

**File Naming:** Name file after verb (e.g., `aiutare.json`)

**File Format:**

```json
{
  "Indicativo": {
    "Presente": {
      "io": "aiuto",
      "tu": "aiuti",
      "lui/lei": "aiuta",
      "noi": "aiutiamo",
      "voi": "aiutate",
      "loro": "aiutano"
    }
  }
}
```

**Supported Moods:**

- Indicativo: Presente, Passato Prossimo, Imperfetto, Trapassato Prossimo, Futuro Semplice, Passato Remoto
- Congiuntivo: Presente, Passato, Imperfetto, Trapassato
- Condizionale: Presente, Passato
- Imperativo: Affirmativo, Negativo
- Participio, Gerundio, Infinito

**Key Points:**

- Verb must already exist in database
- One conjugation per verb
- File name must match verb infinitive
- Supports all standard Italian conjugation forms

### Import: Nouns

**Tab:** Manage Nouns

**File Format:**

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

**Key Points:**

- Base form is without articles
- Include articles in translations
- Use correct Italian articles (il, lo, la, i, gli, le)
- All three languages required

### Import: Adjectives

**Tab:** Manage Adjectives

**File Format:**

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

**Example:**

```json
{
  "basso": {
    "maschile": {
      "singolare": { "it": "basso", "pt": "baixo", "en": "short" },
      "plurale": { "it": "bassi", "pt": "baixos", "en": "short" }
    },
    "femminile": {
      "singolare": { "it": "bassa", "pt": "baixa", "en": "short" },
      "plurale": { "it": "basse", "pt": "baixas", "en": "short" }
    }
  }
}
```

**Key Points:**

- Base form is masculine singular
- All four forms required (masc/fem, sing/plur)
- All three languages required
- Adjectives must agree with gender/number

---

## Security & Permissions

### Admin Verification

All admin routes verify:

1. **Authentication** - Valid JWT token required
2. **Authorization** - User must have `admin = true`
3. **Self-Protection** - Cannot delete or modify own admin status

### API Authentication

- JWT tokens in Authorization header: `Bearer <token>`
- Tokens generated on login
- Default expiration: 7 days
- Refresh tokens: 30 days

### Security Best Practices

1. **Limit Admin Users**
   - Only promote trusted users
   - Remove admin access when no longer needed

2. **Protect JWT Secret**
   - Use strong, random secrets (32+ characters)
   - Never commit secrets to version control
   - Rotate secrets periodically in production

3. **Regular Backups**
   - Backup database before bulk operations
   - Test restores periodically

4. **Monitor Admin Actions**
   - Review user changes regularly
   - Check import logs for anomalies

---

## API Reference

### User Management APIs

#### GET /api/admin/users

List all users.

**Authentication:** Admin required

**Response:**

```json
{
  "users": [
    {
      "id": "user_id",
      "username": "username",
      "email": "email@example.com",
      "name": "Full Name",
      "admin": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "_count": { "lessons": 5 }
    }
  ]
}
```

#### PATCH /api/admin/users/:id

Update user admin status.

**Authentication:** Admin required

**Body:**

```json
{
  "admin": true
}
```

**Response:**

```json
{
  "message": "User updated successfully",
  "user": {
    /* user object */
  }
}
```

#### DELETE /api/admin/users/:id

Delete a user.

**Authentication:** Admin required

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

### Verb Management APIs

#### GET /api/admin/verbs/import

Get all verbs.

**Authentication:** Admin required

#### POST /api/admin/verbs/import

Import verbs.

**Authentication:** Admin required

**Body:**

```json
{
  "verbs": { /* verb data */ },
  "resolveConflicts": {
    "verbName": "keep" | "replace"
  }
}
```

#### PATCH /api/admin/verbs/:id

Update a verb.

**Authentication:** Admin required

#### DELETE /api/admin/verbs/:id

Delete a verb.

**Authentication:** Admin required

### Similar APIs exist for:

- Conjugations (`/api/admin/verbs/conjugations/...`)
- Nouns (`/api/admin/nouns/...`)
- Adjectives (`/api/admin/adjectives/...`)

---

## Troubleshooting

### Common Issues

#### "Admin Panel link not visible"

**Solution:**

1. Verify `admin` field is set to `true` in database
2. Log out and log back in
3. Clear browser cache if needed

#### "403 Unauthorized" error

**Causes:**

- User is not admin
- JWT token expired or invalid
- Token not being sent

**Solutions:**

- Verify admin status in database
- Log out and log back in to get new token
- Check browser console for errors

#### "Error when deleting user"

**Causes:**

- Trying to delete own account
- Database constraint violation

**Solutions:**

- Cannot delete yourself - use another admin
- Check error message for details

#### "Import conflicts not resolving"

**Solution:**

- Ensure all conflicts have a selected action (keep/replace)
- Check console for JavaScript errors
- Try refreshing the page

#### "JSON validation error"

**Causes:**

- Invalid JSON syntax
- Missing required fields
- Incorrect data types

**Solutions:**

- Validate JSON at jsonlint.com
- Check format examples in this guide
- Ensure all required fields are present

#### "Verb conjugation import fails"

**Cause:**

- Verb doesn't exist in database yet

**Solution:**

- Import verb translations first (`Manage Verbs`)
- Then import conjugations (`Manage Conjugations`)

### Getting Help

1. Check the error message in the UI
2. Open browser console for detailed errors
3. Review relevant documentation section
4. Check database with Prisma Studio
5. Verify environment variables are set

### Development Mode Errors

If you see `prisma.model.findMany is undefined`:

1. Regenerate Prisma client:

```bash
npx prisma generate
```

2. Push schema to database:

```bash
npx prisma db push
```

3. Restart development server:

```bash
yarn dev
```

---

## Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# JWT Secrets (REQUIRED - minimum 32 characters)
JWT_SECRET="your-secure-secret-here"
JWT_EXPIRES_IN="7d"

REFRESH_TOKEN_SECRET="different-secret-here"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Environment
NODE_ENV="production"
```

### Generating Secure Secrets

```bash
# Generate a secure random secret
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

---

## Best Practices

### Content Management

1. **Test Imports**
   - Use small test files first
   - Verify data before bulk import

2. **Backup Before Changes**
   - Export data before major imports
   - Keep backups of original JSON files

3. **Consistent Data**
   - Follow naming conventions
   - Use consistent translation style
   - Verify article usage (il, la, etc.)

4. **Review After Import**
   - Check imported data in tables
   - Test in practice mode
   - Verify statistics work

### User Management

1. **Regular Reviews**
   - Review user list periodically
   - Remove inactive admin accounts
   - Monitor user growth

2. **Communication**
   - Inform users of major changes
   - Provide help resources
   - Set clear expectations

3. **Privacy**
   - Respect user data
   - Follow data protection regulations
   - Secure user information

---

## Sample Data

Sample import files are in `data/samples/`:

- `verbs.json` - Example verb translations
- `nouns.json` - Example noun forms
- `adjectives.json` - Example adjective forms
- `conjugations/aiutare.json` - Example conjugation

Use these as templates for creating your own import files.

---

## Database Schema

### Admin-Related Tables

**User**

- `id` - Unique identifier
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `admin` - Boolean (default: false)
- `createdAt` - Registration date

**Verb**

- `id` - Unique identifier
- `italian` - Italian infinitive (unique)
- `tr_ptBR` - Portuguese translation
- `tr_en` - English translation
- `regular` - Boolean
- `reflexive` - Boolean

**VerbConjugation**

- `id` - Unique identifier
- `verbId` - Foreign key (unique, 1:1)
- `conjugation` - JSONB data

**Noun**

- `id` - Unique identifier
- `italian` - Base form (unique)
- `singolare` - JSONB
- `plurale` - JSONB

**Adjective**

- `id` - Unique identifier
- `italian` - Base form (unique)
- `maschile` - JSONB
- `femminile` - JSONB

---

## Quick Reference

### Admin Access Checklist

- [ ] User registered
- [ ] `admin` field set to `true` in database
- [ ] User logged in
- [ ] Admin Panel link visible in navbar
- [ ] Can access `/admin` route
- [ ] Tabs visible (Users, Verbs, etc.)

### Import Checklist

- [ ] JSON file validated
- [ ] Required fields present
- [ ] Data types correct
- [ ] File uploaded successfully
- [ ] Preview shows correct count
- [ ] Conflicts resolved (if any)
- [ ] Import completed successfully
- [ ] Data visible in table
- [ ] Tested in practice mode

### Troubleshooting Checklist

- [ ] Error message read
- [ ] Browser console checked
- [ ] Admin status verified
- [ ] JWT token valid
- [ ] Environment variables set
- [ ] Prisma client generated
- [ ] Database schema up to date
- [ ] Development server restarted

---

For more detailed information, see:

- **FEATURES.md** - Complete feature documentation
- **IMPORT_GUIDES.md** - Detailed import format specifications
- **README.md** - General application documentation
