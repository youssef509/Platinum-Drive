"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileType, 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X,
  Loader2,
  Shield,
  Image,
  Video,
  FileText,
  Music,
  Archive
} from "lucide-react"
import { toast } from "sonner"

interface FileTypePolicy {
  id: number
  mimeType: string
  extension?: string
  category?: string
  displayName?: string
  isAllowed: boolean
  maxFileSize?: number
  requiresApproval: boolean
  scanOnUpload: boolean
  generatePreview: boolean
  icon?: string
  color?: string
  createdAt: string
  updatedAt: string
}

const categoryIcons = {
  image: Image,
  video: Video,
  document: FileText,
  audio: Music,
  archive: Archive,
  other: FileType
}

const categoryColors = {
  image: 'text-green-600',
  video: 'text-blue-600', 
  document: 'text-orange-600',
  audio: 'text-purple-600',
  archive: 'text-gray-600',
  other: 'text-gray-500'
}

export default function FileTypesManagement() {
  const [fileTypes, setFileTypes] = useState<FileTypePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState<FileTypePolicy | null>(null)
  const [saving, setSaving] = useState(false)

  // New/Edit file type form
  const [formData, setFormData] = useState({
    mimeType: '',
    extension: '',
    category: 'other',
    displayName: '',
    isAllowed: true,
    maxFileSize: 100, // MB
    requiresApproval: false,
    scanOnUpload: true,
    generatePreview: false,
    color: '#6b7280'
  })

  // Load file types
  const loadFileTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/file-types')
      if (!response.ok) throw new Error('فشل تحميل أنواع الملفات')
      
      const data = await response.json()
      setFileTypes(data.fileTypes || [])
    } catch (error) {
      toast.error('فشل تحميل أنواع الملفات')
      console.error('Error loading file types:', error)
    } finally {
      setLoading(false)
    }
  }

  // Save file type
  const saveFileType = async () => {
    try {
      setSaving(true)
      const url = editingType ? `/api/admin/file-types/${editingType.id}` : '/api/admin/file-types'
      const method = editingType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxFileSize: formData.maxFileSize * 1024 * 1024 // Convert MB to bytes
        })
      })

      if (!response.ok) throw new Error('فشل حفظ نوع الملف')
      
      toast.success(editingType ? 'تم تحديث نوع الملف' : 'تم إضافة نوع الملف')
      setShowDialog(false)
      resetForm()
      loadFileTypes()
    } catch (error) {
      toast.error('فشل حفظ نوع الملف')
      console.error('Error saving file type:', error)
    } finally {
      setSaving(false)
    }
  }

  // Delete file type
  const deleteFileType = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف نوع الملف هذا؟')) return

    try {
      const response = await fetch(`/api/admin/file-types/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('فشل حذف نوع الملف')
      
      toast.success('تم حذف نوع الملف')
      loadFileTypes()
    } catch (error) {
      toast.error('فشل حذف نوع الملف')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      mimeType: '',
      extension: '',
      category: 'other',
      displayName: '',
      isAllowed: true,
      maxFileSize: 100,
      requiresApproval: false,
      scanOnUpload: true,
      generatePreview: false,
      color: '#6b7280'
    })
    setEditingType(null)
  }

  // Open edit dialog
  const editFileType = (fileType: FileTypePolicy) => {
    setEditingType(fileType)
    setFormData({
      mimeType: fileType.mimeType,
      extension: fileType.extension || '',
      category: fileType.category || 'other',
      displayName: fileType.displayName || '',
      isAllowed: fileType.isAllowed,
      maxFileSize: fileType.maxFileSize ? Math.round(fileType.maxFileSize / (1024 * 1024)) : 100,
      requiresApproval: fileType.requiresApproval,
      scanOnUpload: fileType.scanOnUpload,
      generatePreview: fileType.generatePreview,
      color: fileType.color || '#6b7280'
    })
    setShowDialog(true)
  }

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Get category icon
  const getCategoryIcon = (category?: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || FileType
    const colorClass = categoryColors[category as keyof typeof categoryColors] || 'text-gray-500'
    return <IconComponent className={`h-4 w-4 ${colorClass}`} />
  }

  // Filter file types
  const filteredFileTypes = fileTypes.filter(ft => {
    const matchesSearch = ft.mimeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ft.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (ft.extension?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesCategory = categoryFilter === 'all' || ft.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'allowed' && ft.isAllowed) ||
                         (statusFilter === 'blocked' && !ft.isAllowed)

    return matchesSearch && matchesCategory && matchesStatus
  })

  useEffect(() => {
    loadFileTypes()
  }, [])

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-xl font-semibold">إدارة أنواع الملفات</h2>
          <p className="text-sm text-muted-foreground">
            إدارة الأنواع المسموحة من الملفات وسياسات الرفع
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة نوع ملف
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-right">
                {editingType ? 'تعديل نوع الملف' : 'إضافة نوع ملف جديد'}
              </DialogTitle>
              <DialogDescription className="text-right">
                تحديد نوع MIME وسياسات الرفع للملف
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mimeType" className="text-right block">نوع MIME *</Label>
                  <Select value={formData.mimeType} onValueChange={(value) => setFormData(prev => ({ ...prev, mimeType: value }))}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر نوع MIME" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>صور</SelectLabel>
                        <SelectItem value="image/jpeg">image/jpeg</SelectItem>
                        <SelectItem value="image/png">image/png</SelectItem>
                        <SelectItem value="image/gif">image/gif</SelectItem>
                        <SelectItem value="image/webp">image/webp</SelectItem>
                        <SelectItem value="image/svg+xml">image/svg+xml</SelectItem>
                        <SelectItem value="image/bmp">image/bmp</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>فيديو</SelectLabel>
                        <SelectItem value="video/mp4">video/mp4</SelectItem>
                        <SelectItem value="video/mpeg">video/mpeg</SelectItem>
                        <SelectItem value="video/webm">video/webm</SelectItem>
                        <SelectItem value="video/ogg">video/ogg</SelectItem>
                        <SelectItem value="video/quicktime">video/quicktime</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>صوت</SelectLabel>
                        <SelectItem value="audio/mpeg">audio/mpeg</SelectItem>
                        <SelectItem value="audio/wav">audio/wav</SelectItem>
                        <SelectItem value="audio/ogg">audio/ogg</SelectItem>
                        <SelectItem value="audio/webm">audio/webm</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>مستندات</SelectLabel>
                        <SelectItem value="application/pdf">application/pdf</SelectItem>
                        <SelectItem value="application/msword">application/msword (.doc)</SelectItem>
                        <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</SelectItem>
                        <SelectItem value="application/vnd.ms-excel">Excel (.xls)</SelectItem>
                        <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</SelectItem>
                        <SelectItem value="application/vnd.ms-powerpoint">PowerPoint (.ppt)</SelectItem>
                        <SelectItem value="application/vnd.openxmlformats-officedocument.presentationml.presentation">PPTX</SelectItem>
                        <SelectItem value="text/plain">text/plain</SelectItem>
                        <SelectItem value="text/csv">text/csv</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>أرشيف</SelectLabel>
                        <SelectItem value="application/zip">application/zip</SelectItem>
                        <SelectItem value="application/x-rar-compressed">application/x-rar-compressed</SelectItem>
                        <SelectItem value="application/x-7z-compressed">application/x-7z-compressed</SelectItem>
                        <SelectItem value="application/gzip">application/gzip</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>أخرى</SelectLabel>
                        <SelectItem value="application/json">application/json</SelectItem>
                        <SelectItem value="application/xml">application/xml</SelectItem>
                        <SelectItem value="text/html">text/html</SelectItem>
                        <SelectItem value="text/css">text/css</SelectItem>
                        <SelectItem value="text/javascript">text/javascript</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="extension" className="text-right block">امتداد الملف</Label>
                  <Input
                    id="extension"
                    value={formData.extension}
                    onChange={(e) => setFormData(prev => ({ ...prev, extension: e.target.value }))}
                    placeholder="jpg"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-right block">الاسم المعروض</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="صورة JPEG"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-right block">التصنيف</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">صور</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="document">مستندات</SelectItem>
                      <SelectItem value="audio">صوت</SelectItem>
                      <SelectItem value="archive">أرشيف</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize" className="text-right block">حد حجم الملف (ميجابايت)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="5000"
                  value={formData.maxFileSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Switch
                    checked={formData.isAllowed}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAllowed: checked }))}
                  />
                  <div className="flex-1 mr-3 text-right">
                    <Label className="text-sm">السماح بالرفع</Label>
                    <p className="text-xs text-muted-foreground">السماح برفع هذا النوع من الملفات</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Switch
                    checked={formData.requiresApproval}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresApproval: checked }))}
                  />
                  <div className="flex-1 mr-3 text-right">
                    <Label className="text-sm">يتطلب موافقة</Label>
                    <p className="text-xs text-muted-foreground">مراجعة الملف قبل النشر</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Switch
                    checked={formData.scanOnUpload}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scanOnUpload: checked }))}
                  />
                  <div className="flex-1 mr-3 text-right">
                    <Label className="text-sm">فحص الفيروسات</Label>
                    <p className="text-xs text-muted-foreground">فحص الملف عند الرفع</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Switch
                    checked={formData.generatePreview}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, generatePreview: checked }))}
                  />
                  <div className="flex-1 mr-3 text-right">
                    <Label className="text-sm">إنشاء معاينة</Label>
                    <p className="text-xs text-muted-foreground">إنشاء صورة مصغرة للملف</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-start">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={saveFileType} disabled={saving || !formData.mimeType}>
                  {saving ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      {editingType ? 'تحديث' : 'إضافة'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="البحث في أنواع الملفات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-right"
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] text-right">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            <SelectItem value="image">صور</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
            <SelectItem value="document">مستندات</SelectItem>
            <SelectItem value="audio">صوت</SelectItem>
            <SelectItem value="archive">أرشيف</SelectItem>
            <SelectItem value="other">أخرى</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] text-right">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="allowed">مسموح</SelectItem>
            <SelectItem value="blocked">محظور</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File Types Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">حد الحجم</TableHead>
                  <TableHead className="text-right">السياسات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2">جاري التحميل...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredFileTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p>لا توجد أنواع ملفات</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFileTypes.map((fileType) => (
                    <TableRow key={fileType.id}>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">{fileType.displayName || fileType.mimeType}</div>
                          <div className="text-sm text-muted-foreground">{fileType.mimeType}</div>
                          {fileType.extension && (
                            <Badge variant="outline" className="text-xs mt-1">.{fileType.extension}</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(fileType.category)}
                          <span className="capitalize">{fileType.category || 'أخرى'}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={fileType.isAllowed ? "default" : "destructive"}>
                          {fileType.isAllowed ? 'مسموح' : 'محظور'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {formatFileSize(fileType.maxFileSize)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          {fileType.requiresApproval && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 ml-1" />
                              موافقة
                            </Badge>
                          )}
                          {fileType.scanOnUpload && (
                            <Badge variant="secondary" className="text-xs">فحص</Badge>
                          )}
                          {fileType.generatePreview && (
                            <Badge variant="secondary" className="text-xs">معاينة</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editFileType(fileType)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFileType(fileType.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}