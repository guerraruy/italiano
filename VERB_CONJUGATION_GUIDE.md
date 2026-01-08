# Verb Conjugation Import Guide

This guide explains how to import Italian verb conjugations into the application.

## Overview

The verb conjugation system allows admins to import complete conjugation data for Italian verbs from JSON files. The system supports:

- **Multiple file import**: Import multiple verbs at once
- **Conflict detection**: Automatically detects existing conjugations
- **Conflict resolution**: Shows differences and allows you to choose to keep existing data or replace it
- **Complete conjugation data**: Supports all moods, tenses, and forms

## Database Schema

A new `VerbConjugation` table has been added with the following structure:

- `id`: Unique identifier
- `verbId`: Foreign key to the Verb table
- `conjugation`: JSONB field containing the complete conjugation data
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated

Each verb can have only one conjugation entry (1:1 relationship).

## File Format

Each JSON file should be named after the Italian verb infinitive (e.g., `aiutare.json`, `essere.json`, `avere.json`).

The file should contain an object with the following structure:

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
    },
    "Passato Prossimo": { ... },
    "Imperfetto": { ... },
    "Trapassato Prossimo": { ... },
    "Futuro Semplice": { ... },
    "Passato Remoto": { ... }
  },
  "Congiuntivo": {
    "Presente": { ... },
    "Passato": { ... },
    "Imperfetto": { ... },
    "Trapassato": { ... }
  },
  "Condizionale": {
    "Presente": { ... },
    "Passato": { ... }
  },
  "Imperativo": {
    "Affirmativo": {
      "tu": "...",
      "lui/lei": "...",
      "noi": "...",
      "voi": "...",
      "loro": "..."
    },
    "Negativo": { ... }
  },
  "Participio": {
    "Presente": "...",
    "Passato": "..."
  },
  "Gerundio": {
    "Presente": "...",
    "Passato": "..."
  },
  "Infinito": {
    "Presente": "...",
    "Passato": "..."
  }
}
```

### Moods (Modi)

The following moods are supported:

1. **Indicativo** (Indicative)
   - Presente
   - Passato Prossimo
   - Imperfetto
   - Trapassato Prossimo
   - Futuro Semplice
   - Passato Remoto

2. **Congiuntivo** (Subjunctive)
   - Presente
   - Passato
   - Imperfetto
   - Trapassato

3. **Condizionale** (Conditional)
   - Presente
   - Passato

4. **Imperativo** (Imperative)
   - Affirmativo
   - Negativo

5. **Participio** (Participle)
   - Presente
   - Passato

6. **Gerundio** (Gerund)
   - Presente
   - Passato

7. **Infinito** (Infinitive)
   - Presente
   - Passato

### Persons (Persone)

For most tenses, the following persons are used:

- `io` (I)
- `tu` (you - informal)
- `lui/lei` (he/she)
- `noi` (we)
- `voi` (you - plural)
- `loro` (they)

Note: Imperativo doesn't include `io`, and some forms like Participio, Gerundio, and Infinito use simple string values instead of person objects.

## How to Import

### Prerequisites

1. The verb must already exist in the `Verb` table (imported via the verb translation import feature)
2. You must be logged in as an admin user

### Steps

1. **Access the Admin Page**
   - Navigate to `/admin/verbs/conjugations`
   - Only accessible to admin users

2. **Select Files**
   - Click "Choose JSON File(s)"
   - Select one or more JSON files
   - Each file should be named after the verb (e.g., `aiutare.json`)

3. **Review Selected Files**
   - The system will parse and validate each file
   - Invalid JSON files will show an error
   - Valid files will be listed with their verb names

4. **Import**
   - Click "Import Conjugations"
   - The system will check if any of the verbs already have conjugations

5. **Resolve Conflicts (if any)**
   - If a verb already has conjugations, a conflict dialog will appear
   - You can view both the existing and new conjugation data side-by-side
   - Choose to either:
     - **Keep Existing**: Ignore the new data
     - **Replace with New**: Replace the existing conjugations with new data
   - You must resolve all conflicts before the import can continue

6. **Confirmation**
   - After successful import, you'll see a confirmation message
   - The message will show how many conjugations were created and updated

## View Existing Conjugations

The admin page displays a table of all existing conjugations:

- **Verb name** in Italian
- **Regular/Irregular** indicator
- **Reflexive** indicator
- **Conjugation summary** showing the number of moods and tenses
- **Last updated** timestamp
- **Expand button** to view the complete conjugation data

Click the expand button to see the full conjugation details for any verb.

## Sample Files

A sample conjugation file is provided in the `data/samples/conjugations` directory:

- `aiutare.json` - Complete conjugation for the verb "aiutare" (to help)

You can use this as a template for creating your own conjugation files.

## API Endpoints

The following API endpoints are used (admin only):

### GET `/api/admin/verbs/conjugations/import`

Returns all verb conjugations in the database.

**Response:**

```json
{
  "conjugations": [
    {
      "id": "...",
      "verbId": "...",
      "conjugation": { ... },
      "createdAt": "...",
      "updatedAt": "...",
      "verb": {
        "italian": "aiutare",
        "regular": true,
        "reflexive": false
      }
    }
  ]
}
```

### POST `/api/admin/verbs/conjugations/import`

Imports verb conjugations from JSON data.

**Request Body:**

```json
{
  "conjugations": {
    "aiutare": { ... },
    "essere": { ... }
  },
  "resolveConflicts": {
    "aiutare": "replace",
    "essere": "keep"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "created": 5,
  "updated": 2,
  "message": "Successfully imported 5 new conjugations and updated 2 existing conjugations."
}
```

**Conflict Response (409):**

```json
{
  "conflicts": [
    {
      "verbName": "aiutare",
      "existing": { ... },
      "new": { ... }
    }
  ],
  "message": "Conflicts detected. Please resolve before importing."
}
```

**Error Response (400):**

```json
{
  "error": "Some verbs do not exist in the database",
  "missingVerbs": ["cantare", "ballare"]
}
```

## Migration

Before using this feature, you need to apply the database migration:

### Option 1: Manual Migration (if Prisma CLI has issues)

Run the SQL directly against your database:

```sql
-- Located at: prisma/migrations/20260102204500_add_verb_conjugation_model/migration.sql

CREATE TABLE "VerbConjugation" (
    "id" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "conjugation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerbConjugation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VerbConjugation_verbId_key" ON "VerbConjugation"("verbId");
CREATE INDEX "VerbConjugation_verbId_idx" ON "VerbConjugation"("verbId");

ALTER TABLE "VerbConjugation" ADD CONSTRAINT "VerbConjugation_verbId_fkey"
  FOREIGN KEY ("verbId") REFERENCES "Verb"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Option 2: Using Prisma CLI (if working)

```bash
npx prisma migrate deploy
# or
npx prisma db push
```

## Notes

- The verb must exist in the database before importing conjugations
- Each verb can have only one conjugation record (unique constraint on `verbId`)
- All conjugation data is stored as JSONB in PostgreSQL, allowing flexible querying
- The import process is transactional - either all conjugations succeed or none are imported
- Conflict resolution is required for all conflicts before the import can proceed
- The filename (without .json) must exactly match the Italian verb infinitive in the database

## Troubleshooting

### "Some verbs do not exist in the database"

**Solution:** First import the verb translations using the verb import feature at `/admin/verbs`, then import the conjugations.

### "Invalid JSON format"

**Solution:** Validate your JSON file using a JSON validator. Ensure all brackets and quotes are properly closed.

### "Conflicts detected"

**Solution:** This is expected behavior when reimporting conjugations for verbs that already have data. Review the conflicts and choose to keep or replace the data.

### Migration not applied

**Solution:** Apply the migration manually using the SQL provided above, or fix the Prisma CLI compatibility issue and run `npx prisma migrate deploy`.
