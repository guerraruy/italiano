/**
 * Environment variable validation
 * This module validates and exports strongly-typed environment variables.
 * It throws an error at startup if required env vars are missing.
 */

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
})

// Validate environment variables at module load time
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => {
        const path = err.path.join('.')
        return `  - ${path}: ${err.message}`
      })

      console.error('❌ Invalid environment variables:')
      console.error(missingVars.join('\n'))
      console.error(
        '\n💡 Please check your .env file and ensure all required variables are set.'
      )
      console.error('   See .env.example for a template.\n')

      throw new Error('Environment validation failed')
    }
    throw error
  }
}

export const env = validateEnv()

// Type-safe access to environment variables
export type Env = z.infer<typeof envSchema>
