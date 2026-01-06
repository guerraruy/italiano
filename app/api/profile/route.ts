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
          enabledVerbTenses: [
            'Indicativo.Presente',
            'Indicativo.Passato Prossimo',
            'Indicativo.Futuro Semplice',
          ],
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

    const { nativeLanguage, enabledVerbTenses } = await request.json()

    // Validation
    if (nativeLanguage && !['pt-BR', 'en'].includes(nativeLanguage)) {
      return NextResponse.json(
        { error: 'Invalid native language. Must be pt-BR or en' },
        { status: 400 }
      )
    }

    if (enabledVerbTenses && !Array.isArray(enabledVerbTenses)) {
      return NextResponse.json(
        { error: 'enabledVerbTenses must be an array' },
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
          nativeLanguage: nativeLanguage || 'pt-BR',
          enabledVerbTenses: enabledVerbTenses || [
            'Indicativo.Presente',
            'Indicativo.Passato Prossimo',
            'Indicativo.Futuro Semplice',
          ],
        },
      })
    } else {
      // Update existing profile
      const updateData: { nativeLanguage?: string; enabledVerbTenses?: string[] } = {}
      if (nativeLanguage) updateData.nativeLanguage = nativeLanguage
      if (enabledVerbTenses) updateData.enabledVerbTenses = enabledVerbTenses
      
      profile = await prisma.userProfile.update({
        where: { userId },
        data: updateData,
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

