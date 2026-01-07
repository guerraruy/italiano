import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
import { profileService } from '@/lib/services'
import { updateProfileSchema } from '@/lib/validation/profile'

// GET /api/profile - Get user profile
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Use profile service to get or create profile
    const profile = await profileService.getProfile(userId)

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

    // Use profile service to update profile
    const profile = await profileService.updateProfile(userId, validatedData)

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
