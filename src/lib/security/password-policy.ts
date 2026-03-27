import prisma from "@/lib/db/prisma"

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate password against system security settings
 */
export async function validatePassword(password: string): Promise<PasswordValidationResult> {
  const errors: string[] = []

  // Get security settings
  const enforceStrongPasswordsSetting = await prisma.systemSettings.findUnique({
    where: { key: 'security.enforceStrongPasswords' }
  })

  const enforceStrongPasswords = enforceStrongPasswordsSetting?.value !== 'false' && 
                                 enforceStrongPasswordsSetting?.value !== false

  if (!enforceStrongPasswords) {
    // No strong password enforcement, only check minimum length
    if (password.length < 6) {
      errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    }
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Strong password validation
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*...)')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check if password was used before (password history)
 */
export async function checkPasswordHistory(
  userId: string,
  newPasswordHash: string
): Promise<boolean> {
  // Get password history count setting
  const historyCountSetting = await prisma.systemSettings.findUnique({
    where: { key: 'security.passwordHistoryCount' }
  })

  const historyCount = parseInt(historyCountSetting?.value as string || '3')

  if (historyCount === 0) {
    return true // No password history check
  }

  // Get user's password history
  const passwordHistory = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: historyCount
  })

  // Check if new password matches any in history
  const bcrypt = require('bcryptjs')
  for (const entry of passwordHistory) {
    const matches = await bcrypt.compare(newPasswordHash, entry.passwordHash)
    if (matches) {
      return false // Password was used before
    }
  }

  return true // Password is acceptable
}

/**
 * Check if password has expired
 */
export async function isPasswordExpired(userId: string): Promise<boolean> {
  // Get password expiry setting
  const expirySetting = await prisma.systemSettings.findUnique({
    where: { key: 'security.passwordExpiryDays' }
  })

  const expiryDays = parseInt(expirySetting?.value as string || '0')

  if (expiryDays === 0) {
    return false // No password expiry
  }

  // Get user's last password change
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordChangedAt: true }
  })

  if (!user?.passwordChangedAt) {
    return false // No password change date, assume not expired
  }

  const daysSinceChange = Math.floor(
    (Date.now() - user.passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceChange >= expiryDays
}

/**
 * Save password to history
 */
export async function savePasswordToHistory(
  userId: string,
  passwordHash: string
): Promise<void> {
  const historyCountSetting = await prisma.systemSettings.findUnique({
    where: { key: 'security.passwordHistoryCount' }
  })

  const historyCount = parseInt(historyCountSetting?.value as string || '3')

  if (historyCount === 0) {
    return // No password history tracking
  }

  // Add to history
  await prisma.passwordHistory.create({
    data: {
      userId,
      passwordHash
    }
  })

  // Clean up old history entries (keep only the last N)
  const allHistory = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  if (allHistory.length > historyCount) {
    const toDelete = allHistory.slice(historyCount)
    await prisma.passwordHistory.deleteMany({
      where: {
        id: {
          in: toDelete.map((h: { id: string }) => h.id)
        }
      }
    })
  }
}
