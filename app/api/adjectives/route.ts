import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { adjectiveService, profileService } from '@/lib/services'
import { fromJsonValue } from '@/lib/utils'

interface AdjectiveGenderForms {
  singolare: {
    it: string
    pt: string
    en: string
  }
  plurale: {
    it: string
    pt: string
    en: string
  }
}

// GET /api/adjectives - Get all adjectives for practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Get user profile to determine native language
    const profile = await profileService.getProfile(userId)
    const nativeLanguage = profile.nativeLanguage

    // Use adjective service to get adjectives with pagination
    const { items: adjectivesData, total } =
      await adjectiveService.getAllAdjectives({
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      })

    // Transform adjectives to practice format
    const adjectives = adjectivesData.map((adj) => {
      const maschile = fromJsonValue<AdjectiveGenderForms>(adj.maschile)
      const femminile = fromJsonValue<AdjectiveGenderForms>(adj.femminile)

      // Get translation based on native language
      const translation =
        nativeLanguage === 'en' ? maschile.singolare.en : maschile.singolare.pt

      return {
        id: adj.id,
        italian: adj.italian,
        masculineSingular: maschile.singolare.it,
        masculinePlural: maschile.plurale.it,
        feminineSingular: femminile.singolare.it,
        femininePlural: femminile.plurale.it,
        translation,
      }
    })

    return NextResponse.json(
      {
        adjectives,
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
