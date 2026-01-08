import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { profileService, verbService } from '@/lib/services'

// GET /api/verbs - Get all verbs for practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get user profile to determine native language
    const profile = await profileService.getProfile(userId)
    const nativeLanguage = profile?.nativeLanguage || 'pt-BR'

    // Use verb service to get all verbs
    const verbs = await verbService.getAllVerbs()

    // Map verbs to include the correct translation based on user's native language
    const verbsForPractice = verbs.map((verb) => ({
      id: verb.id,
      italian: verb.italian,
      translation:
        nativeLanguage === 'en' ? verb.tr_en || verb.tr_ptBR : verb.tr_ptBR,
      regular: verb.regular,
      reflexive: verb.reflexive,
    }))

    return NextResponse.json({ verbs: verbsForPractice }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
})
