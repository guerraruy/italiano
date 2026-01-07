import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/verbs/conjugations - Get all verbs with conjugations for practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
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
        translation:
          nativeLanguage === 'pt-BR'
            ? verb.tr_ptBR
            : verb.tr_en || verb.tr_ptBR,
        regular: verb.regular,
        reflexive: verb.reflexive,
        conjugation: verb.conjugations[0].conjugation,
      }))

    return NextResponse.json({ verbs }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
