const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface Venue {
  id: number
  vendorId: number
  name: string
  description?: string
  location: string
  city?: string
  capacity?: number
  pricePerHour?: number
  amenities?: string
  isActive: boolean
  approvalStatus: string
}

class VenueService {
  async getVenues() {
    try {
      const response = await fetch(`${API_BASE_URL}/venues`)
      if (!response.ok) throw new Error("Failed to fetch venues")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching venues:", error)
      throw error
    }
  }

  async getVenueById(id: number): Promise<Venue> {
    try {
      const response = await fetch(`${API_BASE_URL}/venues/${id}`)
      if (!response.ok) throw new Error("Failed to fetch venue")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching venue:", error)
      throw error
    }
  }

  async getVenuesByVendor(vendorId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/venues/vendor/${vendorId}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch vendor venues")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching vendor venues:", error)
      throw error
    }
  }

  async createVenue(venueData: Partial<Venue>) {
    try {
      const response = await fetch(`${API_BASE_URL}/venues`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(venueData),
      })
      if (!response.ok) throw new Error("Failed to create venue")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error creating venue:", error)
      throw error
    }
  }

  async updateVenue(id: number, venueData: Partial<Venue>) {
    try {
      const response = await fetch(`${API_BASE_URL}/venues/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(venueData),
      })
      if (!response.ok) throw new Error("Failed to update venue")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error updating venue:", error)
      throw error
    }
  }

  async deleteVenue(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/venues/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete venue")
    } catch (error) {
      console.error("[EventVenue] Error deleting venue:", error)
      throw error
    }
  }
}

export const venueService = new VenueService()
export default venueService
