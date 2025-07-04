"use client"

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
  LogOut,
  FolderPlus,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import AuthGuard from "@/components/auth/auth-guard"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"
import { useRouter } from "next/navigation"

// Import các modal mới
import CreateCategoryModal from "@/components/admin/create-category-modal"
import CreateBookModal from "@/components/admin/create-book-modal"
import CreateStaffModal from "@/components/admin/create-staff-modal"
import { BookStatusTrigger } from "@/components/admin/book-status-modal"
import StaffManagement from "@/components/admin/staff-management"
import CategoryManagement from "@/components/admin/category-management"
import BookManagement from "@/components/admin/book-management"

// Import TestModal
import TestModal from "@/components/test-modal"

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan hệ thống", icon: BarChart3, roles: ["Admin"] },
  { id: "users", label: "Quản lý người dùng", icon: Users, roles: ["Admin"] },
  { id: "staff", label: "Quản lý nhân viên", icon: UserCheck, roles: ["Admin"] },
  { id: "books", label: "Quản lý sách", icon: BookOpen, roles: ["Admin", "Staff"] },
  { id: "categories", label: "Danh mục sách", icon: FolderPlus, roles: ["Admin"] },
  { id: "premium", label: "Gói Premium & chính sách", icon: Crown, roles: ["Admin"] },
  { id: "support", label: "Hỗ trợ khách hàng", icon: MessageSquare, roles: ["Admin", "Staff"] },
  { id: "approval", label: "Phê duyệt sách mới", icon: CheckCircle, roles: ["Admin"] },
  { id: "feedback", label: "Phản hồi & đánh giá", icon: Star, roles: ["Admin", "Staff"] },
  { id: "notifications", label: "Thông báo hệ thống", icon: Bell, roles: ["Admin", "Staff"] },
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
  {
    id: 1,
    title: "Lập trình React",
    author: "Tác giả A",
    category: "Công nghệ",
    status: "Đã duyệt",
    approval_status: 1,
    is_premium: false,
    downloads: 1250,
  },
  {
    id: 2,
    title: "Kinh tế học cơ bản",
    author: "Tác giả B",
    category: "Kinh tế",
    status: "Chờ duyệt",
    approval_status: 0,
    is_premium: false,
    downloads: 0,
  },
  {
    id: 3,
    title: "Văn học Việt Nam",
    author: "Tác giả C",
    category: "Văn học",
    status: "Đã duyệt",
    approval_status: 1,
    is_premium: true,
    downloads: 890,
  },
]

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
  }

  const hasAccess = (requiredRoles: string[]) => {
    if (!user) return false
    return requiredRoles.some((role) => user.app_role.includes(role))
  }

  const getFilteredSidebarItems = () => {
    return sidebarItems.filter((item) => hasAccess(item.roles))
  }

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
        if (!hasAccess(["Admin"])) {
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

      case "staff":
        return <StaffManagement />

      case "books":
        return <BookManagement />

      case "categories":
        if (!hasAccess(["Admin"])) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Không có quyền truy cập</h3>
                <p className="text-muted-foreground">Bạn không có quyền truy cập chức năng này</p>
              </div>
            </div>
          )
        }

        return <CategoryManagement />

      case "premium":
        if (!hasAccess(["Admin"])) {
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
                <h2 className="text-3xl font-bold tracking-tight">Gói Premium & Chính sách</h2>
                <p className="text-muted-foreground">Quản lý gói Premium, giá cả và các chính sách của hệ thống</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa giá
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm gói mới
                </Button>
              </div>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₫15,2M</div>
                  <p className="text-xs text-muted-foreground">+12.5% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Người dùng Premium</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5,678</div>
                  <p className="text-xs text-muted-foreground">+8.2% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.4%</div>
                  <p className="text-xs text-muted-foreground">+2.1% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ gia hạn</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89.2%</div>
                  <p className="text-xs text-muted-foreground">+3.1% từ tháng trước</p>
                </CardContent>
              </Card>
            </div>

            {/* Gói Premium hiện tại */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                    Gói Premium Tháng
                  </CardTitle>
                  <CardDescription>Gói đăng ký hàng tháng cho người dùng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-blue-600">₫99,000</div>
                    <p className="text-muted-foreground">/tháng</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Truy cập không giới hạn tất cả sách Premium</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Tải xuống offline</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Không quảng cáo</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Hỗ trợ ưu tiên</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Người đăng ký:</span>
                      <Badge variant="secondary">3,245 người</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                    Gói Premium Năm
                  </CardTitle>
                  <CardDescription>Gói đăng ký hàng năm với ưu đãi đặc biệt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-purple-600">₫990,000</div>
                    <p className="text-muted-foreground">/năm</p>
                    <Badge variant="destructive" className="mt-2">
                      Tiết kiệm 17%
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Tất cả tính năng gói tháng</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Sách độc quyền</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Tư vấn đọc sách cá nhân</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Quà tặng sinh nhật</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Người đăng ký:</span>
                      <Badge variant="secondary">2,433 người</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Thống kê chi tiết */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê đăng ký Premium</CardTitle>
                  <CardDescription>Số liệu đăng ký trong 6 tháng gần đây</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tháng 7/2024</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <span className="text-sm font-medium">456</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tháng 8/2024</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                        <span className="text-sm font-medium">523</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tháng 9/2024</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                        <span className="text-sm font-medium">445</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tháng 10/2024</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                        </div>
                        <span className="text-sm font-medium">567</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tháng 11/2024</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "88%" }}></div>
                        </div>
                        <span className="text-sm font-medium">501</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tháng 12/2024</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                        <span className="text-sm font-medium">634</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sách Premium phổ biến</CardTitle>
                  <CardDescription>Top sách Premium được đọc nhiều nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nghệ thuật sống tối giản</p>
                        <p className="text-xs text-muted-foreground">1,234 lượt đọc</p>
                      </div>
                      <Badge variant="default">Premium</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Đầu tư chứng khoán thông minh</p>
                        <p className="text-xs text-muted-foreground">987 lượt đọc</p>
                      </div>
                      <Badge variant="default">Premium</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Lập trình AI với Python</p>
                        <p className="text-xs text-muted-foreground">856 lượt đọc</p>
                      </div>
                      <Badge variant="default">Premium</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">4</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Marketing số hiệu quả</p>
                        <p className="text-xs text-muted-foreground">743 lượt đọc</p>
                      </div>
                      <Badge variant="default">Premium</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">5</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Tâm lý học ứng dụng</p>
                        <p className="text-xs text-muted-foreground">692 lượt đọc</p>
                      </div>
                      <Badge variant="default">Premium</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chính sách hệ thống */}
            <Card>
              <CardHeader>
                <CardTitle>Chính sách & Điều khoản</CardTitle>
                <CardDescription>Quản lý các chính sách và quy định của hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Chính sách sử dụng</h4>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Quy định về cách sử dụng dịch vụ và quyền lợi của người dùng
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Cập nhật: 15/12/2024</span>
                      <Badge variant="outline">Hiệu lực</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Chính sách bảo mật</h4>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cam kết bảo vệ thông tin cá nhân và dữ liệu người dùng
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Cập nhật: 10/12/2024</span>
                      <Badge variant="outline">Hiệu lực</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Điều khoản thanh toán</h4>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Quy định về thanh toán, hoàn tiền và các giao dịch tài chính
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Cập nhật: 05/12/2024</span>
                      <Badge variant="outline">Hiệu lực</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danh sách người dùng Premium gần đây */}
            <Card>
              <CardHeader>
                <CardTitle>Người dùng Premium mới</CardTitle>
                <CardDescription>Danh sách người dùng đăng ký Premium gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Gói đăng ký</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>NV</AvatarFallback>
                          </Avatar>
                          <span>Nguyễn Văn A</span>
                        </div>
                      </TableCell>
                      <TableCell>nguyenvana@email.com</TableCell>
                      <TableCell>
                        <Badge variant="default">Premium Năm</Badge>
                      </TableCell>
                      <TableCell>2024-01-15</TableCell>
                      <TableCell>
                        <Badge variant="default">Hoạt động</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                              Chỉnh sửa gói
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hủy Premium
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>TT</AvatarFallback>
                          </Avatar>
                          <span>Trần Thị B</span>
                        </div>
                      </TableCell>
                      <TableCell>tranthib@email.com</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Premium Tháng</Badge>
                      </TableCell>
                      <TableCell>2024-01-14</TableCell>
                      <TableCell>
                        <Badge variant="default">Hoạt động</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                              Chỉnh sửa gói
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hủy Premium
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      case "support":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Hỗ trợ khách hàng</h2>
              <p className="text-muted-foreground">Quản lý các yêu cầu hỗ trợ từ người dùng</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yêu cầu mới</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">23</div>
                  <p className="text-sm text-muted-foreground">Cần xử lý ngay</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đang xử lý</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">45</div>
                  <p className="text-sm text-muted-foreground">Đang được xử lý</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đã hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">156</div>
                  <p className="text-sm text-muted-foreground">Hoàn thành tuần này</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Danh sách yêu cầu hỗ trợ</CardTitle>
                <CardDescription>Các yêu cầu hỗ trợ gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Nguyễn Văn A</TableCell>
                      <TableCell>Không thể tải sách</TableCell>
                      <TableCell>
                        <Badge variant="outline">Kỹ thuật</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">Mới</Badge>
                      </TableCell>
                      <TableCell>2024-01-15</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Xử lý
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trần Thị B</TableCell>
                      <TableCell>Lỗi thanh toán Premium</TableCell>
                      <TableCell>
                        <Badge variant="outline">Thanh toán</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Đang xử lý</Badge>
                      </TableCell>
                      <TableCell>2024-01-14</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      case "feedback":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Phản hồi & Đánh giá</h2>
              <p className="text-muted-foreground">Quản lý phản hồi và đánh giá từ người dùng</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tổng đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4.6/5</div>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đánh giá mới</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-muted-foreground">Hôm nay</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phản hồi tích cực</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">89%</div>
                  <p className="text-sm text-muted-foreground">Tháng này</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cần xử lý</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">3</div>
                  <p className="text-sm text-muted-foreground">Phản hồi tiêu cực</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Đánh giá gần đây</CardTitle>
                <CardDescription>Các đánh giá và phản hồi mới nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Nguyễn Văn A</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Ứng dụng rất tuyệt vời, nhiều sách hay và giao diện đẹp!"
                        </p>
                        <p className="text-xs text-muted-foreground">2 giờ trước</p>
                      </div>
                      <Badge variant="default">Tích cực</Badge>
                    </div>
                  </div>
                  <div className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Trần Thị B</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">"Tốt nhưng cần thêm nhiều sách tiếng Việt hơn."</p>
                        <p className="text-xs text-muted-foreground">5 giờ trước</p>
                      </div>
                      <Badge variant="secondary">Trung tính</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "approval":
        if (!hasAccess(["Admin"])) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Không có quyền truy cập</h3>
                <p className="text-muted-foreground">Chỉ Admin mới có quyền phê duyệt sách</p>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Phê duyệt sách mới</h2>
              <p className="text-muted-foreground">Phê duyệt các sách mới được tải lên hệ thống</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chờ duyệt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {mockBooks.filter((book) => book.approval_status === 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Sách cần phê duyệt</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đã duyệt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {mockBooks.filter((book) => book.approval_status === 1).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Sách đã được duyệt</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Từ chối</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {mockBooks.filter((book) => book.approval_status === 2).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Sách bị từ chối</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Danh sách sách cần phê duyệt</CardTitle>
                <CardDescription>Ưu tiên xử lý các sách chờ duyệt</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sách</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Thể loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tải lên</TableHead>
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
                          <Badge
                            variant={
                              book.approval_status === 1
                                ? "default"
                                : book.approval_status === 2
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {book.approval_status === 0
                              ? "Chờ duyệt"
                              : book.approval_status === 1
                                ? "Đã duyệt"
                                : "Từ chối"}
                          </Badge>
                        </TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell className="text-right">
                          <BookStatusTrigger
                            bookId={book.id.toString()}
                            bookTitle={book.title}
                            currentStatus={book.approval_status}
                            currentPremium={book.is_premium}
                            onSuccess={() => console.log("Book status updated")}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      // Các case khác giữ nguyên như cũ...
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

  const Sidebar = ({ className, collapsed = false }: { className?: string; collapsed?: boolean }) => (
    <div className={className}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {!collapsed && <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>}
          <div className="space-y-1">
            {getFilteredSidebarItems().map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full ${collapsed ? "justify-center px-2" : "justify-start"}`}
                onClick={() => {
                  setActiveSection(item.id)
                  setIsMobileMenuOpen(false)
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.roles.join(", ")}
                    </Badge>
                  </>
                )}
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
      <div
        className={`hidden md:flex md:flex-col transition-all duration-300 ${isSidebarCollapsed ? "md:w-16" : "md:w-80"}`}
      >
        <Sidebar className="flex-1 border-r" collapsed={isSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 lg:px-6">
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>

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
                      <AvatarImage src="/placeholder-user.jpg" alt={user?.username} />
                      <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                      <div className="flex gap-1">
                        {user?.app_role.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
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

export default function AdminPage() {
  return (
    <AuthGuard requiredRoles={["Admin", "Staff"]}>
      <AdminDashboard />
    </AuthGuard>
  )
}
