// Authentication is now handled by Clerk.
// This file is kept to avoid 404 errors on old auth paths.
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
