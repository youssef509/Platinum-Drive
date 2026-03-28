import { NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

/**
 * DELETE /api/notifications/clear-all
 * Delete all read notifications for the current user
 */
export async function DELETE() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const result = await prisma.notification.deleteMany({
      where: {
        userId: dbUser.id,
        isRead: true,
      },
    })

    return NextResponse.json({ 
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Failed to clear notifications:', error)
    return NextResponse.json(
      { error: 'فشل مسح الإشعارات' },
      { status: 500 }
    )
  }
}
