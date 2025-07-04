"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { booksApi, type CreateBookRequest } from "@/lib/api/books"
import { useBookCategories } from "@/hooks/use-reference-data"
import { devLog } from "@/lib/config"


interface CreateBookModalProps {
  onSuccess?: () => void
}

export default function CreateBookModal({ onSuccess }: CreateBookModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    isbn: "",
    publisher: "",
    category_id: "",
    is_premium: false,
    tags: "",
    published_date: "",
  })

  // Sử dụng hook với lazy loading để tránh load categories khi không cần (autoLoad = false)
  const { categories, isLoading: categoriesLoading, error: categoriesError, hasLoaded, loadCategories } = useBookCategories(false)

  const { access_token, user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  // Check if user is Admin (có quyền chỉnh sửa premium)
  const isAdmin = user?.app_role?.includes('Admin') || false
  devLog("User role check:", { roles: user?.app_role, isAdmin })

  devLog("CreateBookModal rendered, open:", open)
  devLog("Categories available:", categories.length)
  devLog("Categories loading:", categoriesLoading)
  devLog("Categories has loaded:", hasLoaded)

  // Debug: Log categories mỗi khi thay đổi
  useEffect(() => {
    devLog("Categories changed:", { count: categories.length, categories })
  }, [categories])

  // Hiển thị lỗi categories nếu có
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
    devLog("Book Dialog open change:", newOpen)
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
    // Không cần load categories nữa vì đã có global cache từ Book Management
    if (newOpen) {
      devLog("Modal opened, categories from global cache:", { count: categories.length, hasLoaded })
    }
  }

  const handleButtonClick = () => {
    devLog("Book Button clicked!")
    setOpen(true)
    // Không cần load categories nữa vì đã có global cache từ Book Management
  }

  // Load categories khi mở modal - KHÔNG CẦN NỮA vì đã dùng useBookCategories hook
  // useEffect(() => {
  //   if (open) {
  //     devLog("Loading categories...")
  //     loadCategories()
  //   }
  // }, [open])

  // const loadCategories = async () => {
  //   try {
  //     const options = await categoriesApi.getForDropdown()
  //     devLog("Categories loaded:", options.length)
  //     setCategories(options)
  //   } catch (err: any) {
  //     devLog("Failed to load categories:", err.message)
  //     setError("Không thể tải danh sách danh mục")

  //     // Show error toast
  //     toast({
  //       title: "Lỗi!",
  //       description: "Không thể tải danh sách danh mục",
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    devLog("File selected:", file?.name)

    if (file) {
      // Kiểm tra định dạng file
      const allowedTypes = [".pdf", ".epub", ".docx", ".txt"]
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        const errorMsg = "Chỉ hỗ trợ file PDF, EPUB, DOCX, TXT"
        setError(errorMsg)
        toast({
          title: "Lỗi!",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // Kiểm tra kích thước file (50MB)
      if (file.size > 50 * 1024 * 1024) {
        const errorMsg = "Kích thước file không được vượt quá 50MB"
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
      devLog("File selected successfully:", { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)}MB` })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    devLog("Book Form submitted")
    devLog("Form data:", formData)
    devLog("Selected file:", selectedFile?.name)

    if (!access_token || !selectedFile) {
      devLog("Missing token or file")
      toast({
        title: "Lỗi!",
        description: "Thiếu thông tin xác thực hoặc file sách",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const requestData: CreateBookRequest = {
        file: selectedFile,
        title: formData.title,
        author: formData.author,
        category_id: formData.category_id,
        description: formData.description || undefined,
        isbn: formData.isbn || undefined,
        publisher: formData.publisher || undefined,
        is_premium: isAdmin ? formData.is_premium : false, // Staff always sends false
        tags: formData.tags || undefined,
        published_date: formData.published_date || undefined,
      }

      devLog("Sending request:", {
        title: requestData.title,
        author: requestData.author,
        category_id: requestData.category_id,
        is_premium: requestData.is_premium,
        userRole: user?.app_role,
        isAdmin
      })
      const result = await booksApi.create(requestData, access_token)
      devLog("Book created successfully:", result)

      // Show success toast
      toast({
        title: "Thành công!",
        description: "Sách đã được tạo thành công.",
        variant: "default",
      })

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (err: any) {
      devLog("Book creation error:", err.message)

      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tạo sách.",
        variant: "destructive",
      })

      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      author: "",
      isbn: "",
      publisher: "",
      category_id: "",
      is_premium: false,
      tags: "",
      published_date: "",
    })
    setSelectedFile(null)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={handleButtonClick}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm sách mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo sách mới</DialogTitle>
          <DialogDescription>
            Thêm sách mới vào thư viện. Hỗ trợ định dạng: PDF, EPUB, DOCX, TXT (tối đa 50MB)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Upload */}
            <div className="grid gap-2">
              <Label htmlFor="file">File sách *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.epub,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file")?.click()}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : "Chọn file sách"}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề sách *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề sách"
                required
                disabled={isLoading}
              />
            </div>

            {/* Author */}
            <div className="grid gap-2">
              <Label htmlFor="author">Tác giả *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nhập tên tác giả"
                required
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục *</Label>
              <SimpleSelect
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                placeholder={
                  categoriesLoading ? "Đang tải danh mục..." :
                    categories.length === 0 && hasLoaded ? "Không có danh mục" :
                      "Chọn danh mục"
                }
                disabled={isLoading || categoriesLoading}
                options={categories}
              />
              {categoriesError && (
                <p className="text-sm text-red-500">Lỗi: {categoriesError}</p>
              )}
              {hasLoaded && categories.length === 0 && !categoriesError && (
                <p className="text-sm text-yellow-600">Không có danh mục khả dụng</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về cuốn sách..."
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* ISBN */}
            <div className="grid gap-2">
              <Label htmlFor="isbn">Mã ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="Nhập mã ISBN"
                disabled={isLoading}
              />
            </div>

            {/* Publisher */}
            <div className="grid gap-2">
              <Label htmlFor="publisher">Nhà xuất bản</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Nhập tên nhà xuất bản"
                disabled={isLoading}
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Thẻ tag</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Phân cách bằng dấu phẩy: tag1, tag2, tag3"
                disabled={isLoading}
              />
            </div>

            {/* Published Date */}
            <div className="grid gap-2">
              <Label htmlFor="published_date">Ngày xuất bản</Label>
              <Input
                id="published_date"
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Premium Switch - Only visible for Admin */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                  disabled={isLoading}
                />
                <Label htmlFor="is_premium">Sách Premium (có phí)</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedFile || !formData.title || !formData.author || !formData.category_id}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo sách"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
