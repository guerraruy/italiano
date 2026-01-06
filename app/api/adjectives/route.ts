import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

interface AdjectiveTranslations {
  it: string
  pt: string
  en: string
}

interface AdjectiveGenderForms {
  singolare: AdjectiveTranslations
  plurale: AdjectiveTranslations
}

interface AdjectiveFromDB {
  id: string
  italian: string
  maschile: unknown
  femminile: unknown
  createdAt: Date
  updatedAt: Date
}

// GET /api/adjectives - Get all adjectives for translation practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get user profile to determine native language
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // If profile doesn't exist, create it with default values
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          nativeLanguage: 'pt-BR',
          enabledVerbTenses: [
            'Indicativo.Presente',
            'Indicativo.Passato Prossimo',
            'Indicativo.Futuro Semplice',
          ],
        },
      })
    }

    // Get all adjectives from database
    const adjectives = await prisma.adjective.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    // Map adjectives to include the translation in user's native language
    const mappedAdjectives = adjectives.map((adjective: AdjectiveFromDB) => {
      const maschile = adjective.maschile as AdjectiveGenderForms
      const femminile = adjective.femminile as AdjectiveGenderForms

      const translation =
        profile!.nativeLanguage === 'pt-BR'
          ? maschile.singolare.pt
          : maschile.singolare.en

      return {
        id: adjective.id,
        italian: adjective.italian,
        masculineSingular: maschile.singolare.it,
        masculinePlural: maschile.plurale.it,
        feminineSingular: femminile.singolare.it,
        femininePlural: femminile.plurale.it,
        translation,
      }
    })

    return NextResponse.json({ adjectives: mappedAdjectives }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
