import { NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/user/preferences
 * Get user preferences from UserSettings
 */
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings (or create defaults if they don't exist)
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: dbUser.id }
    })

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: { userId: dbUser.id }
      })
    }

    const preferences = {
      calendarType: userSettings.calendarType || 'gregorian',
      dateFormat: userSettings.dateFormat || 'DD/MM/YYYY',
      timeFormat: userSettings.timeFormat || '24',
      language: userSettings.language || 'ar',
      timezone: userSettings.timezone || 'Asia/Riyadh'
    }

    return NextResponse.json({
      success: true,
      preferences
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
