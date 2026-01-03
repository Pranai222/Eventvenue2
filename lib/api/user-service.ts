const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
})

class UserService {
  async getUserById(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    return response.json()
  }

  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  }

  async updatePoints(userId: number, points: number) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/points?points=${points}`, {
      method: "PUT",
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to update points")
    }

    return response.json()
  }
}

export default new UserService()
