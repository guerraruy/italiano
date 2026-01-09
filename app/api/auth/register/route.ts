import { NextRequest, NextResponse } from 'next/server'

import { handleApiError } from '@/lib/errors'
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
        ...(result.refreshToken && { refreshToken: result.refreshToken }),
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
