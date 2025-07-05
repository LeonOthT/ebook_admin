"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { booksApi, type Book, type BookListParams, type BookDetailResponse } from "@/lib/api/books"
import { useBookCategories } from "@/hooks/use-reference-data"
import CreateBookModal from "./create-book-modal"
import UpdateBookModal from "./update-book-modal"
import BookDetailModal from "./book-detail-modal"
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
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<BookDetailResponse | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sử dụng reference API cho categories với auto-load (cần cho filter ngay)
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useBookCategories(true)

  const { access_token, user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  // Kiểm tra quyền Admin
  const isAdmin = user?.app_role?.includes("Admin") || false

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
      
      // Đánh dấu đã load lần đầu thành công
      if (!initialLoadDone) {
        setInitialLoadDone(true)
      }
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

  // Real-time filtering - tự động fetch khi filter thay đổi
  useEffect(() => {
    if (!access_token) return

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
  }, [searchQuery, categoryFilter, approvalStatusFilter, statusFilter, premiumFilter, sortBy, isAscending, access_token])

  // Reset filters khi user logout/login
  useEffect(() => {
    if (access_token && initialLoadDone) {
      // Khi có access_token mới và đã từng load, reset lại state
      setSearchQuery("")
      setCategoryFilter("")
      setApprovalStatusFilter("")
      setStatusFilter("")
      setPremiumFilter("")
      setSortBy("createdat")
      setIsAscending(false)
      setPageNumber(1)
      setInitialLoadDone(false)
    }
  }, [access_token])

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

  const handleViewBook = (bookId: string) => {
    setSelectedBookId(bookId)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedBookId(null)
  }

  const handleEditBook = async (bookId: string) => {
    if (!access_token) return

    try {
      const bookDetail = await booksApi.getDetail(bookId, access_token)
      setSelectedBookForEdit(bookDetail)
      setIsEditModalOpen(true)
    } catch (err: any) {
      console.error("Error fetching book detail for edit:", err)
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tải thông tin sách.",
        variant: "destructive",
      })
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedBookForEdit(null)
  }

  const handleDeleteBook = (book: Book) => {
    if (!isAdmin) {
      toast({
        title: "Không có quyền!",
        description: "Chỉ Admin mới có quyền xóa sách.",
        variant: "destructive",
      })
      return
    }
    
    setBookToDelete(book)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!bookToDelete || !access_token) return

    setIsDeleting(true)
    try {
      await booksApi.delete(bookToDelete.id, access_token)
      
      toast({
        title: "Thành công!",
        description: `Đã xóa sách "${bookToDelete.title}" thành công.`,
        variant: "default",
      })

      // Refresh danh sách sách
      const params: BookListParams = {
        pageNumber,
        pageSize: 10,
        sortBy: sortBy as any,
        isAscending,
      }

      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (categoryFilter) params.categoryId = categoryFilter
      if (approvalStatusFilter) params.approvalStatus = parseInt(approvalStatusFilter) as 0 | 1 | 2
      if (statusFilter) params.status = parseInt(statusFilter) as 0 | 1
      if (premiumFilter) params.isPremium = premiumFilter === "true"

      fetchBookList(params)
    } catch (err: any) {
      console.error("Error deleting book:", err)
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi xóa sách.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setBookToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setBookToDelete(null)
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
                { value: "1", label: "Hoạt động" },
                { value: "0", label: "Tạm khóa" }
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

          <Button onClick={handleResetFilters} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Đặt lại"
            )}
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="min-w-[280px]">Sách</TableHead>
                <TableHead className="w-[120px] hidden md:table-cell">Tác giả</TableHead>
                <TableHead className="w-[100px] hidden lg:table-cell">Danh mục</TableHead>
                <TableHead className="w-[100px]">Phê duyệt</TableHead>
                <TableHead className="w-[80px]">Loại</TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">Đánh giá</TableHead>
                <TableHead className="w-[80px] hidden lg:table-cell">Lượt xem</TableHead>
                <TableHead className="w-[80px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : bookList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="text-muted-foreground">
                    <span>Không có dữ liệu sách</span>
                  </div>
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
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap" title={book.title}>
                          {book.title}
                        </div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {book.author}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium hidden md:table-cell">
                    {book.author}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{book.category_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        book.approval_status === 1 ? "default" : 
                        book.approval_status === 2 ? "destructive" : "secondary"
                      }
                      className="whitespace-nowrap"
                    >
                      {book.approval_status === 0 ? "Chờ duyệt" : 
                       book.approval_status === 1 ? "Đã duyệt" : 
                       "Từ chối"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={book.is_premium ? "default" : "secondary"} className="whitespace-nowrap">
                      {book.is_premium ? "Trả phí" : "Miễn phí"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{formatRating(book.average_rating)}</span>
                      <span className="text-sm text-muted-foreground">({book.total_ratings})</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="font-mono text-sm">
                      {book.total_views.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewBook(book.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditBook(book.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <BookStatusTrigger
                          bookId={book.id}
                          bookTitle={book.title}
                          currentBookStatus={book.status}
                          currentApprovalStatus={book.approval_status}
                          currentPremium={book.is_premium}
                          onSuccess={() => fetchBookList({ pageNumber, pageSize: 10, sortBy: sortBy as any, isAscending })}
                        />
                        {isAdmin && (
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDeleteBook(book)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa sách
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>
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

      {/* Chi tiết sách - BookDetailModal */}
      {selectedBookId && (
        <BookDetailModal
          bookId={selectedBookId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Chỉnh sửa sách - UpdateBookModal */}
      {selectedBookForEdit && (
        <UpdateBookModal
          bookData={selectedBookForEdit}
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open)
            if (!open) {
              handleCloseEditModal()
            }
          }}
          onSuccess={() => {
            handleCloseEditModal()
            fetchBookList({ pageNumber, pageSize: 10, sortBy: sortBy as any, isAscending })
          }}
        />
      )}

      {/* Xác nhận xóa sách */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Xác nhận xóa sách
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="space-y-2">
                <p>
                  Bạn có chắc chắn muốn xóa sách sau không?
                </p>
                <div className="bg-gray-50 border rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-gray-900">"{bookToDelete?.title}"</p>
                  <p className="text-sm text-gray-600">Tác giả: {bookToDelete?.author}</p>
                  <p className="text-sm text-gray-600">ID: {getShortId(bookToDelete?.id || "")}</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-lg leading-none">⚠️</span>
                  <div className="space-y-1">
                    <p className="text-red-800 text-sm font-medium">
                      Hành động này không thể hoàn tác!
                    </p>
                    <p className="text-red-700 text-xs">
                      Sẽ xóa tất cả dữ liệu liên quan: chapters, files, cover images
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={handleCancelDelete} 
              disabled={isDeleting}
              className="font-medium"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 font-medium"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa sách
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
