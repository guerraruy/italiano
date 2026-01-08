import { NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { userService } from '@/lib/services'

// GET: List all users (admin only)
export const GET = withAdmin(async () => {
  try {
    const users = await userService.getAllUsers()

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
})
