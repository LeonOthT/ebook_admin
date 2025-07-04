"use client"

import type React from "react"
import { useState } from "react"
import { UserPlus, Loader2 } from "lucide-react"

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
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/hooks"
import { staffApi, type CreateStaffRequest } from "@/lib/api/staff"

interface CreateStaffModalProps {
  onSuccess?: () => void
}

export default function CreateStaffModal({ onSuccess }: CreateStaffModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateStaffRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    position: 2,
    staff_code: "",
  })

  const { access_token } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  console.log("CreateStaffModal rendered, open:", open)

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Staff Dialog open change:", newOpen)
    setOpen(newOpen)
  }

  const handleButtonClick = () => {
    console.log("Staff Button clicked!")
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Staff Form submitted")
    if (!access_token) return

    setIsLoading(true)
    setError(null)

    try {
      await staffApi.create(formData, access_token)
      
      // Show success toast
      toast({
        title: "Thành công!",
        description: "Nhân viên đã được tạo thành công.",
        variant: "default",
      })
      
      setOpen(false)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        position: 2,
        staff_code: "",
      })
      onSuccess?.()
    } catch (err: any) {
      console.error("Error creating staff:", err)
      
      // Show error toast
      toast({
        title: "Lỗi!",
        description: err.message || "Có lỗi xảy ra khi tạo nhân viên.",
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
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo nhân viên mới</DialogTitle>
          <DialogDescription>Thêm nhân viên mới vào hệ thống quản trị</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">Họ *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Nguyễn"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Tên *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Văn A"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@booklify.com"
                required
                disabled={isLoading}
              />
            </div>

             <div className="grid gap-2">
              <Label htmlFor="email">staff_code *</Label>
              <Input
                id="staff_code"
                type="string"
                value={formData.staff_code}
                onChange={(e) => setFormData({ ...formData, staff_code: e.target.value })}
                placeholder="S001"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Staff@123"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Chức vụ *</Label>
              <SimpleSelect
                value={formData.position.toString()}
                onValueChange={(value) => setFormData({ ...formData, position: Number.parseInt(value) as 2 | 4 })}
                placeholder="Chọn chức vụ"
                options={[
                  { value: "2", label: "Staff" },
                  { value: "4", label: "Library Manager" }
                ]}
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
                "Tạo nhân viên"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
