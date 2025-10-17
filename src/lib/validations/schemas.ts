import { z } from "zod"

// Password validation schema with custom rules in Arabic
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")
  .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")
  .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")

// Email validation schema in Arabic
export const emailSchema = z
  .string()
  .email("تنسيق البريد الإلكتروني غير صحيح")
  .toLowerCase()

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
})

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

// Update user profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
  email: emailSchema.optional(),
  locale: z.enum(["en", "ar"]).optional(),
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
})

// File upload schema
export const fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  size: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  folderId: z.string().uuid().optional(),
})

// Folder creation schema
export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(255, "Folder name too long"),
  parentId: z.string().uuid().optional(),
})

// Shared link creation schema
export const createSharedLinkSchema = z.object({
  fileId: z.string().uuid("Invalid file ID"),
  expiresAt: z.string().datetime().optional(),
  maxDownloads: z.number().positive().optional(),
  password: z.string().min(4).optional(),
  notes: z.string().max(500).optional(),
})

// Permission schema
export const permissionSchema = z.object({
  userId: z.string().uuid().optional(),
  roleId: z.number().int().positive().optional(),
  fileId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
  canRead: z.boolean().default(true),
  canWrite: z.boolean().default(false),
  canShare: z.boolean().default(false),
}).refine(
  (data) => data.userId || data.roleId,
  "Either userId or roleId must be provided"
).refine(
  (data) => data.fileId || data.folderId,
  "Either fileId or folderId must be provided"
)

// Types inferred from schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type CreateFolderInput = z.infer<typeof createFolderSchema>
export type CreateSharedLinkInput = z.infer<typeof createSharedLinkSchema>
export type PermissionInput = z.infer<typeof permissionSchema>
