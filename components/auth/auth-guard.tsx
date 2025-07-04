"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/features/auth/authSlice"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export default function AuthGuard({ children, requiredRoles = [] }: AuthGuardProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    // Always check auth status on mount to restore from localStorage
    console.log("AuthGuard - Checking auth status on mount...")
    dispatch(checkAuthStatus())
  }, [dispatch])

  useEffect(() => {
    console.log("AuthGuard - Auth state changed:", { isAuthenticated, isLoading })
    if (!isLoading && !isAuthenticated) {
      console.log("AuthGuard - Not authenticated, redirecting to login...")
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => user.app_role.includes(role))

      if (!hasRequiredRole) {
        router.push("/unauthorized")
      }
    }
  }, [isAuthenticated, user, requiredRoles, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
  }

  if (!user?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tài khoản bị khóa</h2>
          <p className="text-muted-foreground">Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
