# Verb Import Guide

This guide explains how to use the verb import feature in the Italiano app.

## Overview

The verb import feature allows administrators to bulk import Italian verbs with their translations to Portuguese (BR) and English from a JSON file.

## Database Schema

The `Verb` model in the database contains:

- `italian` - The verb infinitive in Italian (unique)
- `tr_ptBR` - Portuguese (Brazil) translation
- `tr_en` - English translation (optional)
- `regular` - Boolean indicating if the verb is regular
- `reflexive` - Boolean indicating if the verb is reflexive

## JSON Format

The import file must be a valid JSON file with the following structure:

```json
{
  "verbInfinitive": {
    "regular": boolean,
    "reflexive": boolean,
    "tr_ptBR": "string",
    "tr_en": "string (optional)"
  }
}
```

### Example

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
  }
}
```

## How to Import Verbs

1. **Access the Admin Panel**
   - Log in as an administrator
   - Navigate to `/admin`
   - Click on "Manage Verbs" button

2. **Prepare Your JSON File**
   - Create or update a JSON file following the format above
   - A sample file is included: `data/samples/verbs.json`

3. **Upload the File**
   - Click "Choose JSON File" button
   - Select your JSON file
   - The system will validate the JSON format

4. **Import the Verbs**
   - Click "Import Verbs" button
   - If there are no conflicts, the verbs will be imported immediately

5. **Resolve Conflicts (if any)**
   - If any verbs already exist in the database, you'll see a conflict dialog
   - For each conflicting verb, you can:
     - View the existing data
     - View the new data from your file
     - Choose to "Keep Existing" or "Replace with New"
   - Once all conflicts are resolved, click "Continue Import"

## API Endpoints

### Import Verbs

- **Endpoint:** `POST /api/admin/verbs/import`
- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "verbs": {
      "verbInfinitive": {
        "regular": boolean,
        "reflexive": boolean,
        "tr_ptBR": "string",
        "tr_en": "string (optional)"
      }
    },
    "resolveConflicts": {
      "verbInfinitive": "keep" | "replace"
    } (optional)
  }
  ```

### Get All Verbs

- **Endpoint:** `GET /api/admin/verbs/import`
- **Authentication:** Required (Admin only)
- **Response:**
  ```json
  {
    "verbs": [
      {
        "italian": "string",
        "regular": boolean,
        "reflexive": boolean,
        "tr_ptBR": "string",
        "tr_en": "string | null",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ]
  }
  ```

## Features

- ✅ Bulk import from JSON files
- ✅ Automatic conflict detection
- ✅ Side-by-side comparison of existing vs new data
- ✅ Choose to keep or replace conflicting records
- ✅ View all imported verbs in a table
- ✅ Real-time validation of JSON format
- ✅ Success and error notifications

## Notes

- Only administrators can access the verb import feature
- The Italian verb infinitive must be unique (case-sensitive)
- All existing verbs are preserved unless explicitly replaced during conflict resolution
- The import process is transactional - if an error occurs, no changes are made
