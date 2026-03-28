import { auth, currentUser as clerkCurrentUser, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/db/prisma'

// Re-export Clerk's native helpers
export { auth, clerkClient }

/**
 * Get the local Prisma user for the currently authenticated Clerk user.
 * Auto-provisions the user in our database on first login.
 */
export async function getDbUser() {
  const clerkUser = await clerkCurrentUser()
  if (!clerkUser) return null

  const email =
    clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!email) return null

  let dbUser = await prisma.user.findUnique({ where: { email } })

  if (!dbUser) {
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null
    dbUser = await prisma.user.create({
      data: { email, name, emailVerified: new Date() },
    })
    const defaultRole = await prisma.role.findFirst({ where: { name: 'user' } })
    if (defaultRole) {
      await prisma.userRole
        .create({ data: { userId: dbUser.id, roleId: defaultRole.id } })
        .catch(() => {}) // ignore duplicate
    }
  }

  return dbUser
}

/**
 * Check if the currently authenticated user is an admin.
 * Returns the db user and admin flag.
 */
export async function isAdminUser() {
  const dbUser = await getDbUser()
  if (!dbUser) return { isAdmin: false, user: null }

  const userWithRoles = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: { roles: { include: { role: true } } },
  })

  const adminCheck =
    userWithRoles?.roles?.some(
      (ur: { role: { name: string } }) => ur.role.name === 'admin'
    ) ?? false

  return { isAdmin: adminCheck, user: dbUser }
}
