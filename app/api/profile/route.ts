import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateProfileSchema } from '@/lib/validation/profile'

// GET /api/profile - Get user profile
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Get or create user profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // If profile doesn't exist, create it with default values
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          nativeLanguage: 'pt-BR',
          enabledVerbTenses: [
            'Indicativo.Presente',
            'Indicativo.Passato Prossimo',
            'Indicativo.Futuro Semplice',
          ],
        },
      })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PATCH /api/profile - Update user profile
export const PATCH = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateProfileSchema.parse(body)
    const { nativeLanguage, enabledVerbTenses } = validatedData

    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          userId,
          nativeLanguage: nativeLanguage || 'pt-BR',
          enabledVerbTenses: enabledVerbTenses || [
            'Indicativo.Presente',
            'Indicativo.Passato Prossimo',
            'Indicativo.Futuro Semplice',
          ],
        },
      })
    } else {
      // Update existing profile
      const updateData: {
        nativeLanguage?: string
        enabledVerbTenses?: string[]
      } = {}
      if (nativeLanguage) updateData.nativeLanguage = nativeLanguage
      if (enabledVerbTenses) updateData.enabledVerbTenses = enabledVerbTenses

      profile = await prisma.userProfile.update({
        where: { userId },
        data: updateData,
      })
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
