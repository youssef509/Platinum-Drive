import prisma from "@/lib/prisma"
import { headers } from "next/headers"

interface LoginAttemptData {
  userId: string
  status: "success" | "failed"
  ip?: string
  userAgent?: string
}

/**
 * Parse user agent to determine device type
 */
function parseDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('iphone')) return 'iPhone'
  if (ua.includes('ipad')) return 'iPad'
  if (ua.includes('android') && ua.includes('mobile')) return 'Android Phone'
  if (ua.includes('android')) return 'Android Tablet'
  if (ua.includes('windows')) return 'Windows Desktop'
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac Desktop'
  if (ua.includes('linux')) return 'Linux Desktop'
  if (ua.includes('tablet')) return 'Tablet'
  
  return 'Unknown Device'
}

/**
 * Record a login attempt in the database
 */
export async function recordLoginAttempt(data: LoginAttemptData): Promise<void> {
  try {
    const device = data.userAgent ? parseDevice(data.userAgent) : 'Unknown Device'
    
    await prisma.loginHistory.create({
      data: {
        userId: data.userId,
        status: data.status,
        ip: data.ip,
        userAgent: data.userAgent,
        device,
        location: null, // Will be implemented with IP geolocation service later
      },
    })
  } catch (error) {
    console.error("Failed to record login attempt:", error)
    // Don't throw error to avoid breaking login flow
  }
}

/**
 * Get IP and User Agent from request headers
 */
export async function getClientInfo() {
  const headersList = await headers()
  
  const ip = 
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    'Unknown IP'
  
  const userAgent = headersList.get('user-agent') || 'Unknown User Agent'
  
  return { ip, userAgent }
}
