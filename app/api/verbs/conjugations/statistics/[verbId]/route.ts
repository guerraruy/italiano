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

// DELETE /api/verbs/conjugations/statistics/[verbId] - Reset conjugation statistics for a verb
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ verbId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { verbId } = await params

    if (!verbId) {
      return NextResponse.json(
        { error: 'Verb ID is required' },
        { status: 400 }
      )
    }

    // Delete all conjugation statistics for this user and verb
    await prisma.conjugationStatistic.deleteMany({
      where: {
        userId,
        verbId,
      },
    })

    return NextResponse.json(
      {
        message: 'Conjugation statistics reset successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset conjugation statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
