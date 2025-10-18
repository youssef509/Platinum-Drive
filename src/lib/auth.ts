import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { recordLoginAttempt } from "@/lib/login-history-utils"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        })

        if (!user || !user.password) {
          // Record failed login attempt if user exists
          if (user) {
            await recordLoginAttempt({
              userId: user.id,
              status: "failed",
              ip: request?.headers?.get?.('x-forwarded-for')?.split(',')[0] || 
                  request?.headers?.get?.('x-real-ip') || 
                  'Unknown IP',
              userAgent: request?.headers?.get?.('user-agent') || 'Unknown'
            })
          }
          throw new Error("Invalid credentials")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          // Record failed login attempt
          await recordLoginAttempt({
            userId: user.id,
            status: "failed",
            ip: request?.headers?.get?.('x-forwarded-for')?.split(',')[0] || 
                request?.headers?.get?.('x-real-ip') || 
                'Unknown IP',
            userAgent: request?.headers?.get?.('user-agent') || 'Unknown'
          })
          throw new Error("Invalid credentials")
        }

        // Record successful login attempt
        await recordLoginAttempt({
          userId: user.id,
          status: "success",
          ip: request?.headers?.get?.('x-forwarded-for')?.split(',')[0] || 
              request?.headers?.get?.('x-real-ip') || 
              'Unknown IP',
          userAgent: request?.headers?.get?.('user-agent') || 'Unknown'
        })

        // Update lastLoginAt timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        token.email = user.email || ""
        token.name = user.name || ""
        token.image = user.image || ""
        
        // Store initial roles - will be updated via API when needed
        token.roles = []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.roles = token.roles as string[]
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
