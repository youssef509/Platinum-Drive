import prisma from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

/**
 * Initialize default roles in the database
 * This should be run during app initialization or as a seed script
 */
export async function initializeRoles() {
  const defaultRoles = ["admin", "user", "guest"]

  for (const roleName of defaultRoles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
  }

  console.log("✅ Default roles initialized")
}

/**
 * Seed users in the database
 */
export async function seedUsers() {
  console.log("Creating users...")

  const users = [
    {
      email: "youssef201.dev@gmail.com",
      password: "005100",
      name: "Youssef",
      roleName: "admin",
    },
    {
      email: "john.doe@example.com",
      password: "Test1234",
      name: "John Doe",
      roleName: "user",
    },
    {
      email: "jane.smith@example.com",
      password: "Test1234",
      name: "Jane Smith",
      roleName: "user",
    },
  ]

  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } })
  const userRole = await prisma.role.findUnique({ where: { name: "user" } })

  if (!adminRole || !userRole) {
    throw new Error("Roles not found. Run initializeRoles first.")
  }

  for (const userData of users) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      console.log(`⏭️  User ${userData.email} already exists, skipping...`)
      continue
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
    })

    // Assign role
    const role = userData.roleName === "admin" ? adminRole : userRole
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    })

    console.log(`✅ Created user: ${userData.email} (${userData.roleName})`)
  }

  console.log("✅ Users seeded successfully")
}

/**
 * Seed script - run with: npx tsx prisma/seed.ts
 */
async function main() {
  console.log("🌱 Starting database seed...")
  console.log("")

  // Initialize roles
  await initializeRoles()
  console.log("")

  // Seed users
  await seedUsers()
  console.log("")

  console.log("🎉 Database seed completed!")
}

main()
  .catch((e) => {
    console.error("Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
