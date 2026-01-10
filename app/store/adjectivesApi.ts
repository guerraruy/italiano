import { baseApi } from './baseApi'

// Types
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

// Inject adjective endpoints
export const adjectivesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Adjective endpoints
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

// Export hooks
export const {
  useGetAdjectivesQuery,
  useImportAdjectivesMutation,
  useUpdateAdjectiveMutation,
  useDeleteAdjectiveMutation,
  useGetAdjectivesForPracticeQuery,
  useGetAdjectiveStatisticsQuery,
  useUpdateAdjectiveStatisticMutation,
  useResetAdjectiveStatisticMutation,
} = adjectivesApi
