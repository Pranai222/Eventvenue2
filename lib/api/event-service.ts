const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface Event {
  id: number
  vendorId: number
  name: string
  description?: string
  eventDate?: string
  eventTime?: string
  location?: string
  category?: string
  totalTickets?: number
  availableTickets?: number
  pricePerTicket?: number
  isActive: boolean
  approvalStatus: string
}

class EventService {
  async getEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/events`)
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching events:", error)
      throw error
    }
  }

  async getEventById(id: number): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`)
      if (!response.ok) throw new Error("Failed to fetch event")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching event:", error)
      throw error
    }
  }

  async getEventsByVendor(vendorId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/vendor/${vendorId}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch vendor events")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching vendor events:", error)
      throw error
    }
  }

  async createEvent(eventData: Partial<Event>) {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      })
      if (!response.ok) throw new Error("Failed to create event")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error creating event:", error)
      throw error
    }
  }

  async updateEvent(id: number, eventData: Partial<Event>) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      })
      if (!response.ok) throw new Error("Failed to update event")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error updating event:", error)
      throw error
    }
  }
}

export const eventService = new EventService()
export default eventService
