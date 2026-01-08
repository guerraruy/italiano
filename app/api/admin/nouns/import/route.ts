import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { ConflictError, handleApiError } from '@/lib/errors'
import { nounRepository } from '@/lib/repositories'
import { nounService } from '@/lib/services'
import { importNounsSchema } from '@/lib/validation/nouns'

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
  return withAdmin(async () => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = importNounsSchema.parse(body)
      const { nouns, resolveConflicts } = validatedData

      // Check for existing nouns (conflicts)
      const nounNames = Object.keys(nouns)
      const existingNouns = await nounRepository.findByItalianNames(nounNames)

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

      // Create new nouns
      if (nounsToCreate.length > 0) {
        const result = await nounRepository.createMany(nounsToCreate)
        created = result.count
      }

      // Update existing nouns
      for (const { italian, data } of nounsToUpdate) {
        await nounRepository.updateByItalian(italian, {
          singolare: data.singolare,
          plurale: data.plurale,
        })
        updated++
      }

      return NextResponse.json({
        message: `Successfully imported ${created} new nouns and updated ${updated} existing nouns`,
        created,
        updated,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// GET endpoint to fetch all nouns
export async function GET(request: NextRequest) {
  return withAdmin(async () => {
    try {
      // Use noun service to get all nouns
      const nouns = await nounService.getAllNouns()

      return NextResponse.json({ nouns })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
