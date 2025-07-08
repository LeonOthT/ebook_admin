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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAppSelector } from "@/lib/hooks"
import { booksApi, type BookStatusRequest } from "@/lib/api/books"

interface BookStatusModalProps {
  bookId: string
  bookTitle: string
  currentBookStatus?: number // 0: Inactive, 1: Active
  currentApprovalStatus?: number // 0: Pending, 1: Approved, 2: Rejected
  currentPremium?: boolean
  open?: boolean // External control of open state
  onOpenChange?: (open: boolean) => void // External control callback
  onSuccess?: () => void
  children: React.ReactNode
}

export default function BookStatusModal({
  bookId,
  bookTitle,
  currentBookStatus,
  currentApprovalStatus,
  currentPremium,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
  children,
}: BookStatusModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<BookStatusRequest>({
    status: currentBookStatus as 0 | 1,
    approval_status: currentApprovalStatus as 0 | 1 | 2,
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
        status: currentBookStatus as 0 | 1,
        approval_status: currentApprovalStatus as 0 | 1 | 2,
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
              const result = await booksApi.updateStatus(bookId, formData)
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
              <Select
                value={formData.approval_status?.toString() || ""}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, approval_status: Number.parseInt(value) as 0 | 1 | 2 })
                }
                disabled={isLoading || !isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Chờ duyệt</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Đã duyệt</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Từ chối</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book_status">Trạng thái sách</Label>
              <Select
                value={formData.status?.toString() || ""}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, status: Number.parseInt(value) as 0 | 1 })
                }
                disabled={isLoading || !isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Hoạt động</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Không hoạt động</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Trạng thái hiện tại:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sách:</span>
                  <Badge variant={currentBookStatus === 1 ? "default" : "destructive"}>
                    {currentBookStatus === 1 ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phê duyệt:</span>
                  <Badge 
                    variant={
                      currentApprovalStatus === 1 ? "default" : 
                      currentApprovalStatus === 2 ? "destructive" : "secondary"
                    }
                  >
                    {getStatusText(currentApprovalStatus || 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium:</span>
                  <Badge variant={currentPremium ? "default" : "outline"}>
                    {currentPremium ? "Có" : "Không"}
                  </Badge>
                </div>
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
// Hook để quản lý BookStatusModal giống pattern của các modal khác
export function useBookStatusModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [bookData, setBookData] = useState<{
    bookId: string
    bookTitle: string
    currentBookStatus?: number
    currentApprovalStatus?: number
    currentPremium?: boolean
  } | null>(null)

  const openModal = (data: {
  bookId: string
  bookTitle: string
  currentBookStatus?: number
  currentApprovalStatus?: number
  currentPremium?: boolean
  }) => {
    setBookData(data)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setBookData(null)
  }

  return {
    isOpen,
    bookData,
    openModal,
    closeModal,
  }
}

