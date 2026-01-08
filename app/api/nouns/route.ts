import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { nounService } from '@/lib/services'

// GET /api/nouns - Get all nouns for practice
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Use noun service to get all nouns
    const nounsData = await nounService.getAllNouns()

    // Transform nouns to practice format
    const nouns = nounsData.map((noun) => {
      const singolare = noun.singolare as { it: string; pt: string; en: string }
      const plurale = noun.plurale as { it: string; pt: string; en: string }

      return {
        id: noun.id,
        italian: singolare.it,
        italianPlural: plurale.it,
        translation: singolare.pt,
        translationPlural: plurale.pt,
      }
    })

    return NextResponse.json({ nouns }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
})
