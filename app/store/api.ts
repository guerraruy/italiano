// Barrel export for backward compatibility
// All imports from './api' continue to work

// Re-export the base API as 'api' for store configuration
export { baseApi as api } from './baseApi'

// Re-export all types and hooks from feature APIs
export * from './authApi'
export * from './verbsApi'
export * from './nounsApi'
export * from './adjectivesApi'
