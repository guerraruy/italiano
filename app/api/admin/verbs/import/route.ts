import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Verb } from '@prisma/client'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

interface VerbData {
  regular: boolean
  reflexive: boolean
  tr_ptBR: string
  tr_en?: string
}

interface VerbImportData {
  [key: string]: VerbData
}

interface ConflictVerb {
  italian: string
  existing: {
    regular: boolean
    reflexive: boolean
    tr_ptBR: string
    tr_en: string | null
  }
  new: VerbData
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { verbs, resolveConflicts } = body as {
      verbs: VerbImportData
      resolveConflicts?: { [italian: string]: 'keep' | 'replace' }
    }

    if (!verbs || typeof verbs !== 'object') {
      return NextResponse.json(
        { error: 'Invalid verb data format' },
        { status: 400 }
      )
    }

    // Check for existing verbs (conflicts)
    const verbNames = Object.keys(verbs)
    const existingVerbs = await prisma.verb.findMany({
      where: {
        italian: {
          in: verbNames,
        },
      },
    })

    const existingVerbMap = new Map<string, Verb>(
      existingVerbs.map((v: Verb) => [v.italian, v])
    )

    // Find conflicts
    const conflicts: ConflictVerb[] = []
    const verbsToCreate: Array<{
      italian: string
      regular: boolean
      reflexive: boolean
      tr_ptBR: string
      tr_en?: string
    }> = []
    const verbsToUpdate: Array<{
      italian: string
      data: VerbData
    }> = []

    for (const [italian, data] of Object.entries(verbs)) {
      const existing = existingVerbMap.get(italian)

      if (existing) {
        // Check if there's a conflict resolution
        if (resolveConflicts && resolveConflicts[italian]) {
          if (resolveConflicts[italian] === 'replace') {
            verbsToUpdate.push({ italian, data })
          }
          // If 'keep', we skip this verb
        } else {
          // No resolution yet, add to conflicts
          conflicts.push({
            italian,
            existing: {
              regular: existing.regular,
              reflexive: existing.reflexive,
              tr_ptBR: existing.tr_ptBR,
              tr_en: existing.tr_en,
            },
            new: data,
          })
        }
      } else {
        verbsToCreate.push({
          italian,
          regular: data.regular,
          reflexive: data.reflexive,
          tr_ptBR: data.tr_ptBR,
          tr_en: data.tr_en,
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

    // Create new verbs
    if (verbsToCreate.length > 0) {
      const result = await prisma.verb.createMany({
        data: verbsToCreate,
        skipDuplicates: true,
      })
      created = result.count
    }

    // Update existing verbs
    for (const { italian, data } of verbsToUpdate) {
      await prisma.verb.update({
        where: { italian },
        data: {
          regular: data.regular,
          reflexive: data.reflexive,
          tr_ptBR: data.tr_ptBR,
          tr_en: data.tr_en,
        },
      })
      updated++
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      message: `Successfully imported ${created} new verbs and updated ${updated} existing verbs.`,
    })
  } catch (error) {
    console.error('Error importing verbs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all verbs
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
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const verbs = await prisma.verb.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    return NextResponse.json({ verbs })
  } catch (error) {
    console.error('Error fetching verbs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

