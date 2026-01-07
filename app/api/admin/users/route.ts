import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { userService } from '@/lib/services'

// GET: List all users (admin only)
export const GET = withAdmin(async (request: NextRequest, userId: string) => {
  try {
    const users = await userService.getAllUsers()

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})
