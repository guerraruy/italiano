import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { importAdjectivesSchema } from '@/lib/validation/adjectives'

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

interface ConflictAdjective {
  italian: string
  existing: {
    maschile: AdjectiveGenderForms
    femminile: AdjectiveGenderForms
  }
  new: AdjectiveData
}

export async function POST(request: NextRequest) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = importAdjectivesSchema.parse(body)
      const { adjectives, resolveConflicts } = validatedData

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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to import adjectives' },
        { status: 500 }
      )
    }
  })(request)
}

// GET endpoint to fetch all adjectives
export async function GET(request: NextRequest) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const adjectives = await prisma.adjective.findMany({
        orderBy: {
          italian: 'asc',
        },
      })

      return NextResponse.json({ adjectives })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch adjectives' },
        { status: 500 }
      )
    }
  })(request)
}
