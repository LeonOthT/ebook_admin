"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { categoriesApi, type CreateCategoryRequest } from "@/lib/api/categories"

interface CreateCategoryModalProps {
  onSuccess?: () => void
}

export default function CreateCategoryModal({ onSuccess }: CreateCategoryModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
  })

  const { access_token } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  console.log("CreateCategoryModal rendered, open:", open)

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Dialog open change:", newOpen)
    setOpen(newOpen)
  }

  const handleButtonClick = () => {
    console.log("Button clicked!")
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    if (!access_token) return

    setIsLoading(true)
    setError(null)

    try {
      await categoriesApi.create(formData, access_token)
      
      // Show success toast
      toast({
        title: "Thành công!",
        description: "Danh mục đã được tạo thành công.",
        variant: "default",
      })
      
      setOpen(false)
      setFormData({ name: "", description: "" })
      onSuccess?.()
    } catch (err: any) {
      console.error("Error creating category:", err)
      
      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tạo danh mục.",
        variant: "destructive",
      })
      
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={handleButtonClick}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo danh mục sách mới</DialogTitle>
          <DialogDescription>Thêm danh mục mới để phân loại sách trong thư viện</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Tiểu thuyết"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về danh mục này..."
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo danh mục"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
