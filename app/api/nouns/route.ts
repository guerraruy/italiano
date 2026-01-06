import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// GET /api/nouns - Get all nouns for translation practice
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

    // Get all nouns from database
    const nouns = await prisma.noun.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    // Map nouns to include the translation in user's native language
    const mappedNouns = nouns.map((noun) => {
      const singolare = noun.singolare as { it: string; pt: string; en: string }
      const plurale = noun.plurale as { it: string; pt: string; en: string }

      const translation =
        profile!.nativeLanguage === 'pt-BR' ? singolare.pt : singolare.en

      return {
        id: noun.id,
        italian: singolare.it,
        italianPlural: plurale.it,
        translation,
        translationPlural:
          profile!.nativeLanguage === 'pt-BR' ? plurale.pt : plurale.en,
      }
    })

    return NextResponse.json({ nouns: mappedNouns }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
