import { apiClient } from "./client"
import type { LoginRequest, AuthResponse, User, Vendor } from "@/lib/types/auth"
import { usersApi } from "./users"

export const authApi = {
  userLogin: (data: LoginRequest) => apiClient.postPublic<AuthResponse>("/api/auth/user/login", data),

  userSignup: (data: {
    username?: string
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
  }) => apiClient.postPublic<AuthResponse>("/api/auth/user/signup", data),

  verifyOtp: (data: { email: string; otp: string; role?: string }) =>
    apiClient.postPublic<AuthResponse>("/api/auth/verify-otp", {
      ...data,
      role: data.role || "USER",
    }),

  resendOtp: (email: string, role = "USER") =>
    apiClient.postPublic<{ success: boolean; message: string }>("/api/auth/resend-otp", { email, role }),

  vendorLogin: (data: LoginRequest) => apiClient.postPublic<AuthResponse>("/api/auth/vendor/login", data),

  vendorSignup: (data: {
    username?: string
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
    businessName: string
    businessDescription: string
    businessPhone?: string
    businessAddress?: string
    city: string
    state?: string
    pincode?: string
  }) => apiClient.postPublic<AuthResponse>("/api/auth/vendor/signup", data),

  adminLogin: (data: LoginRequest) => apiClient.postPublic<AuthResponse>("/api/auth/admin/login", data),

  getUserProfile: () => usersApi.getUserProfile(),

  getVendorProfile: () => usersApi.getVendorProfile(),

  updateUserProfile: (data: Partial<User>) => usersApi.updateUserProfile(data),

  updateVendorProfile: (data: Partial<Vendor>) => usersApi.updateVendorProfile(data),
}

export { usersApi }
