# Verb Conjugation Practice Feature - Implementation Guide

## Overview

A comprehensive verb conjugation practice page has been implemented that allows users to practice conjugating Italian verbs across all enabled tenses. The page includes verb filtering, individual statistics per conjugation, and persistent user preferences.

## Features Implemented

### 1. **Verb Selection and Filtering**

- **Verb Type Filter**: Dropdown to filter verbs by type:
  - All (default)
  - Regular
  - Irregular
  - Reflexive
- **Filter Persistence**: The selected filter is saved to localStorage with the user's ID as a key, so each user's preference is preserved
- **Verb Dropdown**: Select any verb from the filtered list to practice conjugations

### 2. **Conjugation Practice**

- **Dynamic Input Fields**: Input boxes are generated for each person (io, tu, lui/lei, noi, voi, loro) for all verb tenses enabled in the user's profile
- **Special Form Support**: Handles simple forms like Participio, Gerundio, and Infinito (single input fields)
- **Person-Based Conjugations**: Handles standard tenses with multiple persons (6 input fields per tense)

### 3. **Validation System**

- **Real-time Validation**: Validates answers on blur (when user leaves input) or on Enter key press
- **Visual Feedback**:
  - Green background for correct answers
  - Red background for incorrect answers
  - Returns to normal when user starts typing again
- **Accent-Insensitive**: Uses normalized string comparison (removes accents, case-insensitive)
- **Duplicate Prevention**: Prevents duplicate validations within 100ms

### 4. **Statistics Tracking**

- **Granular Statistics**: Each verb person/verb tense combination has its own statistics
- **Visual Display**: Shows correct (green chip) and wrong (red chip) attempt counts next to each input
- **Persistent Storage**: Statistics are saved to the database and retrieved on page load
- **Reset Functionality**: Users can reset all statistics for a selected verb via a confirmation dialog

### 5. **User Experience Features**

- **Clear Button**: Each input has a clear button to quickly erase the field
- **Show Answer Button**: Light bulb icon to reveal the correct answer
- **Keyboard Navigation**: Press Enter to validate and move focus (planned feature)
- **Tooltips**: Helpful tooltips throughout the interface
- **Responsive Layout**: Works well on different screen sizes

## Database Schema

### New Model: ConjugationStatistic

```prisma
model ConjugationStatistic {
  id              String   @id @default(cuid())
  userId          String
  verbId          String
  mood            String   // e.g., "Indicativo", "Congiuntivo"
  tense           String   // e.g., "Presente", "Passato Prossimo"
  person          String   // e.g., "io", "tu", "lui/lei", "noi", "voi", "loro"
  correctAttempts Int      @default(0)
  wrongAttempts   Int      @default(0)
  lastPracticed   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, verbId, mood, tense, person])
  @@index([userId])
  @@index([verbId])
  @@index([userId, verbId])
}
```

## API Endpoints

### 1. GET `/api/verbs/conjugations`

- **Purpose**: Get all verbs with their conjugations for practice
- **Authentication**: Required (Bearer token)
- **Response**: Array of verbs with conjugation data in user's native language

### 2. GET `/api/verbs/conjugations/statistics`

- **Purpose**: Get all conjugation statistics for the logged-in user
- **Authentication**: Required
- **Response**: Statistics map with keys in format `verbId:mood:tense:person`

### 3. POST `/api/verbs/conjugations/statistics`

- **Purpose**: Update statistics for a specific conjugation
- **Authentication**: Required
- **Body**: `{ verbId, mood, tense, person, correct }`
- **Response**: Updated statistic

### 4. DELETE `/api/verbs/conjugations/statistics/[verbId]`

- **Purpose**: Reset all conjugation statistics for a specific verb
- **Authentication**: Required
- **Response**: Success message

## Frontend Implementation

### Location

`/app/verb-tenses/page.tsx`

### Key Components

#### State Management

- `selectedVerbId`: Currently selected verb
- `verbTypeFilter`: Filter for verb types (persisted in localStorage)
- `inputValues`: User inputs for all conjugation fields
- `validationState`: Validation status for each input
- `resetDialog`: Dialog state for confirming statistics reset

#### RTK Query Hooks

- `useGetVerbsForConjugationPracticeQuery()`: Fetches verbs with conjugations
- `useGetConjugationStatisticsQuery()`: Fetches user's statistics
- `useUpdateConjugationStatisticMutation()`: Updates a single statistic
- `useResetConjugationStatisticsMutation()`: Resets all statistics for a verb
- `useGetProfileQuery()`: Gets user profile for enabled tenses and native language

#### Key Functions

- `renderConjugationInputs()`: Dynamically renders input fields based on enabled tenses
- `handleValidation()`: Validates user input and updates statistics
- `handleInputChange()`: Updates input value and clears validation state
- `handleClearInput()`: Clears input field and refocuses
- `handleShowAnswer()`: Displays correct answer in input field

## User Preferences Integration

The feature integrates with the existing user profile settings:

1. **Native Language**: Displays verb translations in user's preferred language (pt-BR or en)
2. **Enabled Verb Tenses**: Only shows conjugation inputs for tenses enabled in user settings (configurable in Settings Modal)

## LocalStorage Structure

```typescript
// Key format: verbTypeFilter_{userId}
// Example: verbTypeFilter_cm5abc123xyz456
// Value: 'all' | 'regular' | 'irregular' | 'reflexive'
```

## Usage Flow

1. User navigates to **Verb Tenses** page
2. (Optional) Selects verb type filter (persisted per user)
3. Selects a verb from the dropdown
4. Page displays input fields for all enabled tenses
5. User types conjugations and presses Enter or clicks away to validate
6. Visual feedback shows correct/incorrect
7. Statistics are updated in real-time
8. User can view statistics, clear inputs, show answers, or reset stats

## Testing Checklist

- [x] Database migration applied successfully
- [x] API endpoints respond correctly
- [x] Frontend builds without errors
- [ ] Verb selection and filtering works
- [ ] Input validation works correctly
- [ ] Statistics are saved and displayed
- [ ] Reset statistics works
- [ ] LocalStorage persistence works
- [ ] Works with different user profiles
- [ ] Handles all verb types (regular, irregular, reflexive)
- [ ] Handles all tense types (person-based and simple forms)

## Future Enhancements

1. **Keyboard Navigation**: Auto-focus next input after Enter key
2. **Progress Indicators**: Show overall progress for each verb
3. **Practice Modes**:
   - Focus on weak conjugations (most errors)
   - Timed challenges
   - Random verb selection
4. **Export Statistics**: Download practice history
5. **Conjugation Tips**: Show grammar rules for specific tenses
6. **Audio Pronunciation**: Add audio for each conjugation
7. **Mobile Optimization**: Improve touch targets and layout

## Notes

- All text, comments, and filenames follow the English-only rule
- Uses RTK Query for state management as specified
- Statistics are granular (per verb-tense-person combination)
- Similar validation and UX patterns as nouns and adjectives pages
- Fully integrated with existing authentication and profile system
