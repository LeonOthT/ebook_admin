"use client"

import { Search, Plus, Filter, Eye, Edit, Crown, Trash2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CreateStaffModal from "@/components/admin/create-staff-modal"
import { useAppSelector } from "@/lib/hooks"

const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    role: "Premium",
    status: "Hoạt động",
    joinDate: "2024-01-15",
  },
  { id: 2, name: "Trần Thị B", email: "tranthib@email.com", role: "Free", status: "Hoạt động", joinDate: "2024-02-20" },
  { id: 3, name: "Lê Văn C", email: "levanc@email.com", role: "Premium", status: "Tạm khóa", joinDate: "2024-03-10" },
]

export default function UsersPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = user?.app_role?.includes("Admin") || false

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Không có quyền truy cập</h3>
          <p className="text-muted-foreground">Bạn không có quyền truy cập chức năng này</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Xem, khóa, nâng cấp Premium cho người dùng</p>
        </div>
        <div className="flex space-x-2">
          <CreateStaffModal onSuccess={() => console.log("Staff created successfully")} />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm người dùng..." className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Lọc
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Loại tài khoản</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "Premium" ? "default" : "secondary"}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "Hoạt động" ? "default" : "destructive"}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <Menu className="h-4 w-4" />
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
                      <DropdownMenuItem>
                        <Crown className="mr-2 h-4 w-4" />
                        Nâng cấp Premium
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Khóa tài khoản
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 