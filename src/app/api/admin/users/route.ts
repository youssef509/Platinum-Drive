import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/api-utils"
import bcrypt from "bcryptjs"

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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const role = searchParams.get("role") || ""
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.accountStatus = status
    }

    if (role && role !== "all") {
      where.roles = {
        some: {
          role: {
            name: role
          }
        }
      }
    }

    // Get users with their quota info
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              files: true,
              folders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.user.count({ where }),
    ])

    // Serialize BigInt fields and transform data structure
    const serializedUsers = users.map(user => {
      const quotaBytes = user.storageQuotaBytes ? Number(user.storageQuotaBytes) : 0
      const usedBytes = user.usedStorageBytes ? Number(user.usedStorageBytes) : 0
      const utilization = quotaBytes > 0 ? Math.round((usedBytes / quotaBytes) * 100) : 0

      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        emailVerified: user.emailVerified,
        avatarUrl: user.image,
        status: user.accountStatus,
        isActive: user.isActive,
        suspendedAt: user.suspendedAt,
        suspendedReason: user.suspendedReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        roles: user.roles,
        storageQuota: {
          quotaBytes: quotaBytes,
          usedBytes: usedBytes,
          utilization: utilization
        },
        stats: {
          filesCount: user._count.files,
          foldersCount: user._count.folders
        }
      }
    })

    return successResponse({
      users: serializedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return errorResponse("خطأ في جلب المستخدمين", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const body = await request.json()
    const { name, email, password, storageQuotaBytes, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse("الاسم والبريد الإلكتروني وكلمة المرور مطلوبة", 400)
    }

    if (password.length < 6) {
      return errorResponse("كلمة المرور يجب أن تكون 6 أحرف على الأقل", 400)
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return errorResponse("البريد الإلكتروني مستخدم بالفعل", 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        storageQuotaBytes: storageQuotaBytes ? BigInt(storageQuotaBytes) : BigInt(10737418240), // 10GB default
      },
    })

    // Get role
    const roleRecord = await prisma.role.findFirst({
      where: { name: role || 'user' }
    })

    if (roleRecord) {
      // Assign role
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: roleRecord.id
        }
      })
    }

    // Serialize BigInt fields
    const serializedUser = {
      ...newUser,
      storageQuotaBytes: newUser.storageQuotaBytes ? newUser.storageQuotaBytes.toString() : null,
      usedStorageBytes: newUser.usedStorageBytes ? newUser.usedStorageBytes.toString() : null,
    }

    return successResponse({
      message: "تم إضافة المستخدم بنجاح",
      user: serializedUser
    }, 201)
  } catch (error: any) {
    console.error("Create user error:", error)
    return errorResponse(error.message || "خطأ في إضافة المستخدم", 500)
  }
}
