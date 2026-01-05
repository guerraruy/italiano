import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

interface NounTranslations {
  it: string
  pt: string
  en: string
  [key: string]: string
}

interface NounData {
  singolare: NounTranslations
  plurale: NounTranslations
}

interface NounImportData {
  [italian: string]: NounData
}

interface ConflictNoun {
  italian: string
  existing: {
    singolare: NounTranslations
    plurale: NounTranslations
  }
  new: NounData
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
    const { nouns, resolveConflicts } = body as {
      nouns: NounImportData
      resolveConflicts?: { [italian: string]: 'keep' | 'replace' }
    }

    if (!nouns || typeof nouns !== 'object') {
      return NextResponse.json(
        { error: 'Invalid noun data format' },
        { status: 400 }
      )
    }

    // Check for existing nouns (conflicts)
    const nounNames = Object.keys(nouns)
    const existingNouns = await prisma.noun.findMany({
      where: {
        italian: {
          in: nounNames,
        },
      },
    })

    const existingNounMap = new Map<
      string,
      { italian: string; singolare: unknown; plurale: unknown }
    >(
      existingNouns.map(
        (n: { italian: string; singolare: unknown; plurale: unknown }) => [
          n.italian,
          n,
        ]
      )
    )

    // Find conflicts
    const conflicts: ConflictNoun[] = []
    const nounsToCreate: Array<{
      italian: string
      singolare: NounTranslations
      plurale: NounTranslations
    }> = []
    const nounsToUpdate: Array<{
      italian: string
      data: NounData
    }> = []

    for (const [italian, data] of Object.entries(nouns)) {
      const existingNoun = existingNounMap.get(italian)

      if (existingNoun) {
        // Check if we have a resolution for this conflict
        const resolution = resolveConflicts?.[italian]

        if (resolution === 'replace') {
          nounsToUpdate.push({ italian, data })
        } else if (resolution === 'keep') {
          // Skip this noun
          continue
        } else {
          // No resolution yet, add to conflicts
          conflicts.push({
            italian,
            existing: {
              singolare: existingNoun.singolare as NounTranslations,
              plurale: existingNoun.plurale as NounTranslations,
            },
            new: data,
          })
        }
      } else {
        // New noun, add to create list
        nounsToCreate.push({
          italian,
          singolare: data.singolare,
          plurale: data.plurale,
        })
      }
    }

    // If there are conflicts and no resolutions provided, return 409
    if (conflicts.length > 0 && !resolveConflicts) {
      return NextResponse.json(
        {
          error: 'Conflicts found',
          conflicts,
        },
        { status: 409 }
      )
    }

    // Perform database operations
    let created = 0
    let updated = 0

    // Create new nouns
    if (nounsToCreate.length > 0) {
      const result = await prisma.noun.createMany({
        data: nounsToCreate,
      })
      created = result.count
    }

    // Update existing nouns
    for (const { italian, data } of nounsToUpdate) {
      await prisma.noun.update({
        where: { italian },
        data: {
          singolare: data.singolare,
          plurale: data.plurale,
        },
      })
      updated++
    }

    return NextResponse.json({
      message: `Successfully imported ${created} new nouns and updated ${updated} existing nouns`,
      created,
      updated,
    })
  } catch (error) {
    console.error('Error importing nouns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all nouns
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

    const nouns = await prisma.noun.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    return NextResponse.json({ nouns })
  } catch (error) {
    console.error('Error fetching nouns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
