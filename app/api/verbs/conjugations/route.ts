import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function authenticate(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    return decoded.userId
  } catch (error) {
    return null
  }
}

// GET /api/verbs/conjugations - Get all verbs with conjugations for practice
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's native language preference
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { nativeLanguage: true },
    })

    const nativeLanguage = profile?.nativeLanguage || 'pt-BR'

    // Get all verbs with their conjugations
    const verbsWithConjugations = await prisma.verb.findMany({
      include: {
        conjugations: {
          select: {
            conjugation: true,
          },
        },
      },
      orderBy: {
        italian: 'asc',
      },
    })

    // Filter only verbs that have conjugations and format for practice
    const verbs = verbsWithConjugations
      .filter((verb) => verb.conjugations.length > 0)
      .map((verb) => ({
        id: verb.id,
        italian: verb.italian,
        translation: nativeLanguage === 'pt-BR' ? verb.tr_ptBR : (verb.tr_en || verb.tr_ptBR),
        regular: verb.regular,
        reflexive: verb.reflexive,
        conjugation: verb.conjugations[0].conjugation,
      }))

    return NextResponse.json({ verbs }, { status: 200 })
  } catch (error) {
    console.error('Get verbs for conjugation practice error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

