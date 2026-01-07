import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { statisticsService, verbService } from '@/lib/services'
import { verbIdSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// DELETE /api/verbs/conjugations/statistics/[verbId] - Reset conjugation statistics for a specific verb
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAuth(async (request: NextRequest, userId: string) => {
    try {
      const { verbId } = await context.params

      // Validate verbId
      verbIdSchema.parse({ verbId })

      // Verify verb exists
      const verb = await verbService.getVerbById(verbId)

      if (!verb) {
        return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
      }

      // Use statistics service to reset conjugation statistics
      await statisticsService.resetConjugationStatistics(userId, verbId)

      return NextResponse.json(
        {
          message: 'Statistics reset successfully',
        },
        { status: 200 }
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })(request)
}
