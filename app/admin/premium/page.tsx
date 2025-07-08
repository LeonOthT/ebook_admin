"use client"

import { useAppSelector } from "@/lib/hooks"
import { Edit, Plus, Eye, Trash2, Menu, CheckCircle, Crown, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function PremiumPage() {
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
} 