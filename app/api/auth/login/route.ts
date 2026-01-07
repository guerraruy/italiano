import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authService } from '@/lib/services'
import { loginSchema } from '@/lib/validation/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)
    // Use auth service for login
    const result = await authService.login(validatedData)

    return NextResponse.json(
      {
        message: 'Login successful',
        user: result.user,
        token: result.accessToken,
        refreshToken: result.refreshToken,
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

    if (error instanceof Error && error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
