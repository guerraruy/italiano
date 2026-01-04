import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

interface ConjugationImportData {
  [verbName: string]: ConjugationData
}

interface ConflictConjugation {
  verbName: string
  existing: ConjugationData
  new: ConjugationData
}

type VerbWithConjugations = {
  id: string
  italian: string
  conjugations: Array<{
    id: string
    verbId: string
    conjugation: ConjugationData
    createdAt: Date
    updatedAt: Date
  }>
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { conjugations, resolveConflicts } = body as {
      conjugations: ConjugationImportData
      resolveConflicts?: { [verbName: string]: 'keep' | 'replace' }
    }

    if (!conjugations || typeof conjugations !== 'object') {
      return NextResponse.json(
        { error: 'Invalid conjugation data format' },
        { status: 400 }
      )
    }

    // Find or validate verbs exist in the database
    const verbNames = Object.keys(conjugations)
    const existingVerbs = (await prisma.verb.findMany({
      where: {
        italian: {
          in: verbNames,
        },
      },
      include: {
        conjugations: true,
      },
    })) as VerbWithConjugations[]

    const existingVerbMap = new Map<string, VerbWithConjugations>(
      existingVerbs.map((v) => [v.italian, v])
    )

    // Check for missing verbs
    const missingVerbs = verbNames.filter((name) => !existingVerbMap.has(name))
    if (missingVerbs.length > 0) {
      return NextResponse.json(
        {
          error: 'Some verbs do not exist in the database',
          missingVerbs,
        },
        { status: 400 }
      )
    }

    // Find conflicts (verbs that already have conjugations)
    const conflicts: ConflictConjugation[] = []
    const conjugationsToCreate: Array<{
      verbId: string
      conjugation: ConjugationData
    }> = []
    const conjugationsToUpdate: Array<{
      verbId: string
      conjugation: ConjugationData
    }> = []

    for (const [verbName, conjugationData] of Object.entries(conjugations)) {
      const verb = existingVerbMap.get(verbName)
      if (!verb) continue

      const existingConjugation = verb.conjugations[0]

      if (existingConjugation) {
        // Check if there's a conflict resolution
        if (resolveConflicts && resolveConflicts[verbName]) {
          if (resolveConflicts[verbName] === 'replace') {
            conjugationsToUpdate.push({
              verbId: verb.id,
              conjugation: conjugationData,
            })
          }
          // If 'keep', we skip this verb
        } else {
          // No resolution yet, add to conflicts
          conflicts.push({
            verbName,
            existing: existingConjugation.conjugation as ConjugationData,
            new: conjugationData,
          })
        }
      } else {
        conjugationsToCreate.push({
          verbId: verb.id,
          conjugation: conjugationData,
        })
      }
    }

    // If there are unresolved conflicts, return them for user decision
    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          conflicts,
          message: 'Conflicts detected. Please resolve before importing.',
        },
        { status: 409 }
      )
    }

    // Perform database operations
    let created = 0
    let updated = 0

    // Create new conjugations
    for (const { verbId, conjugation } of conjugationsToCreate) {
      await prisma.verbConjugation.create({
        data: {
          verbId,
          conjugation: conjugation as Prisma.InputJsonValue,
        },
      })
      created++
    }

    // Update existing conjugations
    for (const { verbId, conjugation } of conjugationsToUpdate) {
      await prisma.verbConjugation.updateMany({
        where: { verbId },
        data: {
          conjugation: conjugation as Prisma.InputJsonValue,
        },
      })
      updated++
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      message: `Successfully imported ${created} new conjugations and updated ${updated} existing conjugations.`,
    })
  } catch (error) {
    console.error('Error importing conjugations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all verb conjugations
export async function GET(request: NextRequest) {
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

    const conjugations = await prisma.verbConjugation.findMany({
      include: {
        verb: {
          select: {
            italian: true,
            regular: true,
            reflexive: true,
          },
        },
      },
      orderBy: {
        verb: {
          italian: 'asc',
        },
      },
    })

    return NextResponse.json({ conjugations })
  } catch (error) {
    console.error('Error fetching conjugations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
