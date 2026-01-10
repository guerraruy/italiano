import { baseApi } from './baseApi'

// Types
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

// Inject noun endpoints
export const nounsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Noun endpoints
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
  }),
})

// Export hooks
export const {
  useGetNounsQuery,
  useImportNounsMutation,
  useUpdateNounMutation,
  useDeleteNounMutation,
  useGetNounsForPracticeQuery,
  useGetNounStatisticsQuery,
  useUpdateNounStatisticMutation,
  useResetNounStatisticMutation,
} = nounsApi
