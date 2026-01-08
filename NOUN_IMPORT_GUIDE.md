# Noun Import Guide

This guide explains how to use the noun import feature in the Italiano app.

## Overview

The noun import feature allows administrators to bulk import Italian nouns with their translations to Portuguese (BR) and English in both singular and plural forms from a JSON file.

## Database Schema

The `Noun` model in the database contains:

- `italian` - The noun in Italian (base form without article, unique)
- `singolare` - JSON object with singular translations: `{ it, pt, en }`
- `plurale` - JSON object with plural translations: `{ it, pt, en }`

## JSON Format

The import file must be a valid JSON file with the following structure:

```json
{
  "nounBaseForm": {
    "singolare": {
      "it": "string with article",
      "pt": "string with article",
      "en": "string with article"
    },
    "plurale": {
      "it": "string with article",
      "pt": "string with article",
      "en": "string with article"
    }
  }
}
```

### Example

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
  }
}
```

## Key Format Notes

- The **key** is the base noun in Italian without articles (e.g., "orologio", "libro", "casa")
- The **values** include the appropriate articles:
  - Italian articles: il, lo, l', la (singular) / i, gli, le (plural)
  - Portuguese articles: o, a (singular) / os, as (plural)
  - English article: the

## How to Import Nouns

1. **Access the Admin Panel**
   - Log in as an administrator
   - Navigate to `/admin`
   - Click on "Manage Nouns" tab

2. **Prepare Your JSON File**
   - Create or update a JSON file following the format above
   - A sample file is included: `data/samples/nouns.json`

3. **Upload the File**
   - Click "Choose JSON File" button
   - Select your JSON file
   - The system will validate the JSON format

4. **Import the Nouns**
   - Click "Import Nouns" button
   - If there are no conflicts, the nouns will be imported immediately

5. **Resolve Conflicts (if any)**
   - If any nouns already exist in the database, you'll see a conflict dialog
   - Review the existing data vs. the new data side by side
   - For each conflict, choose:
     - **Keep Existing**: Maintain the current database entry
     - **Replace with New**: Overwrite with the imported data
   - Once all conflicts are resolved, click "Continue Import"

## Conflict Resolution

When importing nouns that already exist in the database:

1. A dialog will appear showing all conflicts
2. For each noun, you'll see:
   - **Existing Data**: Current database values
   - **New Data**: Values from your import file
3. Choose an action for each conflicting noun:
   - **Keep Existing**: Skip this noun, keep current data
   - **Replace with New**: Update the noun with imported data
4. You must resolve all conflicts before the import can proceed

## Tips

- Include articles in translations to help learners understand proper usage
- Use the correct Italian articles based on gender and initial sound
- Ensure consistency in translation style across all entries
- Test with a small sample file first before bulk importing

## Error Handling

- Invalid JSON files will be rejected immediately
- The system validates the structure before attempting import
- All database operations are transactional - if an error occurs, no partial data is saved

## Viewing Imported Nouns

After successful import, you can view all nouns in the "Current Nouns in Database" table, which shows:

- Italian base form
- Singular forms in all three languages
- Plural forms in all three languages
- Last update timestamp

## Technical Notes

- The import process uses PostgreSQL's JSONB type for efficient storage
- Nouns are indexed by their Italian base form for fast lookup
- The API requires admin authentication via JWT token
