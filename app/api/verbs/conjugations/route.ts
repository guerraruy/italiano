import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { profileService, verbService } from '@/lib/services'

// GET /api/verbs/conjugations - Get verbs with their conjugations for practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get user profile to determine native language
    const profile = await profileService.getProfile(userId)
    const nativeLanguage = profile?.nativeLanguage || 'pt-BR'

    // Use verb service to get verbs with conjugations
    const verbsWithConjugations = await verbService.getVerbsWithConjugations()

    const verbs = verbsWithConjugations
      .filter((verb) => verb.conjugations && verb.conjugations.length > 0)
      .map((verb) => ({
        id: verb.id,
        italian: verb.italian,
        translation:
          nativeLanguage === 'en' ? verb.tr_en || verb.tr_ptBR : verb.tr_ptBR,
        regular: verb.regular,
        reflexive: verb.reflexive,
        conjugation: verb.conjugations[0]?.conjugation || {}, // Get first conjugation
      }))

    return NextResponse.json({ verbs }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
})
