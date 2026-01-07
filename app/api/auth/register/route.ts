import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authService } from '@/lib/services'
import { registerSchema } from '@/lib/validation/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Use auth service for registration
    const result = await authService.register(validatedData)

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: result.user,
        token: result.accessToken,
        refreshToken: result.refreshToken,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (
        error.message === 'Username already exists' ||
        error.message === 'Email already exists'
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
