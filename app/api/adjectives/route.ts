import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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

async function authenticate(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null

    const decoded = verify(token, JWT_SECRET) as { userId: string }

    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/adjectives - Get all adjectives for translation practice
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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
    console.error('Get adjectives error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
