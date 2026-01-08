import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { handleApiError, ValidationError } from '@/lib/errors'
import { userService } from '@/lib/services'
import { updateUserSchema, userIdSchema } from '@/lib/validation/users'

// DELETE: Remove a user (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdmin(async (_request: NextRequest, userId: string) => {
    try {
      const { id } = await context.params

      // Validate userId
      userIdSchema.parse({ userId: id })

      // Prevent admin from deleting themselves
      if (id === userId) {
        throw new ValidationError('Cannot delete your own account')
      }

      // Use user service to delete user
      await userService.deleteUser(id)

      return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// PATCH: Toggle admin status (admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdmin(async (_request: NextRequest, userId: string) => {
    try {
      const { id } = await context.params

      // Validate userId
      userIdSchema.parse({ userId: id })

      // Prevent admin from removing their own admin status
      if (id === userId) {
        throw new ValidationError('Cannot modify your own admin status')
      }

      const body = await request.json()

      // Validate input
      const validatedData = updateUserSchema.parse(body)
      const { admin } = validatedData

      // Use user service to update admin status
      const updatedUser = await userService.updateAdminStatus(id, admin)

      return NextResponse.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          admin: updatedUser.admin,
          createdAt: updatedUser.createdAt,
        },
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
