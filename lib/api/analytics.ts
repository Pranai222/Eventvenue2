import { apiClient } from "./client"

export interface PlatformStats {
  totalUsers: number
  approvedVendors: number
  pendingVendors: number
  rejectedVendors: number
  totalVenues: number
  availableVenues: number
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalEvents: number
  activeEvents: number
  totalRevenue: number
  monthlyRevenue: number
}

export interface VendorStats {
  totalVendors: number
  approvedVendors: number
  pendingVendors: number
  rejectedVendors: number
  activeVendors: number
}

export interface BookingStats {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  cancelledBookings: number
  confirmedBookings: number
}

export interface UserStats {
  totalUsers: number
  totalPointsDistributed: number
  averageUserPoints: number
}

export const analyticsApi = {
  getPlatformStats: async () => apiClient.get<PlatformStats>("/api/analytics/platform-stats"),

  getVendorStats: async () => apiClient.get<VendorStats>("/api/analytics/vendor-stats"),

  getBookingStats: async () => apiClient.get<BookingStats>("/api/analytics/booking-stats"),

  getUserStats: async () => apiClient.get<UserStats>("/api/analytics/user-stats"),
}

export default analyticsApi
