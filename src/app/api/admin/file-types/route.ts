import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/api-utils"

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  })

  return user?.roles.some((ur) => ur.role.name === "admin") || false
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isAllowed = searchParams.get("isAllowed")

    const where: any = {}
    if (category) where.category = category
    if (isAllowed) where.isAllowed = isAllowed === "true"

    const policies = await prisma.fileTypePolicy.findMany({
      where,
      orderBy: [{ category: "asc" }, { mimeType: "asc" }],
    })

    // Convert BigInt to string for JSON serialization
    const serializedPolicies = policies.map(policy => ({
      ...policy,
      maxFileSize: policy.maxFileSize ? policy.maxFileSize.toString() : null,
    }))

    return successResponse({ fileTypes: serializedPolicies })
  } catch (error) {
    console.error("Get file type policies error:", error)
    return errorResponse("خطأ في جلب سياسات أنواع الملفات", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const body = await request.json()
    const {
      mimeType,
      extension,
      category,
      isAllowed,
      maxFileSize,
      requiresApproval,
      scanOnUpload,
      generatePreview,
      convertFormat,
      displayName,
      icon,
      color,
    } = body

    if (!mimeType) {
      return errorResponse("نوع MIME مطلوب", 400)
    }

    const policy = await prisma.fileTypePolicy.create({
      data: {
        mimeType,
        extension,
        category,
        isAllowed: isAllowed !== undefined ? isAllowed : true,
        maxFileSize: maxFileSize ? BigInt(maxFileSize) : null,
        requiresApproval: requiresApproval || false,
        scanOnUpload: scanOnUpload !== undefined ? scanOnUpload : true,
        generatePreview: generatePreview || false,
        convertFormat,
        displayName,
        icon,
        color,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "FILE_TYPE_POLICY_CREATED",
        targetType: "FileTypePolicy",
        targetId: policy.id.toString(),
        payload: { mimeType, isAllowed },
      },
    })

    return successResponse({
      message: "تم إنشاء سياسة نوع الملف بنجاح",
      policy: {
        ...policy,
        maxFileSize: policy.maxFileSize?.toString(),
      },
    })
  } catch (error) {
    console.error("Create file type policy error:", error)
    return errorResponse("خطأ في إنشاء سياسة نوع الملف", 500)
  }
}
