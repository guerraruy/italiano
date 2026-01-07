import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (error.message === 'Current password is incorrect') {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
