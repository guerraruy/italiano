import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { ConflictError, handleApiError } from '@/lib/errors'
import { adjectiveRepository } from '@/lib/repositories'
import { adjectiveService } from '@/lib/services'
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
  return withAdmin(async () => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = importAdjectivesSchema.parse(body)
      const { adjectives, resolveConflicts } = validatedData

      // Check for existing adjectives (conflicts)
      const adjectiveNames = Object.keys(adjectives)
      const existingAdjectives =
        await adjectiveRepository.findByItalianNames(adjectiveNames)

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

      // If there are conflicts and no resolutions provided, throw conflict error
      if (conflicts.length > 0 && !resolveConflicts) {
        const error = new ConflictError('Conflicts found')
        return NextResponse.json(
          {
            ...error.toJSON(),
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
        const result = await adjectiveRepository.createMany(adjectivesToCreate)
        created = result.count
      }

      // Update existing adjectives
      for (const { italian, data } of adjectivesToUpdate) {
        await adjectiveRepository.updateByItalian(italian, {
          maschile: data.maschile as unknown as Prisma.InputJsonValue,
          femminile: data.femminile as unknown as Prisma.InputJsonValue,
        })
        updated++
      }

      return NextResponse.json({
        message: `Successfully imported ${created} new adjectives and updated ${updated} existing adjectives`,
        created,
        updated,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// GET endpoint to fetch all adjectives
export async function GET(request: NextRequest) {
  return withAdmin(async () => {
    try {
      // Use adjective service to get all adjectives
      const adjectives = await adjectiveService.getAllAdjectives()

      return NextResponse.json({ adjectives })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
