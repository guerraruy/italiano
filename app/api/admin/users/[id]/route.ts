import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdmin } from '@/lib/auth'
import { updateUserSchema, userIdSchema } from '@/lib/validation/users'
import { z } from 'zod'

// DELETE: Remove a user (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { id } = await context.params

      // Validate userId
      userIdSchema.parse({ userId: id })

      // Prevent admin from deleting themselves
      if (id === userId) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        )
      }

      await prisma.user.delete({
        where: { id },
      })

      return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }
  })(request)
}

// PATCH: Toggle admin status (admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { id } = await context.params

      // Validate userId
      userIdSchema.parse({ userId: id })

      // Prevent admin from removing their own admin status
      if (id === userId) {
        return NextResponse.json(
          { error: 'Cannot modify your own admin status' },
          { status: 400 }
        )
      }

      const body = await request.json()

      // Validate input
      const validatedData = updateUserSchema.parse(body)
      const { admin } = validatedData

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { admin },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          admin: true,
          createdAt: true,
        },
      })

      return NextResponse.json({ user: updatedUser })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
  })(request)
}
