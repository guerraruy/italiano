import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

interface AdjectiveTranslations {
  it: string
  pt: string
  en: string
}

interface AdjectiveGenderForms {
  singolare: AdjectiveTranslations
  plurale: AdjectiveTranslations
}

// PATCH endpoint to update an adjective
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const params = await context.params
    const { adjectiveId } = params

    const body = await request.json()
    const { italian, maschile, femminile } = body as {
      italian: string
      maschile: AdjectiveGenderForms
      femminile: AdjectiveGenderForms
    }

    // Check if adjective exists
    const existingAdjective = await prisma.adjective.findUnique({
      where: { id: adjectiveId },
    })

    if (!existingAdjective) {
      return NextResponse.json(
        { error: 'Adjective not found' },
        { status: 404 }
      )
    }

    // Check if the italian name is being changed and if it conflicts with another adjective
    if (italian !== existingAdjective.italian) {
      const conflictingAdjective = await prisma.adjective.findUnique({
        where: { italian },
      })

      if (conflictingAdjective && conflictingAdjective.id !== adjectiveId) {
        return NextResponse.json(
          { error: 'An adjective with this Italian name already exists' },
          { status: 409 }
        )
      }
    }

    // Update the adjective
    const updatedAdjective = await prisma.adjective.update({
      where: { id: adjectiveId },
      data: {
        italian,
        maschile: maschile as unknown as Prisma.InputJsonValue,
        femminile: femminile as unknown as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({
      message: 'Adjective updated successfully',
      adjective: updatedAdjective,
    })
  } catch (error) {
    console.error('Error updating adjective:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to delete an adjective
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const params = await context.params
    const { adjectiveId } = params

    // Check if adjective exists
    const existingAdjective = await prisma.adjective.findUnique({
      where: { id: adjectiveId },
    })

    if (!existingAdjective) {
      return NextResponse.json(
        { error: 'Adjective not found' },
        { status: 404 }
      )
    }

    // Delete the adjective (this will cascade delete associated statistics)
    await prisma.adjective.delete({
      where: { id: adjectiveId },
    })

    return NextResponse.json({
      message: 'Adjective deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting adjective:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

