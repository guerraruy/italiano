import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { nounService } from '@/lib/services'

// GET /api/nouns - Get all nouns for practice
export const GET = withAuth(async (request: NextRequest, _userId: string) => {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Use noun service to get nouns with pagination
    const { items: nounsData, total } = await nounService.getAllNouns({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    })

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

    return NextResponse.json(
      {
        nouns,
        pagination: {
          total,
          limit: limit ? parseInt(limit, 10) : null,
          offset: offset ? parseInt(offset, 10) : 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
})
