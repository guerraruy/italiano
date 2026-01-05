import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

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

// PATCH /api/admin/verbs/[verbId] - Update a verb
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ verbId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
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

    const body = await request.json()
    const { italian, regular, reflexive, tr_ptBR, tr_en } = body

    if (!italian || typeof regular !== 'boolean' || typeof reflexive !== 'boolean' || !tr_ptBR) {
      return NextResponse.json(
        { error: 'Missing required fields: italian, regular, reflexive, tr_ptBR' },
        { status: 400 }
      )
    }

    // Check if verb exists
    const existingVerb = await prisma.verb.findUnique({
      where: { id: verbId },
    })

    if (!existingVerb) {
      return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
    }

    // Check if the new italian name conflicts with another verb
    if (italian !== existingVerb.italian) {
      const conflictVerb = await prisma.verb.findUnique({
        where: { italian },
      })

      if (conflictVerb) {
        return NextResponse.json(
          { error: 'A verb with this Italian name already exists' },
          { status: 409 }
        )
      }
    }

    // Update verb
    const updatedVerb = await prisma.verb.update({
      where: { id: verbId },
      data: {
        italian,
        regular,
        reflexive,
        tr_ptBR,
        tr_en: tr_en || null,
      },
    })

    return NextResponse.json(
      {
        message: 'Verb updated successfully',
        verb: updatedVerb,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update verb error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/verbs/[verbId] - Delete a verb
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ verbId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
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

    // Check if verb exists
    const existingVerb = await prisma.verb.findUnique({
      where: { id: verbId },
    })

    if (!existingVerb) {
      return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
    }

    // Delete associated statistics first (will cascade delete from conjugations)
    await prisma.verbStatistic.deleteMany({
      where: { verbId },
    })

    // Delete associated conjugations (should cascade from schema, but be explicit)
    await prisma.verbConjugation.deleteMany({
      where: { verbId },
    })

    // Delete the verb
    await prisma.verb.delete({
      where: { id: verbId },
    })

    return NextResponse.json(
      {
        message: 'Verb deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete verb error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

