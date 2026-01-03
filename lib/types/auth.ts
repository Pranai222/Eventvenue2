// Type definitions matching Spring Boot backend DTOs

export type UserRole = "USER" | "VENDOR" | "ADMIN"

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name?: string
  businessName?: string
  email: string
  password: string
}

export interface OtpVerificationRequest {
  email: string
  otp: string
}

export interface AuthResponse {
  token: string
  role: UserRole
  userId: number
  email: string
  name?: string
  firstName?: string
  lastName?: string
  username?: string
  businessName?: string
  businessDescription?: string
  points?: number
  isVerified?: boolean
  message?: string
}

export interface User {
  id: number
  username?: string
  firstName?: string
  lastName?: string
  name: string
  email: string
  phone?: string
  points: number
  isVerified: boolean
  role: UserRole
  createdAt: string
  updatedAt?: string
}

export interface Vendor {
  id: number
  businessName: string
  email: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isVerified: boolean
  createdAt: string
}

export interface Admin {
  id: number
  name: string
  email: string
  role: string
}
