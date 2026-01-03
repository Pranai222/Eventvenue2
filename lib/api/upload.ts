import { getToken } from "@/lib/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface UploadResponse {
    success: boolean
    message: string
    data?: {
        url?: string
        urls?: string[]
    }
}

export const uploadApi = {
    // Upload single image
    uploadImage: async (file: File, type: string = "general"): Promise<string> => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        const token = getToken()
        const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: formData
        })

        const result: UploadResponse = await response.json()

        if (!result.success || !result.data?.url) {
            throw new Error(result.message || "Upload failed")
        }

        return result.data.url
    },

    // Upload multiple images
    uploadImages: async (files: File[], type: string = "general"): Promise<string[]> => {
        const formData = new FormData()
        files.forEach(file => {
            formData.append("files", file)
        })
        formData.append("type", type)

        const token = getToken()
        const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: formData
        })

        const result: UploadResponse = await response.json()

        if (!result.success || !result.data?.urls) {
            throw new Error(result.message || "Upload failed")
        }

        return result.data.urls
    }
}

export default uploadApi
