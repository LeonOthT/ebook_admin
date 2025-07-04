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
import { categoriesApi, type BookCategory } from "@/lib/api/categories"

interface CreateBookModalProps {
  onSuccess?: () => void
}

export default function CreateBookModal({ onSuccess }: CreateBookModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<BookCategory[]>([])
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

  const { access_token } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  console.log("CreateBookModal rendered, open:", open)

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Book Dialog open change:", newOpen)
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  const handleButtonClick = () => {
    console.log("Book Button clicked!")
    setOpen(true)
  }

  // Load categories khi mở modal
  useEffect(() => {
    if (open && access_token) {
      console.log("Loading categories...")
      loadCategories()
    }
  }, [open, access_token])

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getList({}, access_token!)
      console.log("Categories loaded:", response.data)
      setCategories(response.data)
    } catch (err) {
      console.error("Failed to load categories:", err)
      setError("Không thể tải danh sách danh mục")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log("File selected:", file?.name)

    if (file) {
      // Kiểm tra định dạng file
      const allowedTypes = [".pdf", ".epub", ".docx", ".txt"]
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        setError("Chỉ hỗ trợ file PDF, EPUB, DOCX, TXT")
        return
      }

      // Kiểm tra kích thước file (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 50MB")
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Book Form submitted")
    console.log("Form data:", formData)
    console.log("Selected file:", selectedFile?.name)

    if (!access_token || !selectedFile) {
      console.log("Missing token or file")
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
        is_premium: formData.is_premium,
        tags: formData.tags || undefined,
        published_date: formData.published_date || undefined,
      }

      console.log("Sending request:", requestData)
      const result = await booksApi.create(requestData, access_token)
      console.log("Book created successfully:", result)

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
      console.error("Book creation error:", err)
      
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
                placeholder="Chọn danh mục"
                disabled={isLoading}
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name
                }))}
              />
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

            {/* Premium Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                disabled={isLoading}
              />
              <Label htmlFor="is_premium">Sách Premium (có phí)</Label>
            </div>
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
