import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: List all users (admin only)
export const GET = withAdmin(async (request: NextRequest, userId: string) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        admin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})
