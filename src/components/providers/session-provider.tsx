"use client"

// ClerkProvider is already provided in the root layout.
// This component is kept for backward compatibility.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
