import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

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

// Define the API slice with all tag types
export const baseApi = createApi({
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
  endpoints: () => ({}),
})
