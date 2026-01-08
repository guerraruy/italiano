import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { authService } from '@/lib/services'
import { changePasswordSchema } from '@/lib/validation/auth'

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = changePasswordSchema.parse(body)

    // Use auth service to change password
    await authService.changePassword(userId, validatedData)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    return handleApiError(error)
  }
})
