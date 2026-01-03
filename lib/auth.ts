// Simple auth utilities - no context, no React, just pure functions

export interface AuthUser {
  userId: number
  email: string
  role: string
  firstName: string
  username?: string
  businessName?: string
  points?: number
  isVerified?: boolean
}

export interface AuthData {
  token: string
  user: AuthUser
}

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export function saveAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getUser() !== null
}
