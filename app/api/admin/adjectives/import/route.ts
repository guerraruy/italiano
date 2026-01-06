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

interface AdjectiveData {
  maschile: AdjectiveGenderForms
  femminile: AdjectiveGenderForms
}

interface AdjectiveImportData {
  [italian: string]: AdjectiveData
}

interface ConflictAdjective {
  italian: string
  existing: {
    maschile: AdjectiveGenderForms
    femminile: AdjectiveGenderForms
  }
  new: AdjectiveData
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
    const { adjectives, resolveConflicts } = body as {
      adjectives: AdjectiveImportData
      resolveConflicts?: { [italian: string]: 'keep' | 'replace' }
    }

    if (!adjectives || typeof adjectives !== 'object') {
      return NextResponse.json(
        { error: 'Invalid adjective data format' },
        { status: 400 }
      )
    }

    // Check for existing adjectives (conflicts)
    const adjectiveNames = Object.keys(adjectives)
    const existingAdjectives = await prisma.adjective.findMany({
      where: {
        italian: {
          in: adjectiveNames,
        },
      },
    })

    const existingAdjectiveMap = new Map<
      string,
      { italian: string; maschile: unknown; femminile: unknown }
    >(
      existingAdjectives.map(
        (a: { italian: string; maschile: unknown; femminile: unknown }) => [
          a.italian,
          a,
        ]
      )
    )

    // Find conflicts
    const conflicts: ConflictAdjective[] = []
    const adjectivesToCreate: Array<{
      italian: string
      maschile: Prisma.InputJsonValue
      femminile: Prisma.InputJsonValue
    }> = []
    const adjectivesToUpdate: Array<{
      italian: string
      data: AdjectiveData
    }> = []

    for (const [italian, data] of Object.entries(adjectives)) {
      const existingAdjective = existingAdjectiveMap.get(italian)

      if (existingAdjective) {
        // Check if we have a resolution for this conflict
        const resolution = resolveConflicts?.[italian]

        if (resolution === 'replace') {
          adjectivesToUpdate.push({ italian, data })
        } else if (resolution === 'keep') {
          // Skip this adjective
          continue
        } else {
          // No resolution yet, add to conflicts
          conflicts.push({
            italian,
            existing: {
              maschile: existingAdjective.maschile as AdjectiveGenderForms,
              femminile: existingAdjective.femminile as AdjectiveGenderForms,
            },
            new: data,
          })
        }
      } else {
        // New adjective, add to create list
        adjectivesToCreate.push({
          italian,
          maschile: data.maschile as unknown as Prisma.InputJsonValue,
          femminile: data.femminile as unknown as Prisma.InputJsonValue,
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

    // Create new adjectives
    if (adjectivesToCreate.length > 0) {
      const result = await prisma.adjective.createMany({
        data: adjectivesToCreate,
      })
      created = result.count
    }

    // Update existing adjectives
    for (const { italian, data } of adjectivesToUpdate) {
      await prisma.adjective.update({
        where: { italian },
        data: {
          maschile: data.maschile as unknown as Prisma.InputJsonValue,
          femminile: data.femminile as unknown as Prisma.InputJsonValue,
        },
      })
      updated++
    }

    return NextResponse.json({
      message: `Successfully imported ${created} new adjectives and updated ${updated} existing adjectives`,
      created,
      updated,
    })
  } catch (error) {
    console.error('Error importing adjectives:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all adjectives
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

    const adjectives = await prisma.adjective.findMany({
      orderBy: {
        italian: 'asc',
      },
    })

    return NextResponse.json({ adjectives })
  } catch (error) {
    console.error('Error fetching adjectives:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

