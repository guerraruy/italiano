import { baseApi } from './baseApi'

// Types
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

// Inject verb endpoints
export const verbsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
})

// Export hooks
export const {
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
  useGetVerbsForConjugationPracticeQuery,
  useGetConjugationStatisticsQuery,
  useUpdateConjugationStatisticMutation,
  useResetConjugationStatisticsMutation,
} = verbsApi
