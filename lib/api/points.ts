import { apiClient } from "./client"

export interface PointHistory {
    id: number
    pointsChanged: number
    reason: string
    previousPoints: number
    newPoints: number
    createdAt: string
}

export interface PointsBalance {
    points: number
    pointsPerDollar: number
}

export const pointsApi = {
    getBalance: async (): Promise<PointsBalance> => {
        const response = await apiClient.get<{ points: number; pointsPerDollar: number }>("/api/points/balance")
        return response as PointsBalance
    },

    getHistory: async (): Promise<PointHistory[]> => {
        const response = await apiClient.get<PointHistory[]>("/api/points/history")
        return Array.isArray(response) ? response : []
    },

    purchasePoints: async (points: number, paymentMethod: string, transactionId: string) => {
        return await apiClient.post("/api/points/purchase", {
            points,
            paymentMethod,
            transactionId
        })
    },

    calculatePoints: async (amount: number) => {
        return await apiClient.get(`/api/points/calculate?amount=${amount}`)
    },
}
