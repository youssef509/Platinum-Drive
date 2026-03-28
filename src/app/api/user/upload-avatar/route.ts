import { NextRequest, NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      )
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم اختيار ملف" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. يرجى اختيار صورة JPG، PNG، أو WebP" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً. الحد الأقصى 5MB" },
        { status: 400 }
      )
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${dbUser.id}-${Date.now()}.${fileExtension}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Vercel Blob
    const blob = await put(`avatars/${fileName}`, buffer, {
      access: 'public',
      contentType: file.type,
    })

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { image: blob.url },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roles: {
          include: {
            role: true
          }
        },
      },
    })

    return NextResponse.json({
      message: "تم تحديث الصورة الشخصية بنجاح",
      user: updatedUser,
      imageUrl: blob.url,
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء رفع الصورة" },
      { status: 500 }
    )
  }
}
