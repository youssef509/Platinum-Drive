"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          const errorMessages = Object.values(data.details).flat().join(", ")
          setError(errorMessages)
        } else {
          setError(data.error || "حدث خطأ أثناء تغيير كلمة المرور")
        }
        return
      }

      setMessage("تم تغيير كلمة المرور بنجاح")
      
      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError("حدث خطأ أثناء تغيير كلمة المرور")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md" dir="rtl">
      {message && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/10 rounded-md text-right">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md text-right">
          {error}
        </div>
      )}

      <div className="space-y-2 text-right">
        <Label htmlFor="currentPassword" className="text-right">كلمة المرور الحالية</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isLoading}
            required
            placeholder="أدخل كلمة المرور الحالية"
            className="text-right"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-right">
        <Label htmlFor="newPassword" className="text-right">كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            required
            placeholder="أدخل كلمة المرور الجديدة"
            className="text-right"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم
        </p>
      </div>

      <div className="space-y-2 text-right">
        <Label htmlFor="confirmPassword" className="text-right">تأكيد كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
            placeholder="أعد إدخال كلمة المرور الجديدة"
            className="text-right"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-start">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري التغيير...
            </>
          ) : (
            "تغيير كلمة المرور"
          )}
        </Button>
      </div>
    </form>
  )
}