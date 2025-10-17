"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"

interface ProfileFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentImage, setCurrentImage] = useState(user.image || "")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("نوع الملف غير مدعوم", {
        description: "يرجى اختيار صورة JPG، PNG، أو WebP"
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("حجم الملف كبير جداً", {
        description: "الحد الأقصى 5MB"
      })
      return
    }

    setIsUploadingImage(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('image', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok) {
        toast.error("فشل في رفع الصورة", {
          description: data.error || "حدث خطأ أثناء رفع الصورة"
        })
        return
      }

      setCurrentImage(data.imageUrl)
      toast.success("تم تحديث الصورة الشخصية بنجاح", {
        description: "تم حفظ صورتك الجديدة"
      })
      
      // Refresh the page to update all components
      window.location.reload()
    } catch (err) {
      toast.error("حدث خطأ أثناء رفع الصورة", {
        description: "يرجى المحاولة مرة أخرى"
      })
    } finally {
      setIsUploadingImage(false)
      setUploadProgress(0)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || undefined,
          email: email !== user.email ? email : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          const errorMessages = Object.values(data.details).flat().join(", ")
          setError(errorMessages)
        } else {
          setError(data.error || "حدث خطأ أثناء تحديث الملف الشخصي")
        }
        return
      }

      setMessage("تم تحديث الملف الشخصي بنجاح")
      toast.success("تم تحديث الملف الشخصي", {
        description: "تم حفظ التغييرات بنجاح"
      })
      
      // Refresh to update all components with new data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الملف الشخصي")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6 justify-start">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentImage || ""} alt={user.name || ""} />
            <AvatarFallback className="text-lg">
              {getInitials(user.name || user.email || "مستخدم")}
            </AvatarFallback>
          </Avatar>
          {isUploadingImage && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="space-y-3 text-right">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploadingImage}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
          >
            <Camera className="h-4 w-4 ml-2" />
            {isUploadingImage ? "جاري الرفع..." : "تغيير الصورة"}
          </Button>
          {isUploadingImage && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-32" />
              <p className="text-xs text-muted-foreground text-right">
                {uploadProgress}% مكتمل
              </p>
            </div>
          )}
          {!isUploadingImage && (
            <p className="text-xs text-muted-foreground text-right">
              JPG, PNG أو WebP. الحد الأقصى 5MB
            </p>
          )}
        </div>
      </div>

      {/* User Role */}
      <div className="space-y-2 text-right">
        <Label className="text-right">الدور</Label>
        <div className="flex gap-2 justify-start">
          <Badge variant="secondary">
            {user.role === "ADMIN" ? "مدير" : user.role === "MODERATOR" ? "مشرف" : "مستخدم"}
          </Badge>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="name" className="text-right">الاسم</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            placeholder="أدخل اسمك"
            className="text-right"
          />
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="أدخل بريدك الإلكتروني"
            className="text-right"
          />
          <p className="text-xs text-muted-foreground text-right">
            تأكد من استخدام بريد إلكتروني صحيح وغير مستخدم من قبل
          </p>
        </div>

        <div className="flex justify-start">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ التغييرات"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}