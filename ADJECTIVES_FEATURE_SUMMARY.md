# Adjectives Management Feature - Implementation Summary

## Overview

This document summarizes the implementation of the Adjectives management feature for the Italiano learning application. The feature is similar to the Nouns management system but adapted for adjectives with masculine/feminine and singular/plural forms.

## Changes Made

### 1. Database Schema

Added new models to `/prisma/schema.prisma`:

#### Adjective Model
```prisma
model Adjective {
  id          String               @id @default(cuid())
  italian     String               @unique // The adjective in Italian (masculine singular base form)
  maschile    Json                 // Masculine forms with translations { singolare: { it, pt, en }, plurale: { it, pt, en } }
  femminile   Json                 // Feminine forms with translations { singolare: { it, pt, en }, plurale: { it, pt, en } }
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  statistics  AdjectiveStatistic[]
}
```

#### AdjectiveStatistic Model
```prisma
model AdjectiveStatistic {
  id              String     @id @default(cuid())
  userId          String
  adjectiveId     String
  correctAttempts Int        @default(0)
  wrongAttempts   Int        @default(0)
  lastPracticed   DateTime   @default(now())
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  adjective       Adjective  @relation(fields: [adjectiveId], references: [id], onDelete: Cascade)

  @@unique([userId, adjectiveId])
  @@index([userId])
  @@index([adjectiveId])
}
```

**Note:** You need to run the following command to apply the schema changes:
```bash
yarn prisma db push
# or
npx prisma db push
```

### 2. API Endpoints

Created API routes for adjectives management:

#### `/app/api/admin/adjectives/import/route.ts`
- **POST** endpoint for importing adjectives with conflict resolution
- **GET** endpoint for fetching all adjectives (admin only)
- Authentication via JWT tokens
- Conflict detection and resolution logic

#### `/app/api/admin/adjectives/[adjectiveId]/route.ts`
- **PATCH** endpoint for updating individual adjectives
- **DELETE** endpoint for deleting adjectives (cascades to statistics)
- Admin-only access with JWT authentication

### 3. RTK Query Store Updates

Updated `/app/store/api.ts` with:

#### New TypeScript Interfaces:
- `AdjectiveTranslations` - Translation structure (it, pt, en)
- `AdjectiveGenderForms` - Gender-specific forms (singolare, plurale)
- `AdjectiveData` - Complete adjective data (maschile, femminile)
- `ImportedAdjective` - Adjective from database
- `ConflictAdjective` - Conflict resolution data
- `ImportAdjectivesResponse` - Import operation response
- `AdjectiveForPractice` - Practice mode data
- `AdjectiveStatistic` - User statistics
- `AdjectiveStatisticsMap` - Statistics mapping

#### Added Tag Types:
- `'Adjectives'` - For admin adjective management
- `'AdjectivesPractice'` - For practice mode
- `'AdjectiveStatistics'` - For user statistics

#### New Endpoints:
- `getAdjectives` - Fetch all adjectives (admin)
- `importAdjectives` - Import adjectives with conflict resolution
- `updateAdjective` - Update an adjective
- `deleteAdjective` - Delete an adjective
- `getAdjectivesForPractice` - Fetch adjectives for practice
- `getAdjectiveStatistics` - Fetch user statistics
- `updateAdjectiveStatistic` - Update practice statistics
- `resetAdjectiveStatistic` - Reset statistics for an adjective

#### Exported Hooks:
- `useGetAdjectivesQuery`
- `useImportAdjectivesMutation`
- `useUpdateAdjectiveMutation`
- `useDeleteAdjectiveMutation`
- `useGetAdjectivesForPracticeQuery`
- `useGetAdjectiveStatisticsQuery`
- `useUpdateAdjectiveStatisticMutation`
- `useResetAdjectiveStatisticMutation`

### 4. Admin Panel Components

Created complete component structure under `/app/components/AdminPanel/internals/ManageAdjectives/`:

#### Main Component
- `ManageAdjectives.tsx` - Container component

#### Internal Components (`internals/` folder)
- `ImportAdjectives.tsx` - File upload and import functionality
- `AdjectivesList.tsx` - Table display with search and pagination
- `EditAdjectiveDialog.tsx` - Edit dialog with all form fields
- `DeleteAdjectiveDialog.tsx` - Confirmation dialog for deletion
- `index.ts` - Exports for internal components

### 5. Admin Panel Integration

Updated `/app/components/AdminPanel/AdminPanel.tsx`:
- Added new "Manage Adjectives" tab (5th tab)
- Integrated ManageAdjectives component
- Updated imports and exports

### 6. JSON Import Format

The import feature expects JSON files with the following structure:

```json
{
  "basso": {
    "maschile": {
      "singolare": {
        "it": "basso",
        "pt": "baixo",
        "en": "short"
      },
      "plurale": {
        "it": "bassi",
        "pt": "baixos",
        "en": "short"
      }
    },
    "femminile": {
      "singolare": {
        "it": "bassa",
        "pt": "baixa",
        "en": "short"
      },
      "plurale": {
        "it": "basse",
        "pt": "baixas",
        "en": "short"
      }
    }
  }
}
```

