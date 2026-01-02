import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for API responses
export interface User {
  id: string
  username: string
  email: string
  name: string | null
  admin: boolean
  createdAt?: string
  _count?: {
    lessons: number
  }
}

export interface UserProfile {
  id: string
  userId: string
  nativeLanguage: 'pt-BR' | 'en'
  createdAt: string
  updatedAt: string
}

export interface UserData extends User {
  _count: {
    lessons: number
  }
}

export interface AuthResponse {
  user: User
  token: string
}

export interface VerbData {
  regular: boolean
  reflexive: boolean
  tr_ptBR: string
  tr_en?: string
}

export interface ImportedVerb {
  italian: string
  regular: boolean
  reflexive: boolean
  tr_ptBR: string
  tr_en: string | null
  createdAt: string
  updatedAt: string
}

export interface ConflictVerb {
  italian: string
  existing: {
    regular: boolean
    reflexive: boolean
    tr_ptBR: string
    tr_en: string | null
  }
  new: VerbData
}

export interface ImportVerbsResponse {
  message: string
  imported?: number
  conflicts?: ConflictVerb[]
}

export interface VerbForPractice {
  id: string
  italian: string
  translation: string
  regular: boolean
  reflexive: boolean
}

export interface VerbStatistic {
  correctAttempts: number
  wrongAttempts: number
  lastPracticed: Date
}

export interface VerbStatisticsMap {
  [verbId: string]: VerbStatistic
}

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('italiano_token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Define the API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Users', 'Verbs', 'Auth', 'Profile', 'VerbsPractice', 'VerbStatistics'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<
      AuthResponse,
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<
      AuthResponse,
      { username: string; email: string; password: string; name?: string }
    >({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (passwords) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwords,
      }),
    }),

    // Profile endpoints
    getProfile: builder.query<{ profile: UserProfile }, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<
      { message: string; profile: UserProfile },
      { nativeLanguage: 'pt-BR' | 'en' }
    >({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Admin User endpoints
    getUsers: builder.query<{ users: UserData[] }, void>({
      query: () => '/admin/users',
      providesTags: ['Users'],
    }),
    updateUser: builder.mutation<
      { user: UserData },
      { userId: string; admin: boolean }
    >({
      query: ({ userId, admin }) => ({
        url: `/admin/users/${userId}`,
        method: 'PATCH',
        body: { admin },
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Admin Verb endpoints
    getVerbs: builder.query<{ verbs: ImportedVerb[] }, void>({
      query: () => '/admin/verbs/import',
      providesTags: ['Verbs'],
    }),
    importVerbs: builder.mutation<
      ImportVerbsResponse,
      {
        verbs: Record<string, VerbData>
        resolveConflicts?: Record<string, 'keep' | 'replace'>
      }
    >({
      query: (data) => ({
        url: '/admin/verbs/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Verbs'],
    }),

    // Verb practice endpoints
    getVerbsForPractice: builder.query<{ verbs: VerbForPractice[] }, void>({
      query: () => '/verbs',
      providesTags: ['VerbsPractice'],
    }),

    // Verb statistics endpoints
    getVerbStatistics: builder.query<{ statistics: VerbStatisticsMap }, void>({
      query: () => '/verbs/statistics',
      providesTags: ['VerbStatistics'],
    }),
    updateVerbStatistic: builder.mutation<
      { message: string; statistic: VerbStatistic & { id: string; verbId: string } },
      { verbId: string; correct: boolean }
    >({
      query: (data) => ({
        url: '/verbs/statistics',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VerbStatistics'],
    }),
    resetVerbStatistic: builder.mutation<
      { message: string },
      string
    >({
      query: (verbId) => ({
        url: `/verbs/statistics/${verbId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VerbStatistics'],
    }),
  }),
})

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetVerbsQuery,
  useImportVerbsMutation,
  useGetVerbsForPracticeQuery,
  useGetVerbStatisticsQuery,
  useUpdateVerbStatisticMutation,
  useResetVerbStatisticMutation,
} = api
