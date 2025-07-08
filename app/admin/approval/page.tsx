"use client"

import { useAppSelector } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

const mockBooks = [
  {
    id: 1,
    title: "Lập trình React",
    author: "Tác giả A",
    category: "Công nghệ",
    approval_status: 1,
  },
  {
    id: 2,
    title: "Kinh tế học cơ bản",
    author: "Tác giả B",
    category: "Kinh tế",
    approval_status: 0,
  },
  {
    id: 3,
    title: "Văn học Việt Nam",
    author: "Tác giả C",
    category: "Văn học",
    approval_status: 1,
  },
]

export default function ApprovalPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = user?.app_role?.includes("Admin") || false

  if (!isAdmin) {
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
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Quản lý trạng thái
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 