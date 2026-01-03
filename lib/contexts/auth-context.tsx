"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { AuthResponse, UserRole } from "@/lib/types/auth"
import { saveAuth, getUser, clearAuth, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (authData: AuthResponse) => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("[EventVenue] Auth Context - Initializing from localStorage")
    const loadedUser = getUser()
    console.log("[EventVenue] Auth Context - Loaded user:", loadedUser ? { userId: loadedUser.userId, role: loadedUser.role } : null)
    setUser(loadedUser)
    setIsLoading(false)
  }, [])

  const login = (authData: AuthResponse) => {
    console.log("[EventVenue] Auth Context - Login:", {
      userId: authData.userId,
      role: authData.role,
      email: authData.email
    })

    const authUser: AuthUser = {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
      firstName: authData.firstName || authData.username || "User",
      username: authData.username,
      businessName: authData.businessName,
      points: authData.points,
      isVerified: authData.isVerified,
    }

    saveAuth(authData.token, authUser)
    setUser(authUser)

    const targetRoute =
      authData.role === "USER"
        ? "/user/dashboard"
        : authData.role === "VENDOR"
          ? "/vendor/dashboard"
          : authData.role === "ADMIN"
            ? "/admin/dashboard"
            : "/"

    console.log("[EventVenue] Auth Context - Redirecting to:", targetRoute)
    router.push(targetRoute)
  }

  const logout = () => {
    console.log("[EventVenue] Auth Context - Logout")
    clearAuth()
    setUser(null)
    router.replace("/")
  }

  const hasRole = (role: UserRole): boolean => user?.role === role

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
