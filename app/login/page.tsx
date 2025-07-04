"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/features/auth/authSlice"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa khi component mount
    dispatch(checkAuthStatus())
  }, [dispatch])

  useEffect(() => {
    // Nếu đã đăng nhập thì redirect về admin
    if (!isLoading && isAuthenticated) {
      console.log("Already authenticated, redirecting to admin...")
      router.replace("/admin")
      return
    }
  }, [isAuthenticated, isLoading, router])

  // Nếu đang loading hoặc đã authenticated thì hiển thị loading
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booklify Admin</h1>
          <p className="text-muted-foreground">
            {isAuthenticated ? "Đang chuyển hướng đến trang quản trị..." : "Đang kiểm tra đăng nhập..."}
          </p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}
