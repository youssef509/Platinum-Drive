'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSignUp } from '@clerk/nextjs/legacy'

function VerifyContent() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { signUp, setActive, isLoaded } = useSignUp()

  useEffect(() => {
    if (!email) {
      router.push('/sign-in')
    }
  }, [email, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setError('')
    setIsLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setSuccess(true)
        setTimeout(() => router.push('/'), 2000)
      } else {
        setError('رمز التحقق غير صحيح أو انتهت صلاحيته')
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message?: string }> }
      setError(clerkError.errors?.[0]?.message || 'رمز التحقق غير صحيح')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!isLoaded || !signUp) return
    setResending(true)
    setError('')

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setError('تم إرسال رمز جديد إلى بريدك الإلكتروني')
    } catch {
      setError('فشل إعادة الإرسال')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold">تم التحقق بنجاح!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              جاري تحويلك إلى الصفحة الرئيسية...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">تحقق من بريدك الإلكتروني</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            تم إرسال رمز التحقق إلى <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">رمز التحقق</Label>
            <Input
              id="code"
              type="text"
              placeholder="أدخل رمز التحقق المكون من 6 أرقام"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              maxLength={6}
              required
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button type="submit" disabled={isLoading || code.length !== 6 || !isLoaded} className="w-full">
            {isLoading ? 'جاري التحقق...' : 'تحقق'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !isLoaded}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
            >
              {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold">جاري التحميل...</h1>
          </div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
