"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/features/auth/authSlice"
import { useState } from "react"
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Crown,
  MessageSquare,
  CheckCircle,
  Star,
  Bell,
  Menu,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import StaffManagement from "@/components/admin/staff-management"

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan hệ thống", icon: BarChart3, role: "Admin" },
  { id: "users", label: "Quản lý người dùng", icon: Users, role: "Admin" },
  { id: "staff", label: "Quản lý nhân viên", icon: UserCheck, role: "Admin" },
  { id: "books", label: "Quản lý sách", icon: BookOpen, role: "Staff" },
  { id: "premium", label: "Gói Premium & chính sách", icon: Crown, role: "Admin" },
  { id: "support", label: "Hỗ trợ khách hàng", icon: MessageSquare, role: "Staff" },
  { id: "approval", label: "Phê duyệt sách mới", icon: CheckCircle, role: "Admin" },
  { id: "feedback", label: "Phản hồi & đánh giá", icon: Star, role: "Staff" },
  { id: "notifications", label: "Thông báo hệ thống", icon: Bell, role: "Staff" },
]

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

const mockBooks = [
  { id: 1, title: "Lập trình React", author: "Tác giả A", category: "Công nghệ", status: "Đã duyệt", downloads: 1250 },
  { id: 2, title: "Kinh tế học cơ bản", author: "Tác giả B", category: "Kinh tế", status: "Chờ duyệt", downloads: 0 },
  { id: 3, title: "Văn học Việt Nam", author: "Tác giả C", category: "Văn học", status: "Đã duyệt", downloads: 890 },
]

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h2>
              <p className="text-muted-foreground">Thống kê tổng quan về hoạt động của hệ thống</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,543</div>
                  <p className="text-xs text-muted-foreground">+20.1% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng sách</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">+15.3% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Người dùng Premium</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+8.2% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lượt tải xuống</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45,231</div>
                  <p className="text-xs text-muted-foreground">+12.5% từ tháng trước</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sách chờ duyệt</CardTitle>
                  <CardDescription>Danh sách sách cần được phê duyệt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBooks
                      .filter((book) => book.status === "Chờ duyệt")
                      .map((book) => (
                        <div key={book.id} className="flex items-center space-x-4">
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{book.title}</p>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                          <Badge variant="outline">Chờ duyệt</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>NA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Người dùng mới đăng ký</p>
                        <p className="text-sm text-muted-foreground">2 phút trước</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>TB</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Sách mới được tải lên</p>
                        <p className="text-sm text-muted-foreground">5 phút trước</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
                <p className="text-muted-foreground">Xem, khóa, nâng cấp Premium cho người dùng</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm người dùng
              </Button>
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

      case "staff":
        return <StaffManagement />

      case "books":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Quản lý sách</h2>
                <p className="text-muted-foreground">Thêm, sửa, xóa sách trong thư viện</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sách mới
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm sách..." className="pl-8" />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Lọc theo thể loại
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sách</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Thể loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Lượt tải</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell>
                        <Badge variant={book.status === "Đã duyệt" ? "default" : "secondary"}>{book.status}</Badge>
                      </TableCell>
                      <TableCell>{book.downloads.toLocaleString()}</TableCell>
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
                              <Download className="mr-2 h-4 w-4" />
                              Tải xuống
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa sách
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

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Tính năng đang phát triển</h3>
              <p className="text-muted-foreground">Tính năng này sẽ sớm được cập nhật</p>
            </div>
          </div>
        )
    }
  }

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={className}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection(item.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {item.role}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col">
        <Sidebar className="flex-1 border-r" />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <div className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Main navigation menu</SheetDescription>
          </div>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="flex-1" />

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{renderContent()}</main>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Kiểm tra trạng thái authentication từ localStorage khi component mount
    console.log("HomePage - Checking auth status...")
    dispatch(checkAuthStatus())
  }, [dispatch])

  useEffect(() => {
    console.log("HomePage - Auth state changed:", { isAuthenticated, isLoading })
    // Chỉ redirect sau khi đã kiểm tra xong authentication status
    if (!isLoading) {
      if (isAuthenticated) {
        console.log("HomePage - Redirecting to /admin")
        router.replace("/admin")
      } else {
        console.log("HomePage - Redirecting to /login")
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Booklify Admin</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        ) : (
          <p className="text-muted-foreground">Đang chuyển hướng...</p>
        )}
      </div>
    </div>
  )
}
