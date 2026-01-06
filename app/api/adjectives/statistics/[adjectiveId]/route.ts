import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function authenticate(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null

    const decoded = verify(token, JWT_SECRET) as { userId: string }

    return decoded.userId
  } catch {
    return null
  }
}

// DELETE /api/adjectives/statistics/[adjectiveId] - Reset adjective statistics for a specific adjective
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adjectiveId: string }> }
) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { adjectiveId } = await params

    if (!adjectiveId) {
      return NextResponse.json(
        { error: 'Adjective ID is required' },
        { status: 400 }
      )
    }

    // Verify adjective exists
    const adjective = await prisma.adjective.findUnique({
      where: { id: adjectiveId },
    })

    if (!adjective) {
      return NextResponse.json(
        { error: 'Adjective not found' },
        { status: 404 }
      )
    }

    // Delete the adjective statistics for this user and adjective
    await prisma.adjectiveStatistic.deleteMany({
      where: {
        userId,
        adjectiveId,
      },
    })

    return NextResponse.json({ 
      message: 'Statistics reset successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Reset adjective statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

