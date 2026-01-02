import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to verify authentication
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get or create user profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // If profile doesn't exist, create it with default values
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          nativeLanguage: 'pt-BR',
        },
      })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = await authenticate(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { nativeLanguage } = await request.json()

    // Validation
    if (!nativeLanguage) {
      return NextResponse.json(
        { error: 'Native language is required' },
        { status: 400 }
      )
    }

    if (!['pt-BR', 'en'].includes(nativeLanguage)) {
      return NextResponse.json(
        { error: 'Invalid native language. Must be pt-BR or en' },
        { status: 400 }
      )
    }

    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          userId,
          nativeLanguage,
        },
      })
    } else {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { userId },
        data: { nativeLanguage },
      })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile,
    }, { status: 200 })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

