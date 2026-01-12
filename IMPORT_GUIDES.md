# Import Guides

Complete guide for importing vocabulary data into the Italiano learning application.

## Table of Contents

1. [Overview](#overview)
2. [General Import Process](#general-import-process)
3. [Verb Translations](#verb-translations)
4. [Verb Conjugations](#verb-conjugations)
5. [Noun Translations](#noun-translations)
6. [Adjective Translations](#adjective-translations)
7. [Sample Files](#sample-files)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The import system allows administrators to bulk import Italian vocabulary data from JSON files. All import operations support:

- **Conflict Detection** - Automatic detection of duplicate entries
- **Side-by-Side Comparison** - View existing vs new data before deciding
- **Batch Operations** - Import multiple items at once
- **Transactional Imports** - All-or-nothing approach prevents partial data
- **Validation** - Client and server-side validation of data structure

### Prerequisites

- Admin access to the application
- JSON files following the correct format
- Valid data with proper Italian grammar

---

## General Import Process

### Step-by-Step Guide

1. **Access Admin Panel**
   - Log in as administrator
   - Navigate to `/admin`
   - Select the appropriate tab (Verbs, Nouns, Adjectives, or Conjugations)

2. **Prepare JSON File**
   - Follow the format specifications in this guide
   - Validate JSON syntax (use jsonlint.com)
   - Ensure all required fields are present
   - Use proper data types (boolean, string, object)

3. **Upload File**
   - Click "Choose JSON File" button
   - Select your prepared JSON file
   - System validates file format
   - Preview shows number of items to import

4. **Import**
   - Click the import button ("Import Verbs", "Import Nouns", etc.)
   - System checks for existing entries
   - If no conflicts, import proceeds immediately

5. **Resolve Conflicts (if detected)**
   - Dialog shows all conflicting items
   - For each conflict, view:
     - Existing data (current database entry)
     - New data (from your import file)
   - Choose action:
     - **Keep Existing** - Skip this item, maintain current data
     - **Replace with New** - Update with imported data
   - All conflicts must be resolved before continuing

6. **Confirmation**
   - Success message shows counts:
     - Items created
     - Items updated
   - Data appears in the table below
   - Ready for practice mode

### Conflict Resolution

Conflicts occur when:

- Importing a verb with an infinitive that already exists
- Importing a noun with a base form that already exists
- Importing an adjective with a base form that already exists
- Importing conjugations for a verb that already has them

**Resolution Options:**

- **Keep Existing** - Preserve current database entry, ignore import for this item
- **Replace with New** - Overwrite database entry with imported data

---

## Verb Translations

Import Italian verbs with translations to Portuguese (Brasil) and English.

### Database Schema

**Table:** `Verb`

**Fields:**

- `id` - Unique identifier (auto-generated)
- `italian` - Verb infinitive in Italian (unique)
- `tr_ptBR` - Portuguese (Brasil) translation
- `tr_en` - English translation (optional)
- `regular` - Boolean: is this a regular verb?
- `reflexive` - Boolean: is this a reflexive verb?
- `createdAt` - Timestamp (auto)
- `updatedAt` - Timestamp (auto)

### JSON Format

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

### Complete Example

```json
{
  "accendere": {
    "regular": false,
    "reflexive": false,
    "tr_ptBR": "acender",
    "tr_en": "to light"
  },
  "accettare": {
    "regular": true,
    "reflexive": false,
    "tr_ptBR": "aceitar",
    "tr_en": "to accept"
  },
  "alzarsi": {
    "regular": true,
    "reflexive": true,
    "tr_ptBR": "levantar-se",
    "tr_en": "to get up"
  },
  "essere": {
    "regular": false,
    "reflexive": false,
    "tr_ptBR": "ser/estar",
    "tr_en": "to be"
  },
  "avere": {
    "regular": false,
    "reflexive": false,
    "tr_ptBR": "ter",
    "tr_en": "to have"
  }
}
```

### Field Specifications

**italian** (object key):

- Must be the Italian infinitive
- Case-sensitive
- Unique across all verbs
- Examples: "mangiare", "essere", "alzarsi"

**regular**:

- Type: Boolean (true/false, no quotes)
- `true` - Regular conjugation pattern
- `false` - Irregular conjugation

**reflexive**:

- Type: Boolean (true/false, no quotes)
- `true` - Verb ends in -si (e.g., alzarsi)
- `false` - Non-reflexive verb

**tr_ptBR**:

- Type: String
- Portuguese (Brasil) translation
- Include "se" for reflexive verbs
- Examples: "ajudar", "ser/estar", "levantar-se"

**tr_en**:

- Type: String
- Optional field
- English translation with "to"
- Examples: "to help", "to be", "to get up"

### Import Location

**Admin Panel:** Tab 2 - "Manage Verbs"

**Sample File:** `data/samples/verbs.json`

---

## Verb Conjugations

Import complete conjugation data for Italian verbs.

### Database Schema

**Table:** `VerbConjugation`

**Fields:**

- `id` - Unique identifier (auto-generated)
- `verbId` - Foreign key to Verb table (unique, 1:1 relationship)
- `conjugation` - JSONB field with complete conjugation data
- `createdAt` - Timestamp (auto)
- `updatedAt` - Timestamp (auto)

**Relationship:** One verb can have exactly one conjugation entry.

### File Naming Convention

**Important:** Name each file after the Italian verb infinitive.

Examples:

- `aiutare.json` - For the verb "aiutare"
- `essere.json` - For the verb "essere"
- `avere.json` - For the verb "avere"

### JSON Format Structure

```json
{
  "Mood": {
    "Tense": {
      "person": "conjugated form"
    }
  }
}
```

### Complete Example (aiutare)

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
    },
    "Passato Prossimo": {
      "io": "ho aiutato",
      "tu": "hai aiutato",
      "lui/lei": "ha aiutato",
      "noi": "abbiamo aiutato",
      "voi": "avete aiutato",
      "loro": "hanno aiutato"
    },
    "Imperfetto": {
      "io": "aiutavo",
      "tu": "aiutavi",
      "lui/lei": "aiutava",
      "noi": "aiutavamo",
      "voi": "aiutavate",
      "loro": "aiutavano"
    },
    "Trapassato Prossimo": {
      "io": "avevo aiutato",
      "tu": "avevi aiutato",
      "lui/lei": "aveva aiutato",
      "noi": "avevamo aiutato",
      "voi": "avevate aiutato",
      "loro": "avevano aiutato"
    },
    "Futuro Semplice": {
      "io": "aiuterò",
      "tu": "aiuterai",
      "lui/lei": "aiuterà",
      "noi": "aiuteremo",
      "voi": "aiuterete",
      "loro": "aiuteranno"
    },
    "Passato Remoto": {
      "io": "aiutai",
      "tu": "aiutasti",
      "lui/lei": "aiutò",
      "noi": "aiutammo",
      "voi": "aiutaste",
      "loro": "aiutarono"
    }
  },
  "Congiuntivo": {
    "Presente": {
      "io": "aiuti",
      "tu": "aiuti",
      "lui/lei": "aiuti",
      "noi": "aiutiamo",
      "voi": "aiutiate",
      "loro": "aiutino"
    },
    "Passato": {
      "io": "abbia aiutato",
      "tu": "abbia aiutato",
      "lui/lei": "abbia aiutato",
      "noi": "abbiamo aiutato",
      "voi": "abbiate aiutato",
      "loro": "abbiano aiutato"
    },
    "Imperfetto": {
      "io": "aiutassi",
      "tu": "aiutassi",
      "lui/lei": "aiutasse",
      "noi": "aiutassimo",
      "voi": "aiutaste",
      "loro": "aiutassero"
    },
    "Trapassato": {
      "io": "avessi aiutato",
      "tu": "avessi aiutato",
      "lui/lei": "avesse aiutato",
      "noi": "avessimo aiutato",
      "voi": "aveste aiutato",
      "loro": "avessero aiutato"
    }
  },
  "Condizionale": {
    "Presente": {
      "io": "aiuterei",
      "tu": "aiuteresti",
      "lui/lei": "aiuterebbe",
      "noi": "aiuteremmo",
      "voi": "aiutereste",
      "loro": "aiuterebbero"
    },
    "Passato": {
      "io": "avrei aiutato",
      "tu": "avresti aiutato",
      "lui/lei": "avrebbe aiutato",
      "noi": "avremmo aiutato",
      "voi": "avreste aiutato",
      "loro": "avrebbero aiutato"
    }
  },
  "Imperativo": {
    "Affirmativo": {
      "tu": "aiuta",
      "lui/lei": "aiuti",
      "noi": "aiutiamo",
      "voi": "aiutate",
      "loro": "aiutino"
    },
    "Negativo": {
      "tu": "non aiutare",
      "lui/lei": "non aiuti",
      "noi": "non aiutiamo",
      "voi": "non aiutate",
      "loro": "non aiutino"
    }
  },
  "Participio": {
    "Presente": "aiutante",
    "Passato": "aiutato"
  },
  "Gerundio": {
    "Presente": "aiutando",
    "Passato": "avendo aiutato"
  },
  "Infinito": {
    "Presente": "aiutare",
    "Passato": "avere aiutato"
  }
}
```

### Moods (Modi)

**1. Indicativo** (Indicative)

- Presente
- Passato Prossimo
- Imperfetto
- Trapassato Prossimo
- Futuro Semplice
- Passato Remoto

**2. Congiuntivo** (Subjunctive)

- Presente
- Passato
- Imperfetto
- Trapassato

**3. Condizionale** (Conditional)

- Presente
- Passato

**4. Imperativo** (Imperative)

- Affirmativo (5 persons: no "io")
- Negativo (5 persons: no "io")

**5. Participio** (Participle)

- Presente (simple string)
- Passato (simple string)

**6. Gerundio** (Gerund)

- Presente (simple string)
- Passato (simple string)

**7. Infinito** (Infinitive)

- Presente (simple string)
- Passato (simple string)

### Persons (Persone)

For most tenses:

- `io` - I
- `tu` - you (informal singular)
- `lui/lei` - he/she
- `noi` - we
- `voi` - you (plural/formal)
- `loro` - they

**Note:** Imperativo doesn't include "io"

### Prerequisites

**Important:** The verb must already exist in the `Verb` table before importing conjugations.

**Steps:**

1. First import verb translation (Manage Verbs tab)
2. Then import conjugation data (Manage Conjugations tab)

### Import Location

**Admin Panel:** Tab 3 - "Manage Conjugations"

**Sample File:** `data/samples/conjugations/aiutare.json`

---

## Noun Translations

Import Italian nouns with articles in singular and plural forms.

### Database Schema

**Table:** `Noun`

**Fields:**

- `id` - Unique identifier (auto-generated)
- `italian` - Base noun form without article (unique)
- `singolare` - JSONB: { it, pt, en }
- `plurale` - JSONB: { it, pt, en }
- `createdAt` - Timestamp (auto)
- `updatedAt` - Timestamp (auto)

### JSON Format

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

### Complete Example

```json
{
  "orologio": {
    "singolare": {
      "it": "l'orologio",
      "pt": "o relógio",
      "en": "the watch"
    },
    "plurale": {
      "it": "gli orologi",
      "pt": "os relógios",
      "en": "the clocks"
    }
  },
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
  },
  "casa": {
    "singolare": {
      "it": "la casa",
      "pt": "a casa",
      "en": "the house"
    },
    "plurale": {
      "it": "le case",
      "pt": "as casas",
      "en": "the houses"
    }
  },
  "studente": {
    "singolare": {
      "it": "lo studente",
      "pt": "o estudante",
      "en": "the student"
    },
    "plurale": {
      "it": "gli studenti",
      "pt": "os estudantes",
      "en": "the students"
    }
  },
  "amica": {
    "singolare": {
      "it": "l'amica",
      "pt": "a amiga",
      "en": "the friend (female)"
    },
    "plurale": {
      "it": "le amiche",
      "pt": "as amigas",
      "en": "the friends (female)"
    }
  }
}
```

### Field Specifications

**italian** (object key):

- Base noun form without articles
- Case-sensitive
- Unique across all nouns
- Examples: "libro", "casa", "orologio"

**singolare** (object):

- Contains three language translations
- Each includes the appropriate article
- Italian articles: il, lo, l', la
- Portuguese articles: o, a
- English article: the

**plurale** (object):

- Contains three language translations
- Each includes the appropriate article
- Italian articles: i, gli, le
- Portuguese articles: os, as
- English article: the

### Italian Article Rules

**Singular:**

- `il` - Before masculine nouns starting with consonants (except s+consonant, z, ps, gn, x, y)
- `lo` - Before masculine nouns starting with s+consonant, z, ps, gn, x, y
- `l'` - Before masculine/feminine nouns starting with vowels
- `la` - Before feminine nouns starting with consonants

**Plural:**

- `i` - Plural of "il"
- `gli` - Plural of "lo" and "l'" (masculine)
- `le` - Plural of "la" and "l'" (feminine)

### Import Location

**Admin Panel:** Tab 4 - "Manage Nouns"

**Sample File:** `data/samples/nouns.json`

---

## Adjective Translations

Import Italian adjectives with all gender and number forms.

### Database Schema

**Table:** `Adjective`

**Fields:**

- `id` - Unique identifier (auto-generated)
- `italian` - Masculine singular base form (unique)
- `maschile` - JSONB: { singolare: {it,pt,en}, plurale: {it,pt,en} }
- `femminile` - JSONB: { singolare: {it,pt,en}, plurale: {it,pt,en} }
- `createdAt` - Timestamp (auto)
- `updatedAt` - Timestamp (auto)

### JSON Format

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

### Complete Example

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
  },
  "alto": {
    "maschile": {
      "singolare": { "it": "alto", "pt": "alto", "en": "tall" },
      "plurale": { "it": "alti", "pt": "altos", "en": "tall" }
    },
    "femminile": {
      "singolare": { "it": "alta", "pt": "alta", "en": "tall" },
      "plurale": { "it": "alte", "pt": "altas", "en": "tall" }
    }
  },
  "grande": {
    "maschile": {
      "singolare": { "it": "grande", "pt": "grande", "en": "big" },
      "plurale": { "it": "grandi", "pt": "grandes", "en": "big" }
    },
    "femminile": {
      "singolare": { "it": "grande", "pt": "grande", "en": "big" },
      "plurale": { "it": "grandi", "pt": "grandes", "en": "big" }
    }
  },
  "rosso": {
    "maschile": {
      "singolare": { "it": "rosso", "pt": "vermelho", "en": "red" },
      "plurale": { "it": "rossi", "pt": "vermelhos", "en": "red" }
    },
    "femminile": {
      "singolare": { "it": "rossa", "pt": "vermelha", "en": "red" },
      "plurale": { "it": "rosse", "pt": "vermelhas", "en": "red" }
    }
  }
}
```

### Field Specifications

**italian** (object key):

- Masculine singular base form
- Case-sensitive
- Unique across all adjectives
- Examples: "basso", "alto", "grande"

**maschile** (object):

- Contains masculine forms
- `singolare`: Italian/Portuguese/English translations
- `plurale`: Italian/Portuguese/English translations

**femminile** (object):

- Contains feminine forms
- `singolare`: Italian/Portuguese/English translations
- `plurale`: Italian/Portuguese/English translations

### Italian Adjective Agreement Rules

**Regular Adjectives ending in -o:**

- Masculine singular: -o (basso)
- Masculine plural: -i (bassi)
- Feminine singular: -a (bassa)
- Feminine plural: -e (basse)

**Adjectives ending in -e:**

- Masculine/Feminine singular: -e (grande)
- Masculine/Feminine plural: -i (grandi)

**Note:** All four forms must be provided even if some are the same.

### Import Location

**Admin Panel:** Tab 5 - "Manage Adjectives"

**Sample File:** `data/samples/adjectives.json`

---

## Sample Files

Sample import files are provided in the `data/samples/` directory:

### Verbs

**File:** `data/samples/verbs.json`
**Contains:** 5 example Italian verbs with translations

### Nouns

**File:** `data/samples/nouns.json`
**Contains:** 5 example Italian nouns with all forms

### Adjectives

**File:** `data/samples/adjectives.json`
**Contains:** 10 example Italian adjectives with all forms

### Conjugations

**File:** `data/samples/conjugations/aiutare.json`
**Contains:** Complete conjugation for verb "aiutare"

### Using Sample Files

1. Download or copy sample files as templates
2. Modify with your own vocabulary
3. Validate JSON syntax
4. Import through admin panel

---

## Troubleshooting

### JSON Validation Errors

**Error:** "Invalid JSON format"

**Solutions:**

1. Validate JSON at [jsonlint.com](https://jsonlint.com)
2. Check for:
   - Missing commas between objects
   - Extra commas before closing braces
   - Unmatched brackets { } or [ ]
   - Missing quotes around strings
   - Wrong quote types (use " not ')

**Common Mistakes:**

```json
// ❌ Wrong - extra comma
{
  "verbo": {...},
}

// ✅ Correct
{
  "verbo": {...}
}

// ❌ Wrong - single quotes
{'verbo': 'value'}

// ✅ Correct - double quotes
{"verbo": "value"}

// ❌ Wrong - boolean as string
{"regular": "true"}

// ✅ Correct - boolean without quotes
{"regular": true}
```

### Missing Required Fields

**Error:** "Missing required fields"

**Solutions:**

1. Check each entry has all required fields
2. Verify field names match exactly (case-sensitive)
3. Ensure booleans use `true`/`false` (not strings)
4. Verify nested structure is correct

**Required Fields by Type:**

**Verbs:**

- `regular` (boolean)
- `reflexive` (boolean)
- `tr_ptBR` (string)

**Conjugations:**

- All moods and tenses required
- All persons required (except Imperativo)

**Nouns:**

- `singolare.it`, `singolare.pt`, `singolare.en`
- `plurale.it`, `plurale.pt`, `plurale.en`

**Adjectives:**

- `maschile.singolare.{it,pt,en}`
- `maschile.plurale.{it,pt,en}`
- `femminile.singolare.{it,pt,en}`
- `femminile.plurale.{it,pt,en}`

### Import Conflicts

**Error:** "Conflicts detected"

**This is normal behavior!** It means you're trying to import vocabulary that already exists.

**Solutions:**

1. Review conflicts in the dialog
2. Compare existing vs new data
3. Choose action for each:
   - Keep Existing - Preserve current data
   - Replace with New - Update with imported data
4. Resolve all conflicts before continuing

### Verb Not Found (Conjugations)

**Error:** "Some verbs do not exist in the database"

**Cause:** Trying to import conjugations for verbs not yet in database

**Solution:**

1. Go to "Manage Verbs" tab first
2. Import verb translations
3. Then return to "Manage Conjugations"
4. Import conjugation data

### File Name Mismatch (Conjugations)

**Error:** "Verb not found: filename"

**Cause:** JSON file name doesn't match a verb in the database

**Solution:**

1. Rename file to match verb infinitive exactly
2. Example: "aiutare.json" for verb "aiutare"
3. File name is case-sensitive

### Prisma Client Error

**Error:** "Cannot read properties of undefined (reading 'findMany')"

**Cause:** Prisma client not generated after schema changes

**Solution:**

```bash
npx prisma generate
npx prisma db push
yarn dev
```

### Import Hangs or Fails

**Possible Causes:**

1. Large file size (too many items)
2. Network timeout
3. Database connection issue

**Solutions:**

1. Split large files into smaller batches
2. Check network connection
3. Verify database is accessible
4. Check browser console for errors

### Encoding Issues

**Error:** Characters appear incorrectly (à becomes Ã )

**Cause:** File encoding is not UTF-8

**Solution:**

1. Save JSON files as UTF-8 encoding
2. Most editors have "Save with encoding" option
3. Verify Italian characters display correctly

### Best Practices

**To Avoid Issues:**

1. **Start Small**
   - Test with 1-5 items first
   - Verify import works correctly
   - Then import larger batches

2. **Validate Before Import**
   - Use JSON validator
   - Check all required fields
   - Verify data types

3. **Backup Your Data**
   - Keep original JSON files
   - Export database before large imports
   - Test in development first

4. **Consistent Formatting**
   - Use same style throughout
   - Match Italian grammar rules
   - Verify article usage

5. **Review After Import**
   - Check data in tables
   - Test in practice mode
   - Verify statistics work

---

## Additional Resources

- **ADMIN_GUIDE.md** - Complete administrator guide
- **FEATURES.md** - Feature documentation
- **README.md** - General application documentation

For technical support or questions about import formats, refer to the admin guide or check the sample files in `data/samples/`.
