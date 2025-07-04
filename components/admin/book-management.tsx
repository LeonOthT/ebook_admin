"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Eye, Edit, Trash2, Settings, Star, BookOpen, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { booksApi, type Book, type BookListParams } from "@/lib/api/books"
import { useBookCategories } from "@/hooks/use-reference-data"
import CreateBookModal from "./create-book-modal"
import { BookStatusTrigger } from "./book-status-modal"

export default function BookManagement() {
  const [bookList, setBookList] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [premiumFilter, setPremiumFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("createdat")
  const [isAscending, setIsAscending] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Sử dụng reference API cho categories với auto-load (cần cho filter ngay)
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useBookCategories(true)

  const { access_token } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Categories sẽ tự động load khi hook khởi tạo (autoLoad = true)

  // Hiển thị lỗi categories nếu có
  useEffect(() => {
    if (categoriesError) {
      console.error("Failed to load categories for filter:", categoriesError)
      toast({
        title: "Cảnh báo!",
        description: "Không thể tải danh sách danh mục cho bộ lọc",
        variant: "destructive",
      })
    }
  }, [categoriesError, toast])

  const fetchBookList = async (params: BookListParams = {}) => {
    if (!access_token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await booksApi.getList(params, access_token)
      setBookList(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setPageNumber(response.pageNumber)
    } catch (err: any) {
      console.error("Error fetching book list:", err)
      
      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tải danh sách sách.",
        variant: "destructive",
      })
      
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchBookList({ pageNumber: 1, pageSize: 10, sortBy: "createdat", isAscending: false })
    }
  }, [access_token, mounted])

  // Real-time filtering - tự động fetch khi filter thay đổi
  useEffect(() => {
    if (!mounted) return

    const params: BookListParams = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim()
    }

    if (categoryFilter) {
      params.categoryId = categoryFilter
    }

    if (approvalStatusFilter) {
      params.approvalStatus = parseInt(approvalStatusFilter) as 0 | 1 | 2
    }

    if (statusFilter) {
      params.status = parseInt(statusFilter) as 0 | 1
    }

    if (premiumFilter) {
      params.isPremium = premiumFilter === "premium"
    }

    // Debounce cho search text để tránh quá nhiều API calls
    const timeoutId = setTimeout(() => {
      fetchBookList(params)
    }, searchQuery.trim() ? 500 : 0) // 500ms debounce cho search, ngay lập tức cho dropdown

    return () => clearTimeout(timeoutId)
  }, [searchQuery, categoryFilter, approvalStatusFilter, statusFilter, premiumFilter, sortBy, isAscending, mounted])

  const handleResetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("")
    setApprovalStatusFilter("")
    setStatusFilter("")
    setPremiumFilter("")
    setSortBy("createdat")
    setIsAscending(false)
    // fetchBookList sẽ tự động được gọi qua useEffect
  }

  const handleSortChange = (field: string) => {
    setSortBy(field)
    setIsAscending(sortBy === field ? !isAscending : true)
  }

  const handlePageChange = (newPage: number) => {
    const params: BookListParams = {
      pageNumber: newPage,
      pageSize: 10,
      sortBy: sortBy as any,
      isAscending,
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim()
    }

    if (categoryFilter) {
      params.categoryId = categoryFilter
    }

    if (approvalStatusFilter) {
      params.approvalStatus = parseInt(approvalStatusFilter) as 0 | 1 | 2
    }

    if (statusFilter) {
      params.status = parseInt(statusFilter) as 0 | 1
    }

    if (premiumFilter) {
      params.isPremium = premiumFilter === "premium"
    }

    fetchBookList(params)
  }

  const getShortId = (id: string) => {
    return id.slice(-8)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : "N/A"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý sách</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách sách trong thư viện ({totalCount} sách)
          </p>
        </div>
        <CreateBookModal onSuccess={() => fetchBookList({ pageNumber, pageSize: 10, sortBy: sortBy as any, isAscending })} />
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, tác giả, ISBN, nhà xuất bản, tags..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </div>

          {mounted && (
            <>
              <SimpleSelect
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                placeholder="Danh mục"
                className="w-[110px]"
                options={[
                  ...categories
                ]}
              />

              <SimpleSelect
                value={approvalStatusFilter}
                onValueChange={setApprovalStatusFilter}
                placeholder="Phê duyệt"
                className="w-[110px]"
                options={[
                  { value: "0", label: "Chờ duyệt" },
                  { value: "1", label: "Đã duyệt" },
                  { value: "2", label: "Từ chối" }
                ]}
              />

              <SimpleSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Trạng thái"
                className="w-[110px]"
                options={[
                  { value: "0", label: "Hoạt động" },
                  { value: "1", label: "Tạm khóa" }
                ]}
              />

              <SimpleSelect
                value={premiumFilter}
                onValueChange={setPremiumFilter}
                placeholder="Loại"
                className="w-[90px]"
                options={[
                  { value: "premium", label: "Premium" },
                  { value: "free", label: "Miễn phí" }
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
                  { value: "title-asc", label: "Tên A→Z" },
                  { value: "title-desc", label: "Tên Z→A" },
                  { value: "author-asc", label: "Tác giả A→Z" },
                  { value: "author-desc", label: "Tác giả Z→A" },
                  { value: "createdat-desc", label: "Mới nhất" },
                  { value: "createdat-asc", label: "Cũ nhất" },
                  { value: "rating-desc", label: "Đánh giá cao" },
                  { value: "rating-asc", label: "Đánh giá thấp" },
                  { value: "totalviews-desc", label: "Xem nhiều" },
                  { value: "totalviews-asc", label: "Xem ít" }
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

      {/* Bảng danh sách sách */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Ngày xuất bản</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : bookList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Không có dữ liệu sách
                </TableCell>
              </TableRow>
            ) : (
              bookList.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-mono text-sm">
                    {getShortId(book.id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-12 bg-gray-100 rounded flex items-center justify-center">
                        {book.cover_image_url ? (
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium truncate max-w-[200px]">{book.title}</div>
                        {book.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {book.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {book.author}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.category_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={book.is_premium ? "default" : "secondary"}>
                      {book.is_premium ? "Premium" : "Miễn phí"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{formatRating(book.average_rating)}</span>
                      <span className="text-sm text-muted-foreground">({book.total_ratings})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {book.total_views.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {book.published_date ? formatDate(book.published_date) : "N/A"}
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
                        <BookStatusTrigger
                          bookId={book.id}
                          bookTitle={book.title}
                          currentPremium={book.is_premium}
                          onSuccess={() => fetchBookList({ pageNumber, pageSize: 10, sortBy: sortBy as any, isAscending })}
                        />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa sách
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
            Hiển thị {bookList.length} trong tổng số {totalCount} sách
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
