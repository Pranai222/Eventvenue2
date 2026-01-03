const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
})

class VendorService {
  async getVendorById(id: number) {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch vendor")
    }

    return response.json()
  }

  async getVendorByUserId(userId: number) {
    const response = await fetch(`${API_BASE_URL}/vendors/user/${userId}`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch vendor")
    }

    return response.json()
  }

  async getAllVendors() {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch vendors")
    }

    return response.json()
  }

  async getApprovedVendors() {
    const response = await fetch(`${API_BASE_URL}/vendors/approved`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch vendors")
    }

    return response.json()
  }

  async updateVendor(id: number, vendorData: any) {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(vendorData),
    })

    if (!response.ok) {
      throw new Error("Failed to update vendor")
    }

    return response.json()
  }

  async approveVendor(id: number) {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/approve`, {
      method: "PUT",
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to approve vendor")
    }

    return response.json()
  }
}

export default new VendorService()
