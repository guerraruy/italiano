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

// DELETE /api/nouns/statistics/[nounId] - Reset noun statistics for a specific noun
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ nounId: string }> }
) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { nounId } = await params

    if (!nounId) {
      return NextResponse.json(
        { error: 'Noun ID is required' },
        { status: 400 }
      )
    }

    // Verify noun exists
    const noun = await prisma.noun.findUnique({
      where: { id: nounId },
    })

    if (!noun) {
      return NextResponse.json(
        { error: 'Noun not found' },
        { status: 404 }
      )
    }

    // Delete the noun statistics for this user and noun
    await prisma.nounStatistic.deleteMany({
      where: {
        userId,
        nounId,
      },
    })

    return NextResponse.json({ 
      message: 'Statistics reset successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Reset noun statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

