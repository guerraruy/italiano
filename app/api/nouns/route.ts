import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to verify authentication
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}

// GET /api/nouns - Get all nouns for translation practice
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
    console.error('Get nouns error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
