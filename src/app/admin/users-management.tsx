"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Ban, 
  CheckCircle, 
  UserCheck, 
  UserX,
  MoreHorizontal,
  Loader2,
  Eye
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
  status: string
  accountStatus?: 'active' | 'suspended' | 'disabled'
  suspendedAt?: string | null
  suspendedReason?: string | null
  lastLoginAt?: string | null
  createdAt: string
  avatarUrl?: string | null
  roles: Array<{ 
    id: number
    userId: string
    roleId: number
    role: { 
      id: number
      name: string 
    } 
  }>
  storageQuota: {
    quotaBytes: number
    usedBytes: number
    utilization: number
  }
  stats: {
    filesCount: number
    foldersCount: number
  }
}

interface UsersManagementProps {
  onStatsChange: () => void
}

export default function UsersManagement({ onStatsChange }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    storageQuotaGB: 10,
    role: 'user'
  })
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    storageQuotaGB: 10,
    role: 'user'
  })

  // Format bytes
  const formatBytes = (bytes: string | bigint | number) => {
    const bytesValue = typeof bytes === 'string' ? BigInt(bytes) : typeof bytes === 'number' ? BigInt(bytes) : bytes
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytesValue === BigInt(0)) return '0 Byte'
    const i = Math.floor(Math.log(Number(bytesValue)) / Math.log(1024))
    return Math.round(Number(bytesValue) / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        role: roleFilter
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('فشل تحميل المستخدمين')

      const data = await response.json()
      setUsers(data.users || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      toast.error('فشل تحميل المستخدمين')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update user status
  const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'disabled', reason?: string) => {
    try {
      setActionLoading(userId)
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accountStatus: status,
          isActive: status === 'active',
          suspendedReason: reason 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'فشل تحديث حالة المستخدم')
      }

      toast.success('تم تحديث حالة المستخدم بنجاح')
      fetchUsers()
      onStatsChange()
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث حالة المستخدم')
      console.error('Update status error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Update user details
  const updateUser = async () => {
    if (!selectedUser) return
    
    try {
      setActionLoading(selectedUser.id)
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          storageQuotaBytes: editForm.storageQuotaGB * 1024 * 1024 * 1024,
          role: editForm.role
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'فشل تحديث بيانات المستخدم')
      }

      toast.success('تم تحديث بيانات المستخدم بنجاح')
      setShowEditDialog(false)
      fetchUsers()
      onStatsChange()
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث بيانات المستخدم')
      console.error('Update user error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email,
      storageQuotaGB: Math.round(user.storageQuota.quotaBytes / (1024 * 1024 * 1024)),
      role: user.roles[0]?.role?.name || 'user'
    })
    setShowEditDialog(true)
  }

  // Create new user
  const createUser = async () => {
    try {
      // Validate form
      if (!addForm.name || !addForm.email || !addForm.password) {
        toast.error('جميع الحقول مطلوبة')
        return
      }

      if (addForm.password.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        return
      }

      setActionLoading('creating')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          password: addForm.password,
          storageQuotaBytes: addForm.storageQuotaGB * 1024 * 1024 * 1024,
          role: addForm.role
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'فشل إضافة المستخدم')
      }

      toast.success('تم إضافة المستخدم بنجاح')
      setShowAddDialog(false)
      // Reset form
      setAddForm({
        name: '',
        email: '',
        password: '',
        storageQuotaGB: 10,
        role: 'user'
      })
      fetchUsers()
      onStatsChange()
    } catch (error: any) {
      toast.error(error.message || 'فشل إضافة المستخدم')
      console.error('Create user error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Get status badge
  const getStatusBadge = (user: User) => {
    const status = user.status || user.accountStatus
    if (!user.isActive || status !== 'active') {
      return <Badge variant="destructive">غير نشط</Badge>
    }
    return <Badge variant="default" className="bg-green-600">نشط</Badge>
  }

  // Get role badge
  const getRoleBadge = (roles: Array<{ id: number; role: { name: string } }>) => {
    const roleName = roles[0]?.role?.name || 'user'
    const isAdmin = roleName === 'admin'
    return (
      <Badge variant={isAdmin ? "default" : "secondary"}>
        {roleName === 'admin' ? 'مسؤول' : 'مستخدم'}
      </Badge>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, statusFilter, roleFilter])

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
          <Badge variant="outline">{users.length} مستخدم</Badge>
        </div>
        
        <Button 
          className="md:w-auto w-full gap-2"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
            <SelectItem value="suspended">موقوف</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأدوار</SelectItem>
            <SelectItem value="admin">مسؤول</SelectItem>
            <SelectItem value="user">مستخدم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">التخزين</TableHead>
                  <TableHead className="text-right">الملفات</TableHead>
                  <TableHead className="text-right">آخر دخول</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2">جاري التحميل...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p>لا توجد مستخدمين</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-right">{user.name || 'غير محدد'}</div>
                          <div className="text-sm text-muted-foreground text-right">{user.email}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      
                      <TableCell>{getRoleBadge(user.roles)}</TableCell>
                      
                      <TableCell>
                        <div className="text-right">
                          <div className="text-sm">{formatBytes(user.storageQuota.usedBytes)}</div>
                          <div className="text-xs text-muted-foreground">
                            من {formatBytes(user.storageQuota.quotaBytes)} (%{user.storageQuota.utilization})
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">{user.stats.filesCount}</TableCell>
                      
                      <TableCell className="text-right">
                        {user.lastLoginAt ? (
                          <div className="text-sm">
                            <div>{new Date(user.lastLoginAt).toLocaleDateString('ar-EG')}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(user.lastLoginAt).toLocaleTimeString('ar-EG', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ) : (
                          'لم يسجل دخول'
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowUserDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>عرض التفاصيل</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>تعديل</TooltipContent>
                            </Tooltip>
                            
                            {user.isActive ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => updateUserStatus(user.id, 'suspended', 'تم الإيقاف من لوحة التحكم')}
                                    disabled={actionLoading === user.id}
                                  >
                                    {actionLoading === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Ban className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>إيقاف المستخدم</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => updateUserStatus(user.id, 'active')}
                                    disabled={actionLoading === user.id}
                                  >
                                    {actionLoading === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>تفعيل المستخدم</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          <span className="text-sm">
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل المستخدم</DialogTitle>
            <DialogDescription className="text-right">
              معلومات مفصلة عن المستخدم وإحصائياته
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <Label>الاسم</Label>
                  <p className="text-sm font-medium">{selectedUser.name || 'غير محدد'}</p>
                </div>
                <div className="text-right">
                  <Label>البريد الإلكتروني</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div className="text-right">
                  <Label>الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                </div>
                <div className="text-right">
                  <Label>الدور</Label>
                  <div className="mt-1">{getRoleBadge(selectedUser.roles)}</div>
                </div>
              </div>

              {/* Storage Stats */}
              <div className="text-right">
                <Label>إحصائيات التخزين</Label>
                <div className="mt-2 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm text-right">
                    <div>
                      <span className="text-muted-foreground">المساحة المستخدمة:</span>
                      <p className="font-medium">{formatBytes(selectedUser.storageQuota.usedBytes)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المساحة الإجمالية:</span>
                      <p className="font-medium">{formatBytes(selectedUser.storageQuota.quotaBytes)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">نسبة الاستخدام:</span>
                      <p className="font-medium">%{selectedUser.storageQuota.utilization}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="text-right">
                <Label>إحصائيات النشاط</Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.stats.filesCount}</div>
                    <p className="text-xs text-muted-foreground">ملف</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedUser.stats.foldersCount}</div>
                    <p className="text-xs text-muted-foreground">مجلد</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm text-right">
                <div>
                  <Label>تاريخ الإنشاء</Label>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                <div>
                  <Label>آخر دخول</Label>
                  <p className="font-medium">
                    {selectedUser.lastLoginAt ? 
                      new Date(selectedUser.lastLoginAt).toLocaleDateString('ar-EG') : 
                      'لم يسجل دخول'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل معلومات المستخدم وصلاحياته
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2 text-right">
                <Label htmlFor="edit-name">الاسم</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="أدخل اسم المستخدم"
                  className="text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                  className="text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="edit-quota">سعة التخزين (GB)</Label>
                <Input
                  id="edit-quota"
                  type="number"
                  min="1"
                  value={editForm.storageQuotaGB}
                  onChange={(e) => setEditForm({ ...editForm, storageQuotaGB: parseInt(e.target.value) || 10 })}
                  className="text-right"
                />
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="edit-role">الدور</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="admin">مسؤول</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={updateUser} 
                  disabled={actionLoading === selectedUser.id}
                  className="flex-1"
                >
                  {actionLoading === selectedUser.id ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التغييرات'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  disabled={actionLoading === selectedUser.id}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
            <DialogDescription className="text-right">
              قم بإدخال بيانات المستخدم الجديد
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="add-name">الاسم *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="أدخل اسم المستخدم"
                className="text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="add-email">البريد الإلكتروني *</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="أدخل البريد الإلكتروني"
                className="text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="add-password">كلمة المرور *</Label>
              <Input
                id="add-password"
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                className="text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="add-quota">سعة التخزين (GB)</Label>
              <Input
                id="add-quota"
                type="number"
                min="1"
                value={addForm.storageQuotaGB}
                onChange={(e) => setAddForm({ ...addForm, storageQuotaGB: parseInt(e.target.value) || 10 })}
                className="text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="add-role">الدور</Label>
              <Select value={addForm.role} onValueChange={(value) => setAddForm({ ...addForm, role: value })}>
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مسؤول</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={createUser} 
                disabled={actionLoading === 'creating'}
                className="flex-1"
              >
                {actionLoading === 'creating' ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  'إضافة المستخدم'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                disabled={actionLoading === 'creating'}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}