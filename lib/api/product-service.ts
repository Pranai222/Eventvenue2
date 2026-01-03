const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

interface Product {
  id: number
  vendorId: number
  name: string
  description?: string
  category?: string
  price: number
  quantityAvailable?: number
  imageUrl?: string
  isActive: boolean
}

class ProductService {
  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching products:", error)
      throw error
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`)
      if (!response.ok) throw new Error("Failed to fetch product")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching product:", error)
      throw error
    }
  }

  async getProductsByVendor(vendorId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/vendor/${vendorId}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch vendor products")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error fetching vendor products:", error)
      throw error
    }
  }

  async createProduct(productData: Partial<Product>) {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error("Failed to create product")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error creating product:", error)
      throw error
    }
  }

  async updateProduct(id: number, productData: Partial<Product>) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error("Failed to update product")
      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("[EventVenue] Error updating product:", error)
      throw error
    }
  }

  async deleteProduct(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete product")
    } catch (error) {
      console.error("[EventVenue] Error deleting product:", error)
      throw error
    }
  }
}

export const productService = new ProductService()
export default productService
