"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Upload, FileText, Loader2 } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"
import { useToast } from "@/lib/hooks/use-toast"
import { useBookCategories } from "@/lib/hooks/use-reference-data"
import { booksApi, type CreateBookRequest, type BookDetailResponse } from "@/lib/api/books"
import { devLog } from "@/lib/config"

interface BookFormData {
  // Core fields always present
  category_id: string
  is_premium: boolean
  tags: string
  isbn: string
  
  // Update-only fields (not used in create)
  title?: string
  description?: string
  author?: string
  publisher?: string
  published_date?: string
  // Note: status, approval_status, and is_premium for status changes are handled by the dedicated status modal
}

interface BookFormModalProps {
  mode: 'create' | 'update'
  bookData?: BookDetailResponse // For update mode
  trigger?: React.ReactNode // Custom trigger component
  open?: boolean // External control of open state
  onOpenChange?: (open: boolean) => void // External control callback
  onSuccess?: () => void
}

export default function BookFormModal({ mode, bookData, trigger, open: externalOpen, onOpenChange: externalOnOpenChange, onSuccess }: BookFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen
  const [formData, setFormData] = useState<BookFormData>({
    category_id: "",
    is_premium: false,
    tags: "",
    isbn: "",
  })

  // Load categories with cache
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useBookCategories(false)
  const { access_token, user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  // Check if user is Admin
  const isAdmin = user?.app_role?.includes('Admin') || false
  const isCreate = mode === 'create'
  const isUpdate = mode === 'update'

  // Initialize form data for update mode
  useEffect(() => {
    if (isUpdate && bookData && open) {
      setFormData({
        category_id: bookData.category_id || "",
        is_premium: bookData.is_premium || false,
        tags: bookData.tags || "",
        isbn: bookData.isbn || "",
        title: bookData.title || "",
        description: bookData.description || "",
        author: bookData.author || "",
        publisher: bookData.publisher || "",
        published_date: bookData.published_date ? new Date(bookData.published_date).toISOString().split('T')[0] : "",
      })
    } else if (isCreate) {
      // Reset form for create mode
      setFormData({
        category_id: "",
        is_premium: false,
        tags: "",
        isbn: "",
      })
    }
  }, [isUpdate, bookData, open, isCreate])

  // Show category errors
  useEffect(() => {
    if (categoriesError) {
      devLog("Categories error:", categoriesError)
      toast({
        title: "Lỗi!",
        description: categoriesError,
        variant: "destructive",
      })
    }
  }, [categoriesError, toast])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      // Check if file is EPUB
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (fileExtension !== ".epub") {
        const errorMsg = "Hệ thống chỉ hỗ trợ file EPUB"
        setError(errorMsg)
        toast({
          title: "Lỗi!",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // Check file size (500MB)
      if (file.size > 500 * 1024 * 1024) {
        const errorMsg = "Kích thước file không được vượt quá 500MB"
        setError(errorMsg)
        toast({
          title: "Lỗi!",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setError(null)
      
      devLog("EPUB file selected successfully:", { 
        name: file.name, 
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!access_token) {
      toast({
        title: "Lỗi!",
        description: "Thiếu thông tin xác thực",
        variant: "destructive",
      })
      return
    }

    // Validation
    if (isCreate && !selectedFile) {
      toast({
        title: "Lỗi!",
        description: "File EPUB là bắt buộc khi tạo sách mới",
        variant: "destructive",
      })
      return
    }
    
    if (!formData.category_id) {
      toast({
        title: "Lỗi!",
        description: "Danh mục sách là bắt buộc",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isCreate) {
        // Create mode
        const requestData: CreateBookRequest = {
          file: selectedFile!,
          category_id: formData.category_id,
          is_premium: isAdmin ? formData.is_premium : false,
          tags: formData.tags || undefined,
          isbn: formData.isbn || undefined,
        }

        const result = await booksApi.create(requestData)
        
        toast({
          title: "Thành công!",
          description: "Sách đã được tạo thành công. Metadata đã được tự động trích xuất từ file EPUB.",
          variant: "default",
        })
      } else {
        // Update mode
        const updateData = new FormData()
        
        // Add changed fields only
        if (formData.title && formData.title !== bookData?.title) {
          updateData.append("title", formData.title)
        }
        if (formData.description && formData.description !== bookData?.description) {
          updateData.append("description", formData.description)
        }
        if (formData.author && formData.author !== bookData?.author) {
          updateData.append("author", formData.author)
        }
        if (formData.isbn && formData.isbn !== bookData?.isbn) {
          updateData.append("isbn", formData.isbn)
        }
        if (formData.publisher && formData.publisher !== bookData?.publisher) {
          updateData.append("publisher", formData.publisher)
        }
        if (formData.category_id && formData.category_id !== bookData?.category_id) {
          updateData.append("category_id", formData.category_id)
        }
        if (formData.tags !== bookData?.tags) {
          updateData.append("tags", formData.tags || "")
        }
        if (formData.published_date) {
          const newDate = new Date(formData.published_date).toISOString()
          const existingDate = bookData?.published_date ? new Date(bookData.published_date).toISOString() : ""
          if (newDate !== existingDate) {
            updateData.append("published_date", newDate)
          }
        }
        
        // Note: Status changes (book status, approval status, premium status) are handled 
        // by the dedicated BookStatusModal component and updateStatus API endpoint
        
        // Add file if selected
        if (selectedFile) {
          updateData.append("file", selectedFile)
        }

        const result = await booksApi.update(bookData!.id, updateData)
        
        const hasNewEpub = selectedFile && selectedFile.name.toLowerCase().endsWith('.epub')
        const successMessage = hasNewEpub 
          ? "Sách đã được cập nhật thành công. Metadata đã được tự động trích xuất từ file EPUB mới."
          : "Sách đã được cập nhật thành công."
        
        toast({
          title: "Thành công!",
          description: successMessage,
          variant: "default",
        })
      }

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (err: any) {
      devLog("Book operation error:", err.message)

      toast({
        title: "Lỗi!",
        description: err.message || `Có lỗi xảy ra khi ${isCreate ? 'tạo' : 'cập nhật'} sách.`,
        variant: "destructive",
      })

      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    if (isCreate) {
      setFormData({
        category_id: "",
        is_premium: false,
        tags: "",
        isbn: "",
      })
    }
    setSelectedFile(null)
    setError(null)
  }

  const defaultTrigger = isCreate ? (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Thêm sách mới
    </Button>
  ) : (
    <Button variant="outline" size="sm">
      <Edit className="mr-2 h-4 w-4" />
      Chỉnh sửa
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Tạo sách mới từ EPUB" : "Chỉnh sửa thông tin sách"}
          </DialogTitle>
          <DialogDescription>
            {isCreate 
              ? "Upload file EPUB để tạo sách mới. Metadata (tiêu đề, tác giả, nhà xuất bản, ảnh bìa) sẽ được tự động trích xuất từ file. ISBN có thể nhập thủ công nếu cần."
              : "Chỉnh sửa thông tin sách. Nếu upload file EPUB mới, metadata sẽ được tự động trích xuất và cập nhật."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="file">
              {isCreate ? "File EPUB (bắt buộc)" : "File EPUB mới (tùy chọn)"}
            </Label>
            <div className="mt-2">
              <Input
                id="file"
                type="file"
                accept=".epub"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  <FileText className="inline w-4 h-4 mr-1" />
                  {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isCreate 
                ? "File EPUB sẽ được phân tích để trích xuất metadata tự động."
                : "Upload file EPUB mới sẽ thay thế file hiện tại và trích xuất metadata mới."
              }
            </p>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Danh mục sách (bắt buộc)</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục sách" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Update-only fields */}
          {isUpdate && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nhập tiêu đề sách"
                  />
                </div>
                <div>
                  <Label htmlFor="author">Tác giả</Label>
                  <Input
                    id="author"
                    value={formData.author || ""}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nhập tên tác giả"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả sách"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publisher">Nhà xuất bản</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher || ""}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Nhập nhà xuất bản"
                  />
                </div>
                <div>
                  <Label htmlFor="published_date">Ngày xuất bản</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date || ""}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Note: Book status, approval status, and premium status changes are handled 
                   by the dedicated BookStatusModal component for proper role separation */}
            </>
          )}

          {/* Common fields */}
          <div>
            <Label htmlFor="isbn">ISBN (tùy chọn)</Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="Nhập mã ISBN nếu có"
              maxLength={20}
            />
            <p className="text-sm text-muted-foreground mt-1">
              ISBN sẽ được tự động trích xuất từ EPUB nếu có. Bạn có thể nhập thủ công nếu file không chứa thông tin này.
            </p>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Nhập tags, phân cách bằng dấu phẩy"
              maxLength={500}
            />
          </div>

          {/* Admin-only premium switch - only for create mode */}
          {isAdmin && isCreate && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                />
                <Label htmlFor="is_premium">Sách Premium (có phí)</Label>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || categoriesLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreate ? "Đang tạo..." : "Đang cập nhật..."}
                </>
              ) : (
                <>
                  {isCreate ? (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo sách
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Cập nhật
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
