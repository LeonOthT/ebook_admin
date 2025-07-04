"use client"

import type React from "react"
import { useState } from "react"
import { CheckCircle, XCircle, Loader2, Settings } from "lucide-react"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SimpleSelect } from "@/components/ui/simple-select"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppSelector } from "@/lib/hooks"
import { booksApi, type BookStatusRequest } from "@/lib/api/books"

interface BookStatusModalProps {
  bookId: string
  bookTitle: string
  currentStatus?: number
  currentPremium?: boolean
  onSuccess?: () => void
  children: React.ReactNode
}

export default function BookStatusModal({
  bookId,
  bookTitle,
  currentStatus,
  currentPremium,
  onSuccess,
  children,
}: BookStatusModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<BookStatusRequest>({
    approval_status: currentStatus as 0 | 1 | 2,
    approval_note: "",
    is_premium: currentPremium,
  })

  const { access_token, user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()
  const isAdmin = user?.app_role.includes("Admin")

  console.log("BookStatusModal rendered for book:", bookId, bookTitle)

  const handleOpenChange = (newOpen: boolean) => {
    console.log("BookStatus Dialog open change:", newOpen)
    setOpen(newOpen)
    if (!newOpen) {
      setError(null)
      setFormData({
        approval_status: currentStatus as 0 | 1 | 2,
        approval_note: "",
        is_premium: currentPremium,
      })
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Chờ duyệt"
      case 1:
        return "Đã duyệt"
      case 2:
        return "Từ chối"
      default:
        return "Không xác định"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("BookStatus Form submitted")
    console.log("Form data:", formData)

    if (!access_token) {
      console.log("Missing access token")
      return
    }

    // Validate: Ghi chú bắt buộc khi từ chối
    if (formData.approval_status === 2 && !formData.approval_note?.trim()) {
      setError("Ghi chú phê duyệt là bắt buộc khi từ chối sách")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Updating book status for book ID:", bookId)
      const result = await booksApi.updateStatus(bookId, formData, access_token)
      console.log("Book status updated successfully:", result)

      // Show success toast
      toast({
        title: "Thành công!",
        description: "Trạng thái sách đã được cập nhật thành công.",
        variant: "default",
      })

      setOpen(false)
      onSuccess?.()
    } catch (err: any) {
      console.error("Book status update error:", err)
      
      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi cập nhật trạng thái sách.",
        variant: "destructive",
      })
      
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quản lý trạng thái sách</DialogTitle>
          <DialogDescription>
            Cập nhật trạng thái phê duyệt và premium cho: <strong>{bookTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isAdmin && (
              <Alert>
                <AlertDescription>
                  Bạn chỉ có thể xem thông tin. Chỉ Admin mới có quyền phê duyệt sách.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="approval_status">Trạng thái phê duyệt</Label>
              <SimpleSelect
                value={formData.approval_status?.toString() || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, approval_status: Number.parseInt(value) as 0 | 1 | 2 })
                }
                placeholder="Chọn trạng thái"
                disabled={isLoading || !isAdmin}
                options={[
                  { value: "0", label: "🟡 Chờ duyệt" },
                  { value: "1", label: "✅ Đã duyệt" },
                  { value: "2", label: "❌ Từ chối" }
                ]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="approval_note">
                Ghi chú phê duyệt {formData.approval_status === 2 && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="approval_note"
                value={formData.approval_note}
                onChange={(e) => setFormData({ ...formData, approval_note: e.target.value })}
                placeholder={
                  formData.approval_status === 2
                    ? "Vui lòng nhập lý do từ chối..."
                    : "Ghi chú về quyết định phê duyệt..."
                }
                disabled={isLoading || !isAdmin}
                rows={3}
                required={formData.approval_status === 2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                disabled={isLoading || !isAdmin}
              />
              <Label htmlFor="is_premium">Sách Premium (có phí)</Label>
            </div>

            {/* Hiển thị thông tin hiện tại */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Trạng thái hiện tại:</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Phê duyệt:</span> {getStatusText(currentStatus || 0)}
                </p>
                <p>
                  <span className="font-medium">Premium:</span> {currentPremium ? "Có" : "Không"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            {isAdmin && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật trạng thái"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Thay vì wrap DropdownMenuItem, tạo một trigger riêng
export function BookStatusTrigger({
  bookId,
  bookTitle,
  currentStatus,
  currentPremium,
  onSuccess,
}: {
  bookId: string
  bookTitle: string
  currentStatus?: number
  currentPremium?: boolean
  onSuccess?: () => void
}) {
  const handleClick = () => {
    console.log("BookStatusTrigger clicked for book:", bookId)
  }

  return (
    <BookStatusModal
      bookId={bookId}
      bookTitle={bookTitle}
      currentStatus={currentStatus}
      currentPremium={currentPremium}
      onSuccess={onSuccess}
    >
      <div
        className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
        onClick={handleClick}
      >
        <Settings className="mr-2 h-4 w-4" />
        Quản lý trạng thái
      </div>
    </BookStatusModal>
  )
}
