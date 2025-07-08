"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, Eye, Edit, Trash2, Loader2, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/lib/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { booksApi, type Book, type BookListParams, type BookDetailResponse } from "@/lib/api/books"
import { useBookCategories } from "@/lib/hooks/use-reference-data"
import CreateBookModal from "./create-book-modal"
import UpdateBookModal from "./update-book-modal"
import BookDetailModal from "./book-detail-modal"
import BookStatusModal, { useBookStatusModal } from "./book-status-modal"
import { useConfirmModal } from "@/components/ui/confirm-modal"

// Tách options ra khỏi component để tránh re-render
const FILTER_OPTIONS = {
  approval: [
    { value: "0", label: "Chờ duyệt" },
    { value: "1", label: "Đã duyệt" },
    { value: "2", label: "Từ chối" }
  ],
  status: [
    { value: "1", label: "Hoạt động" },
    { value: "0", label: "Tạm khóa" }
  ],
  premium: [
    { value: "premium", label: "Premium" },
    { value: "free", label: "Miễn phí" }
  ],
  sort: [
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
  ]
}

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
  const [mounted, setMounted] = useState(false)

  // Book status modal
  const bookStatusModal = useBookStatusModal()

  // Sử dụng reference API cho categories với auto-load (cần cho filter ngay)
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useBookCategories(true)

  const { access_token, user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  // Kiểm tra quyền Admin
  const isAdmin = user?.app_role?.includes("Admin") || false

  const fetchBookList = async (params: BookListParams = {}) => {
    if (!access_token || !mounted) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await booksApi.getList(params)
      setBookList(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setPageNumber(response.pageNumber)
    } catch (err: any) {
      console.error("Error fetching book list:", err)
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

  // Initial mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initial fetch and filter changes
  useEffect(() => {
    if (!mounted) return

    const params: BookListParams = {
      pageNumber,
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

    const timeoutId = setTimeout(() => {
      fetchBookList(params)
    }, searchQuery.trim() ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, categoryFilter, approvalStatusFilter, statusFilter, premiumFilter, sortBy, isAscending, pageNumber, mounted])

  const handleResetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("")
    setApprovalStatusFilter("")
    setStatusFilter("")
    setPremiumFilter("")
    setSortBy("createdat")
    setIsAscending(false)
    setPageNumber(1)
  }

  const handleViewBook = (bookId: string) => {
    setSelectedBookId(bookId)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedBookId(null)
  }

  const handleEditBook = async (bookId: string): Promise<void> => {
    if (!access_token) return

    try {
      const bookDetail = await booksApi.getDetail(bookId)
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

    const confirmModal = useConfirmModal.getState()
    confirmModal.open({
      title: "Xác nhận xóa sách",
      description: "Bạn có chắc chắn muốn xóa sách sau không?",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-3 space-y-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">"{book.title}"</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tác giả: {book.author}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">ID: {getShortId(book.id)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 text-lg leading-none">⚠️</span>
              <div className="space-y-1">
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                  Hành động này không thể hoàn tác!
                </p>
                <p className="text-red-700 dark:text-red-300 text-xs">
                  Sẽ xóa tất cả dữ liệu liên quan: chapters, files, cover images
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      confirmText: "Xóa sách",
      confirmVariant: "destructive",
      onConfirm: async () => {
        if (!access_token) return

        try {
          await booksApi.delete(book.id)
          
          toast({
            title: "Thành công!",
            description: `Đã xóa sách "${book.title}" thành công.`,
            variant: "default",
          })

          // Refresh the book list
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
          if (premiumFilter) params.isPremium = premiumFilter === "premium"

          await fetchBookList(params)
        } catch (err: any) {
          console.error("Error deleting book:", err)
          toast({
            title: "Lỗi!",
            description: err.message || "Có lỗi xảy ra khi xóa sách.",
            variant: "destructive",
          })
          throw err // Re-throw to keep modal in loading state
        }
      }
    })
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
        <CreateBookModal 
          onSuccess={() => {
            const params = {
              pageNumber,
              pageSize: 10,
              sortBy: sortBy as any,
              isAscending,
            }
            fetchBookList(params)
          }} 
        />
      </div>

      {/* Filters */}
      {mounted && (
        <div className="flex flex-col gap-4 sticky top-0 bg-background z-10 pb-4 border-b">
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề, tác giả, ISBN, nhà xuất bản, tags..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </div>

            <SimpleSelect
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              placeholder="Danh mục"
              className="w-[130px] shrink-0"
              options={categories}
            />

            <SimpleSelect
              value={approvalStatusFilter}
              onValueChange={setApprovalStatusFilter}
              placeholder="Phê duyệt"
              className="w-[130px] shrink-0"
              options={FILTER_OPTIONS.approval}
            />

            <SimpleSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Trạng thái"
              className="w-[130px] shrink-0"
              options={FILTER_OPTIONS.status}
            />

            <SimpleSelect
              value={premiumFilter}
              onValueChange={setPremiumFilter}
              placeholder="Loại"
              className="w-[130px] shrink-0"
              options={FILTER_OPTIONS.premium}
            />

            <SimpleSelect
              value={`${sortBy}-${isAscending ? 'asc' : 'desc'}`}
              onValueChange={(value) => {
                const [field, direction] = value.split('-')
                setSortBy(field)
                setIsAscending(direction === 'asc')
              }}
              placeholder="Sắp xếp"
              className="w-[130px] shrink-0"
              options={FILTER_OPTIONS.sort}
            />

            <Button 
              onClick={handleResetFilters} 
              variant="outline" 
              size="default"
              className="shrink-0"
            >
              Đặt lại
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
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
                  <TableCell colSpan={9} className="h-24">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : bookList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24">
                    <div className="flex items-center justify-center text-muted-foreground">
                      Không có dữ liệu sách
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
                          <DropdownMenuItem onClick={() => bookStatusModal.openModal({
                            bookId: book.id,
                            bookTitle: book.title,
                            currentBookStatus: book.status,
                            currentApprovalStatus: book.approval_status,
                            currentPremium: book.is_premium,
                          })}>
                            <Settings className="mr-2 h-4 w-4" />
                            Quản lý trạng thái
                          </DropdownMenuItem>
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

      {/* Pagination */}
      {mounted && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {bookList.length} trong tổng số {totalCount} sách
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
              disabled={pageNumber <= 1 || isLoading}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {pageNumber} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
              disabled={pageNumber >= totalPages || isLoading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedBookId && (
        <BookDetailModal
          bookId={selectedBookId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}

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

      {bookStatusModal.bookData && (
        <BookStatusModal
          bookId={bookStatusModal.bookData.bookId}
          bookTitle={bookStatusModal.bookData.bookTitle}
          currentBookStatus={bookStatusModal.bookData.currentBookStatus}
          currentApprovalStatus={bookStatusModal.bookData.currentApprovalStatus}
          currentPremium={bookStatusModal.bookData.currentPremium}
          open={bookStatusModal.isOpen}
          onOpenChange={bookStatusModal.closeModal}
          onSuccess={() => {
            bookStatusModal.closeModal()
            fetchBookList({ pageNumber, pageSize: 10, sortBy: sortBy as any, isAscending })
          }}
        >
          {/* No trigger needed - controlled externally */}
          <div />
        </BookStatusModal>
      )}
    </div>
  )
}
