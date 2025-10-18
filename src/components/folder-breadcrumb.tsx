'use client'

import { Home, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BreadcrumbItem {
  id: string | null
  name: string
}

interface FolderBreadcrumbProps {
  path: BreadcrumbItem[]
  onNavigate: (folderId: string | null) => void
}

export function FolderBreadcrumb({ path, onNavigate }: FolderBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" dir="rtl">
      {path.map((item, index) => (
        <div key={item.id || 'root'} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
          <Button
            variant={index === path.length - 1 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate(item.id)}
            className="gap-2"
          >
            {index === 0 && <Home className="h-4 w-4" />}
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
