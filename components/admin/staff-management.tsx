"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Eye, Edit, Trash2, UserCheck, UserX, X, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/lib/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { staffApi, type Staff, type StaffListParams } from "@/lib/api/staff"
import CreateStaffModal from "./create-staff-modal"

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [positionFilter, setPositionFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("createdat")
  const [isAscending, setIsAscending] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const { access_token } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchStaffList = async (params: StaffListParams = {}) => {
    if (!access_token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await staffApi.getList(params)
      setStaffList(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setPageNumber(response.pageNumber)
    } catch (err: any) {
      console.error("Error fetching staff list:", err)
      
      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tải danh sách nhân viên.",
        variant: "destructive",
      })
      
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchStaffList({ pageNumber: 1, pageSize: 10, sortBy: "createdat" as any, isAscending: false })
    }
  }, [access_token, mounted])

  // Real-time filtering - tự động fetch khi filter thay đổi
  useEffect(() => {
    if (!mounted) return

    const params: StaffListParams = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.fullName = searchQuery.trim()
    }

    if (positionFilter) {
      params.position = parseInt(positionFilter)
    }

    if (statusFilter) {
      params.isActive = statusFilter === "active"
    }

    // Debounce cho search text để tránh quá nhiều API calls
    const timeoutId = setTimeout(() => {
      fetchStaffList(params)
    }, searchQuery.trim() ? 500 : 0) // 500ms debounce cho search, ngay lập tức cho dropdown

    return () => clearTimeout(timeoutId)
  }, [searchQuery, positionFilter, statusFilter, sortBy, isAscending, mounted])

  const handleResetFilters = () => {
    setSearchQuery("")
    setPositionFilter("")
    setStatusFilter("")
    setSortBy("createdat")
    setIsAscending(false)
    // fetchStaffList sẽ tự động được gọi qua useEffect
  }

  const handlePageChange = (newPage: number) => {
    const params: StaffListParams = {
      pageNumber: newPage,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.fullName = searchQuery.trim()
    }

    if (positionFilter) {
      params.position = parseInt(positionFilter)
    }

    if (statusFilter) {
      params.isActive = statusFilter === "active"
    }

    fetchStaffList(params)
  }

  const getShortId = (id: string) => {
    return id.slice(-8)
  }

  const getPositionBadgeVariant = (positionId: number) => {
    switch (positionId) {
      case 1: return "default" // Administrator
      case 2: return "secondary" // Staff
      case 3: return "outline" // UserManager
      case 4: return "destructive" // LibraryManager
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý nhân viên</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách nhân viên trong hệ thống ({totalCount} nhân viên)
          </p>
        </div>
        <CreateStaffModal onSuccess={() => fetchStaffList({ pageNumber, pageSize: 10 })} />
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        </div>

        {mounted && (
          <>
            <SimpleSelect
              value={positionFilter}
              onValueChange={setPositionFilter}
              placeholder="Chức vụ"
              className="w-[120px]"
              options={[
                { value: "1", label: "Administrator" },
                { value: "2", label: "Staff" },
                { value: "3", label: "User Manager" },
                { value: "4", label: "Library Manager" }
              ]}
            />

            <SimpleSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Trạng thái"
              className="w-[110px]"
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Tạm khóa" }
              ]}
            />

            <SimpleSelect
              value={`${sortBy}-${isAscending ? 'asc' : 'desc'}`}
              onValueChange={(value) => {
                const [field, direction] = value.split('-')
                setSortBy(field)
                setIsAscending(direction === 'asc')
              }}
              placeholder="Sắp xếp"
              className="w-[120px]"
              options={[
                { value: "fullname-asc", label: "Tên A→Z" },
                { value: "fullname-desc", label: "Tên Z→A" },
                { value: "email-asc", label: "Email A→Z" },
                { value: "email-desc", label: "Email Z→A" },
                { value: "createdat-desc", label: "Mới nhất" },
                { value: "createdat-asc", label: "Cũ nhất" },
                { value: "position-asc", label: "Chức vụ A→Z" },
                { value: "position-desc", label: "Chức vụ Z→A" }
              ]}
            />
          </>
        )}

        <Button onClick={handleResetFilters} disabled={isLoading} variant="outline" size="sm">
          Đặt lại
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bảng danh sách nhân viên */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Mã nhân viên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : staffList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Không có dữ liệu nhân viên
                </TableCell>
              </TableRow>
            ) : (
              staffList.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-mono text-sm">
                    {getShortId(staff.id)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {staff.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {staff.staff_code || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{staff.email || "N/A"}</TableCell>
                  <TableCell>{staff.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getPositionBadgeVariant(staff.position_id)}>
                      {staff.position}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.is_active ? "default" : "destructive"}>
                      {staff.is_active ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {staff.is_active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Vô hiệu hóa
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa nhân viên
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

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {staffList.length} trong tổng số {totalCount} nhân viên
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {pageNumber} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
