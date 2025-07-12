"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, UserCheck, UserX, X, ArrowUp, ArrowDown, MoreHorizontal, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/lib/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { usersApi, type User, type UserDetail, type UserListParams } from "@/lib/api/users"
import { useConfirmModal } from "@/components/ui/confirm-modal"

export default function UserManagement() {
  const [userList, setUserList] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("createdat")
  const [isAscending, setIsAscending] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Detail modal states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const { access_token } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset page to 1 when filters change
  useEffect(() => {
    if (mounted) {
      setPageNumber(1)
    }
  }, [searchQuery, genderFilter, statusFilter, sortBy, isAscending, mounted])

  const fetchUserList = async (params: UserListParams = {}) => {
    if (!access_token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await usersApi.getList(params)
      setUserList(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setPageNumber(response.pageNumber)
    } catch (err: any) {
      console.error("Error fetching user list:", err)
      
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tải danh sách người dùng.",
        variant: "destructive",
      })
      
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch và filter changes
  useEffect(() => {
    if (!mounted) return

    const params: UserListParams = {
      pageNumber: pageNumber,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.searchKeyword = searchQuery.trim()
    }

    if (genderFilter) {
      params.gender = parseInt(genderFilter)
    }

    if (statusFilter) {
      params.isActive = statusFilter === "active"
    }

    // Debounce cho search text
    const timeoutId = setTimeout(() => {
      fetchUserList(params)
    }, searchQuery.trim() ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, genderFilter, statusFilter, sortBy, isAscending, pageNumber, mounted, access_token])

  const handleResetFilters = () => {
    setSearchQuery("")
    setGenderFilter("")
    setStatusFilter("")
    setSortBy("createdat")
    setIsAscending(false)
  }

  const handlePageChange = (newPage: number) => {
    const params: UserListParams = {
      pageNumber: newPage,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.searchKeyword = searchQuery.trim()
    }

    if (genderFilter) {
      params.gender = parseInt(genderFilter)
    }

    if (statusFilter) {
      params.isActive = statusFilter === "active"
    }

    fetchUserList(params)
  }

  const handleViewUser = async (userId: string) => {
    setSelectedUserId(userId)
    setIsDetailModalOpen(true)
    setIsLoadingDetail(true)

    try {
      const userDetail = await usersApi.getDetail(userId)
      setSelectedUserDetail(userDetail)
    } catch (err: any) {
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tải thông tin người dùng.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedUserId(null)
    setSelectedUserDetail(null)
  }

  const handleToggleUserStatus = (user: User) => {
    const newStatus = !user.is_active
    const confirmModal = useConfirmModal.getState()
    
    confirmModal.open({
      title: `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản người dùng`,
      description: `Bạn có chắc chắn muốn ${newStatus ? 'kích hoạt lại' : 'vô hiệu hóa'} tài khoản người dùng sau không?`,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-3 space-y-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Username: {user.username}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">ID: {getShortId(user.id)}</p>
          </div>
          {!newStatus && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg leading-none">⚠️</span>
                <div className="space-y-1">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                    Người dùng sẽ không thể đăng nhập!
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                    Tài khoản sẽ bị khóa và không thể truy cập ứng dụng
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      confirmText: newStatus ? "Kích hoạt" : "Vô hiệu hóa",
      confirmVariant: newStatus ? "default" : "destructive",
      onConfirm: async () => {
        try {
          const message = await usersApi.updateStatus(user.id, { is_active: newStatus })
          
          toast({
            title: "Thành công!",
            description: message,
            variant: "default",
          })
          
          // Refresh user list
          const params: UserListParams = {
            pageNumber: pageNumber,
            pageSize: 10,
            sortBy: sortBy as any,
            isAscending,
          }

          if (searchQuery.trim()) {
            params.searchKeyword = searchQuery.trim()
          }

          if (genderFilter) {
            params.gender = parseInt(genderFilter)
          }

          if (statusFilter) {
            params.isActive = statusFilter === "active"
          }

          await fetchUserList(params)
          
        } catch (err: any) {
          toast({
            title: "Lỗi!",
            description: err.message || "Có lỗi xảy ra khi cập nhật trạng thái người dùng.",
            variant: "destructive",
          })
        }
      }
    })
  }

  const getShortId = (id: string) => {
    return `${id.substring(0, 8)}...`
  }

  const getGenderBadgeVariant = (gender?: number) => {
    switch (gender) {
      case 1: return "default" // Male
      case 2: return "secondary" // Female  
      case 3: return "outline" // Other
      default: return "outline" // Unknown
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const genderOptions = [
    { value: "", label: "Tất cả giới tính" },
    { value: "1", label: "Nam" },
    { value: "2", label: "Nữ" },
    { value: "3", label: "Khác" },
  ]

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Bị khóa" },
  ]

  const sortOptions = [
    { value: "createdat", label: "Ngày tạo" },
    { value: "name", label: "Tên" },
    { value: "email", label: "Email" },
    { value: "username", label: "Username" },
  ]

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={() => fetchUserList()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Xem, khóa, nâng cấp Premium cho người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tên, username, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <SimpleSelect
            value={genderFilter}
            onValueChange={setGenderFilter}
            options={genderOptions}
            placeholder="Giới tính"
            className="w-full md:w-[150px]"
          />
          
          <SimpleSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={statusOptions}
            placeholder="Trạng thái"
            className="w-full md:w-[150px]"
          />
          
          <SimpleSelect
            value={sortBy}
            onValueChange={setSortBy}
            options={sortOptions}
            placeholder="Sắp xếp"
            className="w-full md:w-[150px]"
          />
          
          <Button
            variant="outline"
            onClick={() => setIsAscending(!isAscending)}
            className="w-full md:w-auto"
          >
            {isAscending ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
          
          <Button variant="outline" onClick={handleResetFilters} className="w-full md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Tổng cộng {totalCount} người dùng
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Đang tải danh sách người dùng...
                </TableCell>
              </TableRow>
            ) : userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>{user.full_name ? user.full_name.charAt(0) : user.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={getGenderBadgeVariant(user.gender)}>
                      {user.gender_name || "Chưa rõ"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Crown className="mr-2 h-4 w-4" />
                          Nâng cấp Premium
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                          {user.is_active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Kích hoạt tài khoản
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {pageNumber} của {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={pageNumber <= 1}
              onClick={() => handlePageChange(pageNumber - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              disabled={pageNumber >= totalPages}
              onClick={() => handlePageChange(pageNumber + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chi tiết người dùng</h3>
              <Button variant="ghost" size="sm" onClick={handleCloseDetailModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingDetail ? (
              <div className="text-center py-8">Đang tải thông tin...</div>
            ) : selectedUserDetail ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUserDetail.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {selectedUserDetail.full_name ? selectedUserDetail.full_name.charAt(0) : selectedUserDetail.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-semibold">{selectedUserDetail.full_name || selectedUserDetail.username}</h4>
                      <p className="text-muted-foreground">{selectedUserDetail.email}</p>
                      <Badge variant={selectedUserDetail.is_active ? "default" : "destructive"}>
                        {selectedUserDetail.is_active ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Username:</span>
                      <p className="font-medium">{selectedUserDetail.username}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Giới tính:</span>
                      <p className="font-medium">{selectedUserDetail.gender_name || "Chưa rõ"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Số điện thoại:</span>
                      <p className="font-medium">{selectedUserDetail.phone || "Chưa có"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ngày sinh:</span>
                      <p className="font-medium">{selectedUserDetail.birthday ? formatDate(selectedUserDetail.birthday) : "Chưa có"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Địa chỉ:</span>
                      <p className="font-medium">{selectedUserDetail.address || "Chưa có"}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                {selectedUserDetail.subscription && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-2">Thông tin Premium</h5>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          {selectedUserDetail.subscription.subscription.name}
                        </span>
                        <Badge variant={selectedUserDetail.subscription.is_active ? "default" : "secondary"}>
                          {selectedUserDetail.subscription.is_active ? "Đang hoạt động" : "Hết hạn"}
                        </Badge>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Từ {formatDate(selectedUserDetail.subscription.start_date)} đến {formatDate(selectedUserDetail.subscription.end_date)}
                      </p>
                    </div>
                  </div>
                )}

                {/* System Info */}
                <div className="border-t pt-4 text-sm text-muted-foreground">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span>Ngày tham gia:</span>
                      <p>{formatDate(selectedUserDetail.created_at)}</p>
                    </div>
                    <div>
                      <span>ID:</span>
                      <p className="font-mono">{selectedUserDetail.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không thể tải thông tin người dùng
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 