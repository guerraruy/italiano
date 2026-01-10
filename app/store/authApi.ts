import { baseApi } from './baseApi'

// Types
export interface User {
  id: string
  username: string
  email: string
  name: string | null
  admin: boolean
  createdAt?: string
}

export interface UserProfile {
  id: string
  userId: string
  nativeLanguage: 'pt-BR' | 'en'
  enabledVerbTenses: string[]
  createdAt: string
  updatedAt: string
}

export type UserData = User

export interface AuthResponse {
  user: User
  token: string
}

// Inject auth endpoints
export const authApi = baseApi.injectEndpoints({
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
      { nativeLanguage?: 'pt-BR' | 'en'; enabledVerbTenses?: string[] }
    >({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      // Invalidate profile and all practice data to refetch translations in new language
      invalidatesTags: [
        'Profile',
        'VerbsPractice',
        'NounsPractice',
        'AdjectivesPractice',
        'ConjugationPractice',
      ],
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
  }),
})

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = authApi
