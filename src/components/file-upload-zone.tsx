'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { formatFileSize } from '@/lib/file-utils'
import { cn } from '@/lib/utils'

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  uploadedFileId?: string
}

interface FileUploadZoneProps {
  folderId?: string | null
  onUploadComplete?: (fileId: string) => void
  className?: string
}

export function FileUploadZone({ folderId, onUploadComplete, className }: FileUploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending',
    }))

    setFiles(prev => [...prev, ...newFiles])
    uploadFiles(newFiles)
  }, [folderId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    setIsUploading(true)

    for (const uploadFile of filesToUpload) {
      try {
        // Update status to uploading
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
          )
        )

        const formData = new FormData()
        formData.append('file', uploadFile.file)
        if (folderId) {
          formData.append('folderId', folderId)
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          )
        }, 200)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'فشل رفع الملف')
        }

        const data = await response.json()

        // Update status to success
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'success', progress: 100, uploadedFileId: data.file.id }
              : f
          )
        )

        toast.success(`تم رفع ${uploadFile.file.name} بنجاح`)
        
        if (onUploadComplete && data.file.id) {
          onUploadComplete(data.file.id)
        }
      } catch (error) {
        console.error('Upload error:', error)
        const errorMessage = error instanceof Error ? error.message : 'فشل رفع الملف'
        
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', progress: 0, error: errorMessage }
              : f
          )
        )

        toast.error(errorMessage)
      }
    }

    setIsUploading(false)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  const retryFailed = () => {
    const failedFiles = files.filter(f => f.status === 'error')
    if (failedFiles.length > 0) {
      uploadFiles(failedFiles)
    }
  }

  return (
    <div className={cn('space-y-4', className)} dir="rtl">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className={cn(
            'h-12 w-12',
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'أفلت الملفات هنا...' : 'اسحب وأفلت الملفات هنا'}
            </p>
            <p className="text-sm text-muted-foreground">
              أو انقر لتحديد الملفات
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            الحد الأقصى: 100MB لكل ملف
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              قائمة الملفات ({files.length})
            </h3>
            <div className="flex gap-2">
              {files.some(f => f.status === 'error') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={retryFailed}
                  disabled={isUploading}
                >
                  إعادة المحاولة
                </Button>
              )}
              {files.some(f => f.status === 'success') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCompleted}
                  disabled={isUploading}
                >
                  مسح المكتملة
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map(uploadFile => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* File Icon */}
                <div className="shrink-0">
                  {uploadFile.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : uploadFile.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : uploadFile.status === 'uploading' ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <File className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(uploadFile.file.size)}</span>
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <span className="text-red-500">• {uploadFile.error}</span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Remove Button */}
                {uploadFile.status !== 'uploading' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(uploadFile.id)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
