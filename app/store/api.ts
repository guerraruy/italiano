import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for API responses
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

export interface UserData extends User {}

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
  id: string
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

export interface ConjugationData {
  [mood: string]: {
    [tense: string]:
      | {
          [person: string]: string
        }
      | string // For simple forms like Participio Presente/Passato
  }
}

export interface VerbConjugation {
  id: string
  verbId: string
  conjugation: ConjugationData
  createdAt: string
  updatedAt: string
  verb: {
    italian: string
    regular: boolean
    reflexive: boolean
  }
}

export interface ConflictConjugation {
  verbName: string
  existing: ConjugationData
  new: ConjugationData
}

export interface ImportConjugationsResponse {
  message: string
  created?: number
  updated?: number
  conflicts?: ConflictConjugation[]
}

export interface NounTranslations {
  it: string
  pt: string
  en: string
}

export interface NounData {
  singolare: NounTranslations
  plurale: NounTranslations
}

export interface ImportedNoun {
  id: string
  italian: string
  singolare: NounTranslations
  plurale: NounTranslations
  createdAt: string
  updatedAt: string
}

export interface ConflictNoun {
  italian: string
  existing: {
    singolare: NounTranslations
    plurale: NounTranslations
  }
  new: NounData
}

export interface ImportNounsResponse {
  message: string
  created?: number
  updated?: number
  conflicts?: ConflictNoun[]
}

export interface NounForPractice {
  id: string
  italian: string
  italianPlural: string
  translation: string
  translationPlural: string
}

export interface NounStatistic {
  correctAttempts: number
  wrongAttempts: number
  lastPracticed: Date
}

export interface NounStatisticsMap {
  [nounId: string]: NounStatistic
}

export interface AdjectiveTranslations {
  it: string
  pt: string
  en: string
}

export interface AdjectiveGenderForms {
  singolare: AdjectiveTranslations
  plurale: AdjectiveTranslations
}

export interface AdjectiveData {
  maschile: AdjectiveGenderForms
  femminile: AdjectiveGenderForms
}

export interface ImportedAdjective {
  id: string
  italian: string
  maschile: AdjectiveGenderForms
  femminile: AdjectiveGenderForms
  createdAt: string
  updatedAt: string
}

export interface ConflictAdjective {
  italian: string
  existing: {
    maschile: AdjectiveGenderForms
    femminile: AdjectiveGenderForms
  }
  new: AdjectiveData
}

export interface ImportAdjectivesResponse {
  message: string
  created?: number
  updated?: number
  conflicts?: ConflictAdjective[]
}

export interface AdjectiveForPractice {
  id: string
  italian: string
  masculineSingular: string
  masculinePlural: string
  feminineSingular: string
  femininePlural: string
  translation: string
}

export interface AdjectiveStatistic {
  correctAttempts: number
  wrongAttempts: number
  lastPracticed: Date
}

export interface AdjectiveStatisticsMap {
  [adjectiveId: string]: AdjectiveStatistic
}

export interface VerbForConjugationPractice {
  id: string
  italian: string
  translation: string
  regular: boolean
  reflexive: boolean
  conjugation: ConjugationData
}

export interface ConjugationStatistic {
  correctAttempts: number
  wrongAttempts: number
  lastPracticed: Date
}

