import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth'
import { verbRepository, conjugationRepository } from '@/lib/repositories'
import { importConjugationsSchema } from '@/lib/validation/verbs'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

interface ConjugationData {
  [mood: string]: {
    [tense: string]:
      | {
          [person: string]: string
        }
      | string // For simple forms like Participio Presente/Passato
  }
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
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = importConjugationsSchema.parse(body)
      const { conjugations, resolveConflicts } = validatedData

      // Find or validate verbs exist in the database
      const verbNames = Object.keys(conjugations)
      const existingVerbs = (await verbRepository.findByItalianNames(
        verbNames
      )) as any[]

      // Get conjugations for these verbs
      const verbsWithConjugations: VerbWithConjugations[] = []
      for (const verb of existingVerbs) {
        const conj = await conjugationRepository.findByVerbId(verb.id)
        verbsWithConjugations.push({
          ...verb,
          conjugations: conj ? [conj] : [],
        })
      }

      const existingVerbMap = new Map<string, VerbWithConjugations>(
        verbsWithConjugations.map((v) => [v.italian, v])
      )

      // Check for missing verbs
      const missingVerbs = verbNames.filter(
        (name) => !existingVerbMap.has(name)
      )
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
                conjugation: conjugationData as ConjugationData,
              })
            }
            // If 'keep', we skip this verb
          } else {
            // No resolution yet, add to conflicts
            conflicts.push({
              verbName,
              existing: existingConjugation.conjugation as ConjugationData,
              new: conjugationData as ConjugationData,
            })
          }
        } else {
          conjugationsToCreate.push({
            verbId: verb.id,
            conjugation: conjugationData as ConjugationData,
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
        await conjugationRepository.create({
          verb: { connect: { id: verbId } },
          conjugation: conjugation as Prisma.InputJsonValue,
        })
        created++
      }

      // Update existing conjugations
      for (const { verbId, conjugation } of conjugationsToUpdate) {
        const existing = await conjugationRepository.findByVerbId(verbId)
        if (existing) {
          await conjugationRepository.update(existing.id, {
            conjugation: conjugation as Prisma.InputJsonValue,
          })
          updated++
        }
      }

      return NextResponse.json({
        success: true,
        created,
        updated,
        message: `Successfully imported ${created} new conjugations and updated ${updated} existing conjugations.`,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to import conjugations' },
        { status: 500 }
      )
    }
  })(request)
}

// GET endpoint to fetch all verb conjugations
export async function GET(request: NextRequest) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      // Use conjugation repository to get all conjugations with verbs
      const conjugations = await conjugationRepository.findAllWithVerbs()

      return NextResponse.json({ conjugations })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch conjugations' },
        { status: 500 }
      )
    }
  })(request)
}
