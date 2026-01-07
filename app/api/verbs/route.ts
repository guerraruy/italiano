import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/verbs - Get all verbs for translation practice
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

    // Get all verbs from database
    const verbs = await prisma.verb.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    // Map verbs to include the translation in user's native language
    const mappedVerbs = verbs.map((verb) => ({
      id: verb.id,
      italian: verb.italian,
      translation:
        profile!.nativeLanguage === 'pt-BR'
          ? verb.tr_ptBR
          : verb.tr_en || verb.tr_ptBR,
      regular: verb.regular,
      reflexive: verb.reflexive,
    }))

    return NextResponse.json({ verbs: mappedVerbs }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
