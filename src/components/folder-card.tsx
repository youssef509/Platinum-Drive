'use client'

import { useState } from 'react'
import { Folder, MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FolderCardProps {
  folder: {
    id: string
    name: string
    createdAt: Date | string
    _count?: {
      files: number
      children: number
    }
  }
  onOpen?: (folderId: string) => void
  onDelete?: () => void
  onRename?: (folderId: string, newName: string) => void
  viewMode?: 'grid' | 'list'
}

export function FolderCard({ folder, onOpen, onDelete, onRename, viewMode = 'grid' }: FolderCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)

  const handleOpen = () => {
    onOpen?.(folder.id)
  }

  const handleRename = async () => {
    const newName = prompt('أدخل اسم المجلد الجديد:', folder.name)
    
    if (!newName || newName.trim() === '') {
      return
    }

    if (newName.trim() === folder.name) {
      return
    }

    try {
      setIsRenaming(true)
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (!response.ok) {
        throw new Error('فشل إعادة تسمية المجلد')
      }

      toast.success('تم إعادة تسمية المجلد بنجاح')
      onRename?.(folder.id, newName.trim())
    } catch (error) {
      console.error('Rename error:', error)
      toast.error('فشل إعادة تسمية المجلد')
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    const fileCount = folder._count?.files || 0
    const folderCount = folder._count?.children || 0

    if (fileCount > 0 || folderCount > 0) {
      toast.error('لا يمكن حذف مجلد يحتوي على ملفات أو مجلدات فرعية')
      return
    }

    if (!confirm(`هل أنت متأكد من حذف المجلد "${folder.name}"؟`)) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('فشل حذف المجلد')
      }

      toast.success('تم حذف المجلد بنجاح')
      onDelete?.()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('فشل حذف المجلد')
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = new Date(folder.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const itemCount = (folder._count?.files || 0) + (folder._count?.children || 0)

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group" 
        dir="rtl"
        onClick={handleOpen}
      >
        {/* Folder Icon */}
        <div className="shrink-0">
          <Folder className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
        </div>

        {/* Folder Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{folder.name}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{itemCount} عنصر</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpen}>
                <FolderOpen className="h-4 w-4 ml-2" />
                فتح
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename} disabled={isRenaming}>
                <Edit className="h-4 w-4 ml-2" />
                إعادة تسمية
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div 
      className="group relative border rounded-lg p-4 hover:shadow-md transition-all bg-card cursor-pointer" 
      dir="rtl"
      onClick={handleOpen}
    >
      {/* Folder Icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <Folder className="h-8 w-8 text-blue-500" />
        </div>

        {/* Folder Name */}
        <div className="w-full text-center">
          <p className="font-medium text-sm truncate px-2" title={folder.name}>
            {folder.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {itemCount} عنصر
          </p>
        </div>
      </div>

      {/* Actions Menu */}
      <div 
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpen}>
              <FolderOpen className="h-4 w-4 ml-2" />
              فتح
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRename} disabled={isRenaming}>
              <Edit className="h-4 w-4 ml-2" />
              إعادة تسمية
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Date Footer */}
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground text-center">
        {formattedDate}
      </div>
    </div>
  )
}
