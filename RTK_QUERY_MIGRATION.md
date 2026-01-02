# RTK Query Migration Complete

This document describes the migration from `fetch` to RTK Query (Redux Toolkit Query) that has been completed in the Italiano application.

## What Was Done

### 1. **Installed Dependencies**

- `@reduxjs/toolkit` - Redux Toolkit with RTK Query
- `react-redux` - React bindings for Redux

### 2. **Created Redux Store Structure**

- **`app/store/api.ts`** - Main API slice with all endpoints
- **`app/store/store.ts`** - Redux store configuration
- **`app/store/ReduxProvider.tsx`** - Redux provider component

### 3. **Set Up Redux Provider**

- Wrapped the app with `ReduxProvider` in `app/layout.tsx`

### 4. **Migrated All Components**

The following components were migrated from `fetch` to RTK Query hooks:

- ✅ **AuthContext** - Login and registration
- ✅ **AdminPanel** - User management (get, update, delete users)
- ✅ **AdminVerbs Page** - Verb management (get and import verbs)
- ✅ **ChangePasswordModal** - Password change

## Available API Hooks

### Authentication Hooks

```typescript
import {
  useLoginMutation,
  useRegisterMutation,
  useChangePasswordMutation,
} from '../store/api'

// Usage
const [login, { isLoading }] = useLoginMutation()
const [register, { isLoading }] = useRegisterMutation()
const [changePassword, { isLoading }] = useChangePasswordMutation()
```

### Admin User Management Hooks

```typescript
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../store/api'

// Usage
const { data, isLoading, error } = useGetUsersQuery()
const [updateUser] = useUpdateUserMutation()
const [deleteUser] = useDeleteUserMutation()
```

### Admin Verb Management Hooks

```typescript
import { useGetVerbsQuery, useImportVerbsMutation } from '../store/api'

// Usage
const { data, isLoading, error } = useGetVerbsQuery()
const [importVerbs, { isLoading }] = useImportVerbsMutation()
```

## Key Benefits of RTK Query

### 1. **Automatic Caching**

- Data is automatically cached and reused across components
- No need to manage loading states manually in most cases

### 2. **Automatic Refetching**

- Queries automatically refetch when data becomes stale
- Mutations can invalidate related queries using tags

### 3. **Optimistic Updates**

- UI updates immediately, with automatic rollback on errors

### 4. **Built-in Loading & Error States**

- No need to manage separate `loading` and `error` states
- Hooks provide `isLoading`, `isFetching`, `error` automatically

### 5. **Request Deduplication**

- Multiple components requesting the same data only trigger one request

### 6. **Centralized Authentication**

- Token management is handled in the `baseQuery`
- All requests automatically include the auth token

## How to Add New Endpoints

To add a new API endpoint, edit `app/store/api.ts`:

```typescript
export const api = createApi({
  // ... existing config
  endpoints: (builder) => ({
    // ... existing endpoints

    // Add your new endpoint here
    getMyData: builder.query<MyDataType, void>({
      query: () => '/api/my-endpoint',
      providesTags: ['MyData'],
    }),

    updateMyData: builder.mutation<ResponseType, PayloadType>({
      query: (data) => ({
        url: '/api/my-endpoint',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MyData'], // Refetch related queries
    }),
  }),
})

// Export the auto-generated hooks
export const { useGetMyDataQuery, useUpdateMyDataMutation } = api
```

## Type Safety

All API responses and requests are fully typed. Types are defined in `app/store/api.ts`:

- `User` - User object
- `UserData` - User with lesson count
- `AuthResponse` - Login/register response
- `VerbData` - Verb data structure
- `ImportedVerb` - Verb from database
- `ConflictVerb` - Conflict during import

## Cache Tags

The following cache tags are used for automatic refetching:

- **`Users`** - Invalidated when users are created, updated, or deleted
- **`Verbs`** - Invalidated when verbs are imported
- **`Auth`** - Invalidated when login/register occurs

## Example: Using in a New Component

```typescript
'use client'
import { useGetUsersQuery } from '../store/api'

export default function MyComponent() {
  const { data, isLoading, error } = useGetUsersQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  const users = data?.users || []

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  )
}
```

## Example: Using Mutations

```typescript
'use client'
import { useUpdateUserMutation } from '../store/api'

export default function MyComponent() {
  const [updateUser, { isLoading }] = useUpdateUserMutation()

  const handleUpdate = async (userId: string) => {
    try {
      await updateUser({ userId, admin: true }).unwrap()
      // Success!
    } catch (err) {
      const error = err as { data?: { error?: string } }
      console.error(error?.data?.error || 'Update failed')
    }
  }

  return (
    <button onClick={() => handleUpdate('123')} disabled={isLoading}>
      Update User
    </button>
  )
}
```

## Migration Complete ✅

All components in the application now use RTK Query instead of fetch. The application benefits from:

- Centralized API management
- Automatic caching and refetching
- Type-safe API calls
- Better developer experience
- Improved performance

## Additional Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query Tutorials](https://redux-toolkit.js.org/tutorials/rtk-query)
- [RTK Query Usage Guide](https://redux-toolkit.js.org/rtk-query/usage/queries)
