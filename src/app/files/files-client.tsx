'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploadZone } from '@/components/file-upload-zone'
import { FileCard } from '@/components/file-card'
import { FolderCard } from '@/components/folder-card'
import { FolderBreadcrumb } from '@/components/folder-breadcrumb'
import { Button } from '@/components/ui/button'
import { RefreshCw, Grid3x3, List, Loader2, FolderPlus } from 'lucide-react'
import { toast } from 'sonner'

interface FilesPageClientProps {
  userId: string
}

interface FileData {
  id: string
  name: string
  size: number
  mimeType: string
  createdAt: string
  storageKey: string
  folder: {
    id: string
    name: string
  } | null
}

interface FolderData {
  id: string
  name: string
  createdAt: string
  _count: {
    files: number
    children: number
  }
}

interface BreadcrumbItem {
  id: string | null
  name: string
}

export default function FilesPageClient({ userId }: FilesPageClientProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([
    { id: null, name: 'الرئيسية' }
  ])
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch files and folders
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch folders
      const foldersResponse = await fetch(`/api/folders${currentFolderId ? `?parentId=${currentFolderId}` : ''}`)
      if (!foldersResponse.ok) throw new Error('فشل تحميل المجلدات')
      const foldersData = await foldersResponse.json()
      setFolders(foldersData.folders || [])

      // Fetch files
      const filesResponse = await fetch(`/api/files${currentFolderId ? `?folderId=${currentFolderId}` : ''}`)
      if (!filesResponse.ok) throw new Error('فشل تحميل الملفات')
      const filesData = await filesResponse.json()
      setFiles(filesData.files || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshKey, currentFolderId])

  const handleCreateFolder = async () => {
    const folderName = prompt('أدخل اسم المجلد الجديد:')
    
    if (!folderName || folderName.trim() === '') {
      return
    }

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName.trim(),
          parentId: currentFolderId,
        }),
      })

      if (!response.ok) {
        throw new Error('فشل إنشاء المجلد')
      }

      toast.success('تم إنشاء المجلد بنجاح')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('فشل إنشاء المجلد')
    }
  }

  const handleOpenFolder = async (folderId: string) => {
    try {
      // Fetch folder details to add to breadcrumb
      const response = await fetch(`/api/folders/${folderId}`)
      if (!response.ok) throw new Error('فشل تحميل المجلد')
      
      const data = await response.json()
      const folder = data.folder

      // Update breadcrumb
      setBreadcrumbPath(prev => [...prev, { id: folder.id, name: folder.name }])
      setCurrentFolderId(folderId)
    } catch (error) {
      console.error('Error opening folder:', error)
      toast.error('فشل فتح المجلد')
    }
  }

  const handleNavigateTo = (folderId: string | null) => {
    // Find the index of the clicked breadcrumb item
    const index = breadcrumbPath.findIndex(item => item.id === folderId)
    
    if (index !== -1) {
      // Update breadcrumb to remove everything after clicked item
      setBreadcrumbPath(breadcrumbPath.slice(0, index + 1))
      setCurrentFolderId(folderId)
    }
  }

  const handleUploadComplete = (fileId: string) => {
    setRefreshKey(prev => prev + 1)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFileDelete = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFolderDelete = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFolderRename = () => {
    setRefreshKey(prev => prev + 1)
  }

  const totalItems = files.length + folders.length

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ملفاتي</h1>
          <p className="text-muted-foreground">
            قم برفع وإدارة ملفاتك ومجلداتك
          </p>
        </div>
        <div className="flex gap-2">
          {/* Create Folder Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateFolder}
          >
            <FolderPlus className="h-4 w-4 ml-2" />
            مجلد جديد
          </Button>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbPath.length > 1 && (
        <Card>
          <CardContent className="py-3">
            <FolderBreadcrumb 
              path={breadcrumbPath}
              onNavigate={handleNavigateTo}
            />
          </CardContent>
        </Card>
      )}

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>رفع الملفات</CardTitle>
          <CardDescription>
            اسحب وأفلت الملفات أو انقر لتحديدها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            folderId={currentFolderId}
            onUploadComplete={handleUploadComplete}
          />
        </CardContent>
      </Card>

      {/* Files and Folders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            المحتويات ({totalItems})
          </CardTitle>
          <CardDescription>
            {folders.length > 0 && `${folders.length} مجلد`}
            {folders.length > 0 && files.length > 0 && ' • '}
            {files.length > 0 && `${files.length} ملف`}
            {totalItems === 0 && 'لا توجد محتويات بعد'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد ملفات أو مجلدات</p>
              <p className="text-sm mt-2">قم بإنشاء مجلد أو رفع ملف للبدء</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'space-y-2'
            }>
              {/* Folders First */}
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  viewMode={viewMode}
                  onOpen={handleOpenFolder}
                  onDelete={handleFolderDelete}
                  onRename={handleFolderRename}
                />
              ))}

              {/* Then Files */}
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onDelete={handleFileDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
