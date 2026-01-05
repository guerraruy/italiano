import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

interface ConjugationData {
  [mood: string]: {
    [tense: string]:
      | {
          [person: string]: string
        }
      | string // For simple forms like Participio Presente/Passato
  }
}

async function authenticate(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
      return null
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.admin) {
      return null
    }

    return decoded.userId
  } catch (error) {
    return null
  }
}

// PATCH /api/admin/verbs/conjugations/[conjugationId] - Update a conjugation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conjugationId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { conjugationId } = await params

    if (!conjugationId) {
      return NextResponse.json(
        { error: 'Conjugation ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { conjugation } = body as { conjugation: ConjugationData }

    if (!conjugation || typeof conjugation !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid conjugation data' },
        { status: 400 }
      )
    }

    // Check if conjugation exists
    const existingConjugation = await prisma.verbConjugation.findUnique({
      where: { id: conjugationId },
      include: {
        verb: {
          select: {
            italian: true,
          },
        },
      },
    })

    if (!existingConjugation) {
      return NextResponse.json(
        { error: 'Conjugation not found' },
        { status: 404 }
      )
    }

    // Update conjugation
    const updatedConjugation = await prisma.verbConjugation.update({
      where: { id: conjugationId },
      data: {
        conjugation: conjugation as Prisma.InputJsonValue,
      },
      include: {
        verb: {
          select: {
            italian: true,
            regular: true,
            reflexive: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Conjugation updated successfully',
        conjugation: updatedConjugation,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update conjugation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/verbs/conjugations/[conjugationId] - Delete a conjugation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conjugationId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { conjugationId } = await params

    if (!conjugationId) {
      return NextResponse.json(
        { error: 'Conjugation ID is required' },
        { status: 400 }
      )
    }

    // Check if conjugation exists
    const existingConjugation = await prisma.verbConjugation.findUnique({
      where: { id: conjugationId },
      include: {
        verb: {
          select: {
            italian: true,
          },
        },
      },
    })

    if (!existingConjugation) {
      return NextResponse.json(
        { error: 'Conjugation not found' },
        { status: 404 }
      )
    }

    // Delete the conjugation
    await prisma.verbConjugation.delete({
      where: { id: conjugationId },
    })

    return NextResponse.json(
      {
        message: 'Conjugation deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete conjugation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

