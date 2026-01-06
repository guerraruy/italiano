import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Verb } from '@prisma/client'
import { withAdmin } from '@/lib/auth'
import { importVerbsSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

interface VerbData {
  regular: boolean
  reflexive: boolean
  tr_ptBR: string
  tr_en?: string
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
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = importVerbsSchema.parse(body)
      const { verbs, resolveConflicts } = validatedData

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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to import verbs' },
        { status: 500 }
      )
    }
  })(request)
}

// GET endpoint to fetch all verbs
export async function GET(request: NextRequest) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const verbs = await prisma.verb.findMany({
        orderBy: {
          italian: 'asc',
        },
      })

      return NextResponse.json({ verbs })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch verbs' },
        { status: 500 }
      )
    }
  })(request)
}
