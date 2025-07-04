"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, BookOpen, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { loginUser, clearError } from "@/lib/features/auth/authSlice"

export default function LoginForm() {
  const [username, setUsername] = useState("admin@booklify.com")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()

  // Redirect when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("LoginForm - Authentication successful, redirecting to admin...")
      router.replace("/admin")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password || isLoading) {
      console.log("Form submission blocked:", { username: !!username, password: !!password, isLoading })
      return
    }

    console.log("Form submitted with:", { username, password: "***" })

    try {
      const result = await dispatch(loginUser({ email: username, password }))
      console.log("Dispatch result:", result)

      if (loginUser.fulfilled.match(result)) {
        console.log("Login successful, will be redirected by auth state change...")
        // Không redirect ở đây nữa, để AuthGuard hoặc trang chủ handle
      } else {
        console.log("Login failed:", result)
      }
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) {
      dispatch(clearError())
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) {
      dispatch(clearError())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booklify Admin</h1>
          <p className="text-gray-600">Hệ thống quản trị thư viện điện tử</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-center text-gray-900">Đăng nhập Admin</CardTitle>
            </div>
            <CardDescription className="text-center text-gray-600">
              Nhập thông tin đăng nhập để truy cập hệ thống quản trị
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Tài khoản (Username)
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin@booklify.com"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                  disabled={isLoading}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                    className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-900 mb-2">🔑 Tài khoản demo:</p>
                <div className="space-y-1">
                  <p className="font-mono text-sm text-blue-800 bg-white px-3 py-1 rounded border">
                    admin@booklify.com
                  </p>
                  <p className="text-xs text-blue-600">Vui lòng nhập mật khẩu chính xác để truy cập</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">© 2024 Booklify. Hệ thống quản trị an toàn và bảo mật.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
