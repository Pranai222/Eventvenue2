const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface User {
  id: number
  email: string
  firstName: string
  lastName?: string
  role: string
  points: number
  isActive: boolean
  isVerified: boolean
}

interface Vendor {
  id: number
  userId: number
  businessName: string
  businessDescription?: string
  status: string
  isActive: boolean
}

interface Venue {
  id: number
  vendorId: number
  name: string
  approvalStatus: string
}

interface Event {
  id: number
  vendorId: number
  name: string
  approvalStatus: string
}

class AdminService {
  // User Management
  async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching users:", error)
      throw error
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch user")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching user:", error)
      throw error
    }
  }

  async updateUserPoints(id: number, points: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/points`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ points }),
      })
      if (!response.ok) throw new Error("Failed to update user points")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error updating user points:", error)
      throw error
    }
  }

  async deactivateUser(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/deactivate`, {
        method: "PUT",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to deactivate user")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error deactivating user:", error)
      throw error
    }
  }

  // Vendor Management
  async getAllVendors() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vendors`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch vendors")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching vendors:", error)
      throw error
    }
  }

  async approveVendor(vendorId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}/approve`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (!response.ok) throw new Error("Failed to approve vendor")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error approving vendor:", error)
      throw error
    }
  }

  async rejectVendor(vendorId: number, reason?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}/reject`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: "REJECTED", reason }),
      })
      if (!response.ok) throw new Error("Failed to reject vendor")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error rejecting vendor:", error)
      throw error
    }
  }

  // Venue Approval
  async getPendingVenues() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/venues/pending`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch pending venues")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching pending venues:", error)
      throw error
    }
  }

  async approveVenue(venueId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/venues/${venueId}/approve`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ approvalStatus: "APPROVED" }),
      })
      if (!response.ok) throw new Error("Failed to approve venue")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error approving venue:", error)
      throw error
    }
  }

  async rejectVenue(venueId: number, reason?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/venues/${venueId}/reject`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ approvalStatus: "REJECTED", reason }),
      })
      if (!response.ok) throw new Error("Failed to reject venue")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error rejecting venue:", error)
      throw error
    }
  }

  // Event Approval
  async getPendingEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/pending`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch pending events")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching pending events:", error)
      throw error
    }
  }

  async approveEvent(eventId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/approve`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ approvalStatus: "APPROVED" }),
      })
      if (!response.ok) throw new Error("Failed to approve event")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error approving event:", error)
      throw error
    }
  }

  async rejectEvent(eventId: number, reason?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/reject`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ approvalStatus: "REJECTED", reason }),
      })
      if (!response.ok) throw new Error("Failed to reject event")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error rejecting event:", error)
      throw error
    }
  }

  // Booking Management
  async getAllBookings() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch bookings")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching bookings:", error)
      throw error
    }
  }

  async getBookingStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching stats:", error)
      throw error
    }
  }
}

export const adminService = new AdminService()
export default adminService