export interface ConjugationStatisticsMap {
  [key: string]: ConjugationStatistic // key format: "verbId:mood:tense:person"
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
  tagTypes: [
    'Users',
    'Verbs',
    'Auth',
    'Profile',
    'VerbsPractice',
    'VerbStatistics',
    'Conjugations',
    'ConjugationPractice',
    'ConjugationStatistics',
    'Nouns',
    'NounsPractice',
    'NounStatistics',
    'Adjectives',
    'AdjectivesPractice',
    'AdjectiveStatistics',
  ],
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
    updateVerb: builder.mutation<
      { message: string; verb: ImportedVerb },
      {
        verbId: string
        italian: string
        regular: boolean
        reflexive: boolean
        tr_ptBR: string
        tr_en?: string
      }
    >({
      query: ({ verbId, italian, regular, reflexive, tr_ptBR, tr_en }) => ({
        url: `/admin/verbs/${verbId}`,
        method: 'PATCH',
        body: { italian, regular, reflexive, tr_ptBR, tr_en },
      }),
      invalidatesTags: ['Verbs'],
    }),
    deleteVerb: builder.mutation<{ message: string }, string>({
      query: (verbId) => ({
        url: `/admin/verbs/${verbId}`,
        method: 'DELETE',
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
      {
        message: string
        statistic: VerbStatistic & { id: string; verbId: string }
      },
      { verbId: string; correct: boolean }
    >({
      query: (data) => ({
        url: '/verbs/statistics',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VerbStatistics'],
    }),
    resetVerbStatistic: builder.mutation<{ message: string }, string>({
      query: (verbId) => ({
        url: `/verbs/statistics/${verbId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VerbStatistics'],
    }),

    // Conjugation endpoints
    getConjugations: builder.query<{ conjugations: VerbConjugation[] }, void>({
      query: () => '/admin/verbs/conjugations/import',
      providesTags: ['Conjugations'],
    }),
    importConjugations: builder.mutation<
      ImportConjugationsResponse,
      {
        conjugations: Record<string, ConjugationData>
        resolveConflicts?: Record<string, 'keep' | 'replace'>
      }
    >({
      query: (data) => ({
        url: '/admin/verbs/conjugations/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conjugations'],
    }),
    updateConjugation: builder.mutation<
      { message: string; conjugation: VerbConjugation },
      {
        conjugationId: string
        conjugation: ConjugationData
      }
    >({
      query: ({ conjugationId, conjugation }) => ({
        url: `/admin/verbs/conjugations/${conjugationId}`,
        method: 'PATCH',
        body: { conjugation },
      }),
      invalidatesTags: ['Conjugations'],
    }),
    deleteConjugation: builder.mutation<{ message: string }, string>({
      query: (conjugationId) => ({
        url: `/admin/verbs/conjugations/${conjugationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conjugations'],
    }),

    // Conjugation practice endpoints
    getVerbsForConjugationPractice: builder.query<
      { verbs: VerbForConjugationPractice[] },
      void
    >({
      query: () => '/verbs/conjugations',
      providesTags: ['ConjugationPractice'],
    }),

    // Conjugation statistics endpoints
    getConjugationStatistics: builder.query<
      { statistics: ConjugationStatisticsMap },
      void
    >({
      query: () => '/verbs/conjugations/statistics',
      providesTags: ['ConjugationStatistics'],
    }),
    updateConjugationStatistic: builder.mutation<
      {
        message: string
        statistic: ConjugationStatistic & { id: string; key: string }
      },
      {
        verbId: string
        mood: string
        tense: string
        person: string
        correct: boolean
      }
    >({
      query: (data) => ({
        url: '/verbs/conjugations/statistics',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ConjugationStatistics'],
    }),
    resetConjugationStatistics: builder.mutation<
      { message: string },
      string // verbId
    >({
      query: (verbId) => ({
        url: `/verbs/conjugations/statistics/${verbId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConjugationStatistics'],
    }),

    // Noun endpoints
    getNouns: builder.query<{ nouns: ImportedNoun[] }, void>({
      query: () => '/admin/nouns/import',
      providesTags: ['Nouns'],
    }),
    importNouns: builder.mutation<
      ImportNounsResponse,
      {
        nouns: Record<string, NounData>
        resolveConflicts?: Record<string, 'keep' | 'replace'>
      }
    >({
      query: (data) => ({
        url: '/admin/nouns/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Nouns'],
    }),
    updateNoun: builder.mutation<
      { message: string; noun: ImportedNoun },
      {
        nounId: string
        italian: string
        singolare: NounTranslations
        plurale: NounTranslations
      }
    >({
      query: ({ nounId, italian, singolare, plurale }) => ({
        url: `/admin/nouns/${nounId}`,
        method: 'PATCH',
        body: { italian, singolare, plurale },
      }),
      invalidatesTags: ['Nouns'],
    }),
    deleteNoun: builder.mutation<{ message: string }, string>({
      query: (nounId) => ({
        url: `/admin/nouns/${nounId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nouns'],
    }),

    // Noun practice endpoints
    getNounsForPractice: builder.query<{ nouns: NounForPractice[] }, void>({
      query: () => '/nouns',
      providesTags: ['NounsPractice'],
    }),

    // Noun statistics endpoints
    getNounStatistics: builder.query<{ statistics: NounStatisticsMap }, void>({
      query: () => '/nouns/statistics',
      providesTags: ['NounStatistics'],
    }),
    updateNounStatistic: builder.mutation<
      {
        message: string
        statistic: NounStatistic & { id: string; nounId: string }
      },
      { nounId: string; correct: boolean }
    >({
      query: (data) => ({
        url: '/nouns/statistics',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NounStatistics'],
    }),
    resetNounStatistic: builder.mutation<{ message: string }, string>({
      query: (nounId) => ({
        url: `/nouns/statistics/${nounId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NounStatistics'],
    }),

    // Adjective endpoints
    getAdjectives: builder.query<{ adjectives: ImportedAdjective[] }, void>({
      query: () => '/admin/adjectives/import',
      providesTags: ['Adjectives'],
    }),
    importAdjectives: builder.mutation<
      ImportAdjectivesResponse,
      {
        adjectives: Record<string, AdjectiveData>
        resolveConflicts?: Record<string, 'keep' | 'replace'>
      }
    >({
      query: (data) => ({
        url: '/admin/adjectives/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Adjectives'],
    }),
    updateAdjective: builder.mutation<
      { message: string; adjective: ImportedAdjective },
      {
        adjectiveId: string
        italian: string
        maschile: AdjectiveGenderForms
        femminile: AdjectiveGenderForms
      }
    >({
      query: ({ adjectiveId, italian, maschile, femminile }) => ({
        url: `/admin/adjectives/${adjectiveId}`,
        method: 'PATCH',
        body: { italian, maschile, femminile },
      }),
      invalidatesTags: ['Adjectives'],
    }),
    deleteAdjective: builder.mutation<{ message: string }, string>({
      query: (adjectiveId) => ({
        url: `/admin/adjectives/${adjectiveId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Adjectives'],
    }),

    // Adjective practice endpoints
    getAdjectivesForPractice: builder.query<
      { adjectives: AdjectiveForPractice[] },
      void
    >({
      query: () => '/adjectives',
      providesTags: ['AdjectivesPractice'],
    }),

    // Adjective statistics endpoints
    getAdjectiveStatistics: builder.query<
      { statistics: AdjectiveStatisticsMap },
      void
    >({
      query: () => '/adjectives/statistics',
      providesTags: ['AdjectiveStatistics'],
    }),
    updateAdjectiveStatistic: builder.mutation<
      {
        message: string
        statistic: AdjectiveStatistic & { id: string; adjectiveId: string }
      },
      { adjectiveId: string; correct: boolean }
    >({
      query: (data) => ({
        url: '/adjectives/statistics',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdjectiveStatistics'],
    }),
    resetAdjectiveStatistic: builder.mutation<{ message: string }, string>({
      query: (adjectiveId) => ({
        url: `/adjectives/statistics/${adjectiveId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdjectiveStatistics'],
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
  useUpdateVerbMutation,
  useDeleteVerbMutation,
  useGetVerbsForPracticeQuery,
  useGetVerbStatisticsQuery,
  useUpdateVerbStatisticMutation,
  useResetVerbStatisticMutation,
  useGetConjugationsQuery,
  useImportConjugationsMutation,
  useUpdateConjugationMutation,
  useDeleteConjugationMutation,
  useGetNounsQuery,
  useImportNounsMutation,
  useUpdateNounMutation,
  useDeleteNounMutation,
  useGetNounsForPracticeQuery,
  useGetNounStatisticsQuery,
  useUpdateNounStatisticMutation,
  useResetNounStatisticMutation,
  useGetAdjectivesQuery,
  useImportAdjectivesMutation,
  useUpdateAdjectiveMutation,
  useDeleteAdjectiveMutation,
  useGetAdjectivesForPracticeQuery,
  useGetAdjectiveStatisticsQuery,
  useUpdateAdjectiveStatisticMutation,
  useResetAdjectiveStatisticMutation,
  useGetVerbsForConjugationPracticeQuery,
  useGetConjugationStatisticsQuery,
  useUpdateConjugationStatisticMutation,
  useResetConjugationStatisticsMutation,
} = api
