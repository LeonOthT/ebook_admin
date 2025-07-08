"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Eye, Edit, Trash2, FolderPlus, X, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/lib/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { categoriesApi, type BookCategory, type CategoryListParams } from "@/lib/api/categories"
import CreateCategoryModal from "./create-category-modal"

export default function CategoryManagement() {
  const [categoryList, setCategoryList] = useState<BookCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
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

  const fetchCategoryList = async (params: CategoryListParams = {}) => {
    if (!access_token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await categoriesApi.getList(params)
      setCategoryList(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setPageNumber(response.pageNumber)
    } catch (err: any) {
      console.error("Error fetching category list:", err)
      
      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tải danh sách danh mục.",
        variant: "destructive",
      })
      
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchCategoryList({ pageNumber: 1, pageSize: 10, sortBy: "createdat", isAscending: false })
    }
  }, [access_token, mounted])

  // Real-time filtering - tự động fetch khi filter thay đổi
  useEffect(() => {
    if (!mounted) return

    const params: CategoryListParams = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.name = searchQuery.trim()
    }

    if (statusFilter) {
      params.status = statusFilter === "active" ? 1 : 0
    }

    // Debounce cho search text để tránh quá nhiều API calls
    const timeoutId = setTimeout(() => {
      fetchCategoryList(params)
    }, searchQuery.trim() ? 500 : 0) // 500ms debounce cho search, ngay lập tức cho dropdown

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, sortBy, isAscending, mounted])

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("")
    setSortBy("createdat")
    setIsAscending(false)
    // fetchCategoryList sẽ tự động được gọi qua useEffect
  }

  const handleSortChange = (field: string) => {
    setSortBy(field)
    setIsAscending(sortBy === field ? !isAscending : true)
  }

  const handlePageChange = (newPage: number) => {
    const params: CategoryListParams = {
      pageNumber: newPage,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.name = searchQuery.trim()
    }

    if (statusFilter) {
      params.status = statusFilter === "active" ? 1 : 0
    }

    fetchCategoryList(params)
  }

  const getShortId = (id: string) => {
    return id.slice(-8)
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === "Active" ? "default" : "destructive"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý danh mục sách</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách danh mục sách trong hệ thống ({totalCount} danh mục)
          </p>
        </div>
        <CreateCategoryModal onSuccess={() => fetchCategoryList({ pageNumber, pageSize: 10, sortBy: sortBy as any, isAscending })} />
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên danh mục..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </div>

          {mounted && (
            <>
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
                  handleSortChange(field)
                }}
                placeholder="Sắp xếp"
                className="w-[120px]"
                options={[
                  { value: "name-asc", label: "Tên A→Z" },
                  { value: "name-desc", label: "Tên Z→A" },
                  { value: "createdat-desc", label: "Mới nhất" },
                  { value: "createdat-asc", label: "Cũ nhất" },
                  { value: "bookscount-desc", label: "Nhiều sách" },
                  { value: "bookscount-asc", label: "Ít sách" }
                ]}
              />
            </>
          )}

          <Button onClick={handleResetFilters} disabled={isLoading} variant="outline" size="sm">
            Đặt lại
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Grid view - Card design */}
      {!isLoading && (
        <>
          {categoryList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không có dữ liệu danh mục</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryList.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(category.status)}>
                          {category.status === "Active" ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
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
                              <FolderPlus className="mr-2 h-4 w-4" />
                              {category.status === "Active" ? "Vô hiệu hóa" : "Kích hoạt"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa danh mục
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {category.books_count} sách
                        </Badge>
                        <span className="font-mono text-xs">
                          ID: {getShortId(category.id)}
                        </span>
                      </div>
                      <span>{formatDate(category.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Sửa
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {categoryList.length} trong tổng số {totalCount} danh mục
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
