import { NextRequest } from "next/server"
import { isAdminUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { errorResponse, successResponse } from "@/lib/api/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin: admin, user } = await isAdminUser();
    if (!admin || !user) return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403);

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

    const serializedPolicies = policies.map((policy: { maxFileSize: bigint | null }) => ({
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
    const { isAdmin: admin, user } = await isAdminUser();
    if (!admin || !user) return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403);

    const body = await request.json()
    const {
      mimeType, extension, category, isAllowed, maxFileSize,
      requiresApproval, scanOnUpload, generatePreview,
      convertFormat, displayName, icon, color,
    } = body

    if (!mimeType) {
      return errorResponse("نوع MIME مطلوب", 400)
    }

    const policy = await prisma.fileTypePolicy.create({
      data: {
        mimeType, extension, category,
        isAllowed: isAllowed !== undefined ? isAllowed : true,
        maxFileSize: maxFileSize ? BigInt(maxFileSize) : null,
        requiresApproval: requiresApproval || false,
        scanOnUpload: scanOnUpload !== undefined ? scanOnUpload : true,
        generatePreview: generatePreview || false,
        convertFormat, displayName, icon, color,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "FILE_TYPE_POLICY_CREATED",
        targetType: "FileTypePolicy",
        targetId: policy.id.toString(),
        payload: { mimeType, isAllowed },
      },
    });

    return successResponse({
      message: "تم إنشاء سياسة نوع الملف بنجاح",
      policy: { ...policy, maxFileSize: policy.maxFileSize?.toString() },
    })
  } catch (error) {
    console.error("Create file type policy error:", error)
    return errorResponse("خطأ في إنشاء سياسة نوع الملف", 500)
  }
}
