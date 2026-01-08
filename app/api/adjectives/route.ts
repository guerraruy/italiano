import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { adjectiveService, profileService } from '@/lib/services'

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
    // Get user profile to determine native language
    const profile = await profileService.getProfile(userId)
    const nativeLanguage = profile.nativeLanguage

    // Use adjective service to get all adjectives
    const adjectivesData = await adjectiveService.getAllAdjectives()

    // Transform adjectives to practice format
    const adjectives = adjectivesData.map((adj) => {
      const maschile = adj.maschile as unknown as AdjectiveGenderForms
      const femminile = adj.femminile as unknown as AdjectiveGenderForms

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

    return NextResponse.json({ adjectives }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
})
