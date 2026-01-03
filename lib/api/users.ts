import { apiClient } from "./client"

interface PointHistory {
  id: number
  pointsChanged: number
  reason: string
  previousPoints: number
  newPoints: number
  createdAt: string
}

interface UserProfile {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string
  points: number
  role: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface VendorProfile {
  id: number
  email: string
  businessName: string
  description: string
  status: string
  isVerified: boolean
  rating: number
  totalVenues: number
  businessPhone?: string
  businessAddress?: string
  city?: string
  state?: string
  pincode?: string
  createdAt: string
  updatedAt: string
}

export const usersApi = {
  getUserProfile: async () => {
    try {
      const response = await apiClient.get<UserProfile>("/api/user/profile")
      return response as UserProfile
    } catch (error) {
      console.error("[EventVenue] Failed to get user profile:", error)
      throw error
    }
  },

  updateUserProfile: async (data: Partial<UserProfile>) => {
    try {
      const response = await apiClient.put<UserProfile>("/api/user/profile", data)
      return response as UserProfile
    } catch (error) {
      console.error("[EventVenue] Failed to update user profile:", error)
      throw error
    }
  },

  getVendorProfile: async () => {
    try {
      const response = await apiClient.get<VendorProfile>("/api/vendor/profile")
      return response as VendorProfile
    } catch (error) {
      console.error("[EventVenue] Failed to get vendor profile:", error)
      throw error
    }
  },

  updateVendorProfile: async (data: Partial<VendorProfile>) => {
    try {
      const response = await apiClient.put<VendorProfile>("/api/vendor/profile", data)
      return response as VendorProfile
    } catch (error) {
      console.error("[EventVenue] Failed to update vendor profile:", error)
      throw error
    }
  },

  getPointsHistory: async () => {
    try {
      const response = await apiClient.get<PointHistory[]>("/api/user/points/history")
      return Array.isArray(response) ? response : [response]
    } catch (error) {
      console.error("[EventVenue] Failed to get points history:", error)
      return []
    }
  },

  getUserPoints: async (userId: number) => {
    try {
      const response = await apiClient.get<number>(`/api/user/points/${userId}`)
      return response as number
    } catch (error) {
      console.error("[EventVenue] Failed to get user points:", error)
      return 0
    }
  },
}
