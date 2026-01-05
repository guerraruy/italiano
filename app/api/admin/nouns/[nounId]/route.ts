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

// PATCH /api/admin/nouns/[nounId] - Update a noun
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ nounId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
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

    const body = await request.json()
    const { italian, singolare, plurale } = body

    if (!italian || !singolare || !plurale) {
      return NextResponse.json(
        { error: 'Missing required fields: italian, singolare, plurale' },
        { status: 400 }
      )
    }

    // Validate structure of singolare and plurale
    if (!singolare.it || !singolare.pt || !singolare.en) {
      return NextResponse.json(
        { error: 'singolare must contain it, pt, and en translations' },
        { status: 400 }
      )
    }

    if (!plurale.it || !plurale.pt || !plurale.en) {
      return NextResponse.json(
        { error: 'plurale must contain it, pt, and en translations' },
        { status: 400 }
      )
    }

    // Check if noun exists
    const existingNoun = await prisma.noun.findUnique({
      where: { id: nounId },
    })

    if (!existingNoun) {
      return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
    }

    // Check if the new italian name conflicts with another noun
    if (italian !== existingNoun.italian) {
      const conflictNoun = await prisma.noun.findUnique({
        where: { italian },
      })

      if (conflictNoun) {
        return NextResponse.json(
          { error: 'A noun with this Italian name already exists' },
          { status: 409 }
        )
      }
    }

    // Update noun
    const updatedNoun = await prisma.noun.update({
      where: { id: nounId },
      data: {
        italian,
        singolare,
        plurale,
      },
    })

    return NextResponse.json(
      {
        message: 'Noun updated successfully',
        noun: updatedNoun,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update noun error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/nouns/[nounId] - Delete a noun
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ nounId: string }> }
) {
  try {
    const userId = await authenticate(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
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

    // Check if noun exists
    const existingNoun = await prisma.noun.findUnique({
      where: { id: nounId },
    })

    if (!existingNoun) {
      return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
    }

    // Delete associated statistics first
    await prisma.nounStatistic.deleteMany({
      where: { nounId },
    })

    // Delete the noun
    await prisma.noun.delete({
      where: { id: nounId },
    })

    return NextResponse.json(
      {
        message: 'Noun deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete noun error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

