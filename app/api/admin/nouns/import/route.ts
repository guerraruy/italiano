import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdmin } from '@/lib/auth'
import { importNounsSchema } from '@/lib/validation/nouns'
import { z } from 'zod'

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

interface ConflictNoun {
  italian: string
  existing: {
    singolare: NounTranslations
    plurale: NounTranslations
  }
  new: NounData
}

export async function POST(request: NextRequest) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = importNounsSchema.parse(body)
      const { nouns, resolveConflicts } = validatedData

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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to import nouns' },
        { status: 500 }
      )
    }
  })(request)
}

// GET endpoint to fetch all nouns
export async function GET(request: NextRequest) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const nouns = await prisma.noun.findMany({
        orderBy: {
          italian: 'asc',
        },
      })

      return NextResponse.json({ nouns })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch nouns' },
        { status: 500 }
      )
    }
  })(request)
}
