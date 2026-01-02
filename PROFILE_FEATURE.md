# Native Language Profile Feature

## Overview

This feature allows users to select their native language (Portuguese-BR or English) in their profile settings. The setting is stored in the database and can be used throughout the application to show translations in the user's preferred language.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)

- Created new `UserProfile` table with the following fields:
  - `id`: Unique identifier
  - `userId`: Foreign key to User table (one-to-one relationship)
  - `nativeLanguage`: String field with default value "pt-BR" (options: "pt-BR" or "en")
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp
- Added relation to User model

### 2. API Endpoint (`app/api/profile/route.ts`)

Created new profile endpoint with two methods:

- **GET /api/profile**: Retrieves user's profile (creates one with defaults if it doesn't exist)
- **PATCH /api/profile**: Updates user's profile with new native language preference

### 3. RTK Query API (`app/store/api.ts`)

Added new endpoints and types:

- `UserProfile` interface
- `getProfile` query
- `updateProfile` mutation
- Exported hooks: `useGetProfileQuery`, `useUpdateProfileMutation`

### 4. Settings Modal (`app/components/SettingsModal.tsx`)

Completely redesigned the Settings Modal to include:

- Native language selection with radio buttons (Português (Brasil) / English)
- Loading state while fetching profile data
- Success/error messages
- Automatic profile creation if it doesn't exist
- Proper form reset when modal opens/closes

## How to Apply

### Step 1: Run Database Migration

Execute the following command to create the UserProfile table in your database:

```bash
npx prisma migrate dev --name add_user_profile_table
```

This will:

1. Create a new migration file
2. Apply the migration to your database
3. Create the `UserProfile` table
4. Regenerate the Prisma Client

### Step 2: (Optional) Create Default Profiles for Existing Users

If you have existing users in your database, you may want to create default profiles for them. You can run this script in the Prisma Studio console or create a migration script:

```typescript
// This will be automatically handled by the API endpoint
// When a user opens their profile for the first time,
// a profile with default values will be created automatically
```

### Step 3: Test the Feature

1. Start your development server: `yarn dev`
2. Log in to your application
3. Click on your user menu (avatar icon)
4. Click on "Profile Settings"
5. You should see the native language selection
6. Choose your preferred language and click "Save"
7. The setting should be saved successfully

## Usage in Other Parts of the Application

To use the native language setting in other components:

```typescript
import { useGetProfileQuery } from '@/app/store/api'

function MyComponent() {
  const { data } = useGetProfileQuery()
  const nativeLanguage = data?.profile?.nativeLanguage || 'pt-BR'

  // Use nativeLanguage to determine which translation to show
  const translation = nativeLanguage === 'pt-BR' ? verb.tr_ptBR : verb.tr_en

  return <div>{translation}</div>
}
```

## Database Structure

```
User (1) -------- (1) UserProfile
  |                      |
  id <---------------> userId
                         nativeLanguage (default: "pt-BR")
```

## Future Enhancements

- Add more language options (e.g., Spanish, French, Italian)
- Add other profile preferences (theme, notifications, etc.)
- Use the native language setting automatically in verb/word translation pages
