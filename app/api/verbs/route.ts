import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { profileService, verbService } from '@/lib/services'

// GET /api/verbs - Get all verbs for practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Get user profile to determine native language
    const profile = await profileService.getProfile(userId)
    const nativeLanguage = profile?.nativeLanguage || 'pt-BR'

    // Use verb service to get verbs with pagination
    const { items: verbs, total } = await verbService.getAllVerbs({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    })

    // Map verbs to include the correct translation based on user's native language
    const verbsForPractice = verbs.map((verb) => ({
      id: verb.id,
      italian: verb.italian,
      translation:
        nativeLanguage === 'en' ? verb.tr_en || verb.tr_ptBR : verb.tr_ptBR,
      regular: verb.regular,
      reflexive: verb.reflexive,
    }))

    return NextResponse.json(
      {
        verbs: verbsForPractice,
        pagination: {
          total,
          limit: limit ? parseInt(limit, 10) : null,
          offset: offset ? parseInt(offset, 10) : 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
})
