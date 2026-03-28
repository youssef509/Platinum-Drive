import { NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'

/**
 * POST /api/test-email
 * Test email sending functionality
 */
export async function POST(request: Request) {
  try {
    // Import email service dynamically to avoid Edge Runtime issues
    const {
      sendPasswordChangedEmail,
      sendNewLoginEmail,
      sendStorageWarningEmail,
      sendStorageFullEmail,
      sendWelcomeEmail,
    } = await import('@/lib/services/email')

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

    const body = await request.json()
    const { type, email } = body

    const userEmail = email || dbUser.email
    const userName = dbUser.name

    let result = false

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(userEmail, userName || undefined)
        break
      case 'password_changed':
        result = await sendPasswordChangedEmail(userEmail, userName || undefined)
        break
      case 'new_login':
        result = await sendNewLoginEmail(userEmail, userName || undefined, 'Chrome على Windows', 'القاهرة، مصر')
        break
      case 'storage_warning':
        result = await sendStorageWarningEmail(userEmail, userName || undefined, 90)
        break
      case 'storage_full':
        result = await sendStorageFullEmail(userEmail, userName || undefined)
        break
      default:
        return NextResponse.json(
          { error: 'نوع البريد غير صحيح' },
          { status: 400 }
        )
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'تم إرسال البريد الإلكتروني بنجاح',
      })
    } else {
      return NextResponse.json(
        { error: 'فشل إرسال البريد الإلكتروني' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'خطأ في إرسال البريد الإلكتروني', details: (error as Error).message },
      { status: 500 }
    )
  }
}