### 7. Key Features

#### Import System
- JSON file upload with validation
- Preview of data before import
- Conflict detection for existing adjectives
- Side-by-side comparison of existing vs. new data
- User decides: Keep existing or Replace with new

#### Adjectives List
- Searchable table with real-time filtering
- Pagination (10, 25, 50, 100 items per page)
- Displays all forms (masculine/feminine, singular/plural)
- Edit and delete actions for each adjective
- Responsive design with Material-UI

#### Edit Functionality
- Full form with all fields editable
- Separate sections for masculine and feminine forms
- Validation and error handling
- Real-time updates

#### Delete Functionality
- Confirmation dialog with adjective details
- Warning about cascade deletion of statistics
- Safe deletion with error handling

## How to Use

### Step 1: Apply Database Changes

The database schema has been updated. You need to push the changes:

```bash
yarn prisma db push
```

**Note:** If you encounter a Node.js version error, you may need to update Node.js to version 22.12.0 or higher, or the schema will be applied when the server restarts with a compatible setup.

### Step 2: Restart Development Server

If it's running, restart it:

```bash
# Press Ctrl+C to stop
yarn dev
```

### Step 3: Access Admin Panel

1. Log in as an admin user
2. Navigate to http://localhost:3000/admin
3. Click on the **"Manage Adjectives"** tab (5th tab)

### Step 4: Import Adjectives

1. Click "Choose JSON File" and select your JSON file
2. Review the preview showing the number of adjectives
3. Click "Import Adjectives"
4. If conflicts are found, resolve them by choosing to keep existing or replace with new data
5. Click "Continue Import" to complete the process

### Step 5: Manage Adjectives

- Use the search box to filter adjectives by Italian name
- Click the edit icon to modify an adjective
- Click the delete icon to remove an adjective
- Use pagination controls to navigate through the list

## Technical Details

### Component Architecture

```
ManageAdjectives/
├── ManageAdjectives.tsx          # Main container
├── index.ts                      # Export
└── internals/
    ├── ImportAdjectives.tsx      # Import functionality
    ├── AdjectivesList.tsx        # List with CRUD
    ├── EditAdjectiveDialog.tsx   # Edit modal
    ├── DeleteAdjectiveDialog.tsx # Delete confirmation
    └── index.ts                  # Exports
```

### Data Flow

1. **Import**: JSON → Validation → Conflict Check → Database
2. **List**: Database → RTK Query → Component → Table Display
3. **Edit**: Form → Validation → API → Database → Refresh List
4. **Delete**: Confirmation → API → Database → Refresh List

### Error Handling

- JSON validation on file upload
- API error responses with user-friendly messages
- Loading states during async operations
- Optimistic UI updates with RTK Query

### Performance Optimizations

- Deferred search input for responsive filtering
- Memoized filtered and paginated data
- Transition API for smooth UI updates
- Pagination to limit rendered items

## Files Created/Modified

### Created Files
1. `/prisma/schema.prisma` - Added Adjective and AdjectiveStatistic models
2. `/app/api/admin/adjectives/import/route.ts` - Import and list endpoints
3. `/app/api/admin/adjectives/[adjectiveId]/route.ts` - Update and delete endpoints
4. `/app/components/AdminPanel/internals/ManageAdjectives/ManageAdjectives.tsx`
5. `/app/components/AdminPanel/internals/ManageAdjectives/index.ts`
6. `/app/components/AdminPanel/internals/ManageAdjectives/internals/ImportAdjectives.tsx`
7. `/app/components/AdminPanel/internals/ManageAdjectives/internals/AdjectivesList.tsx`
8. `/app/components/AdminPanel/internals/ManageAdjectives/internals/EditAdjectiveDialog.tsx`
9. `/app/components/AdminPanel/internals/ManageAdjectives/internals/DeleteAdjectiveDialog.tsx`
10. `/app/components/AdminPanel/internals/ManageAdjectives/internals/index.ts`

### Modified Files
1. `/app/store/api.ts` - Added adjective types and endpoints
2. `/app/components/AdminPanel/AdminPanel.tsx` - Added Manage Adjectives tab
3. `/app/components/AdminPanel/internals/index.ts` - Exported ManageAdjectives

## Next Steps

After applying the database schema changes, the Adjectives management feature will be fully functional. You can:

1. Import adjectives from JSON files
2. View and search through all adjectives
3. Edit existing adjectives
4. Delete adjectives (with cascade deletion of statistics)
5. Use the adjectives in practice modes (endpoints are ready)

## Notes

- All text, comments, and filenames are in English as per project requirements
- The feature follows the same patterns as the Nouns management system
- RTK Query is used for API state management and data fetching
- Components follow the project's structure with internals folders for child components
- The system is fully integrated with the existing authentication and authorization

