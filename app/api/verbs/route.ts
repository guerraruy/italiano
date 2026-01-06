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

// GET /api/verbs - Get all verbs for translation practice
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

    // Get all verbs from database
    const verbs = await prisma.verb.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    // Map verbs to include the translation in user's native language
    const mappedVerbs = verbs.map(verb => ({
      id: verb.id,
      italian: verb.italian,
      translation: profile!.nativeLanguage === 'pt-BR' ? verb.tr_ptBR : (verb.tr_en || verb.tr_ptBR),
      regular: verb.regular,
      reflexive: verb.reflexive,
    }))

    return NextResponse.json({ verbs: mappedVerbs }, { status: 200 })
  } catch (error) {
    console.error('Get verbs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

