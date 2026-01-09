import { NextRequest, NextResponse } from 'next/server'

import { handleApiError } from '@/lib/errors'
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
        ...(result.refreshToken && { refreshToken: result.refreshToken }),
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
