const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface Booking {
  id?: number
  userId?: number
  venueId?: number
  eventId?: number
  bookingStartDate: string
  bookingEndDate: string
  numberOfGuests?: number
  totalCost?: number
  pointsUsed?: number
  status?: string
  paymentStatus?: string
  specialRequests?: string
}

class BookingService {
  async getUserBookings() {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch bookings")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching user bookings:", error)
      throw error
    }
  }

  async getBookingById(id: number): Promise<Booking> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch booking")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching booking:", error)
      throw error
    }
  }

  async getVendorBookings() {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/vendor`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch vendor bookings")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching vendor bookings:", error)
      throw error
    }
  }

  async createBooking(bookingData: Booking) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(bookingData),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create booking")
      }
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error creating booking:", error)
      throw error
    }
  }

  async confirmBooking(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/confirm`, {
        method: "PUT",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to confirm booking")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error confirming booking:", error)
      throw error
    }
  }

  async cancelBooking(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
        method: "PUT",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to cancel booking")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error cancelling booking:", error)
      throw error
    }
  }

  async updateBookingStatus(id: number, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update booking status")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error updating booking status:", error)
      throw error
    }
  }
}

export const bookingService = new BookingService()
export default bookingService
