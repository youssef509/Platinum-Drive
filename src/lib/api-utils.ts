import { ZodError } from "zod"
import { NextResponse } from "next/server"

/**
 * Format Zod validation errors into a readable format
 */
export function formatZodError(error: ZodError) {
  const errors: Record<string, string[]> = {}
  
  error.issues.forEach((err) => {
    const path = err.path.join(".")
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })
  
  return errors
}

/**
 * Create a standardized validation error response
 */
export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: formatZodError(error),
    },
    { status: 400 }
  )
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Create a standardized success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
