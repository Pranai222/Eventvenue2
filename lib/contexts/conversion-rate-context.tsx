"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'

interface ConversionRateContextType {
    conversionRate: number
    isLoading: boolean
    refreshRate: () => Promise<void>
}

const ConversionRateContext = createContext<ConversionRateContextType>({
    conversionRate: 1, // 1 point = $1
    isLoading: true,
    refreshRate: async () => { },
})

export function ConversionRateProvider({ children }: { children: React.ReactNode }) {
    const [conversionRate, setConversionRate] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    const fetchRate = async () => {
        try {
            const rate = await adminApi.getConversionRate()
            // API returns { pointsPerDollar: number } after apiClient extracts data
            const actualRate = typeof rate === 'number' ? rate : (rate as any)?.pointsPerDollar || 1
            setConversionRate(actualRate)
            console.log('[ConversionRate] Updated to:', actualRate)
        } catch (error: any) {
            // Silently handle auth errors (user not logged in yet)
            if (error?.status !== 401 && !error?.message?.includes('Unauthorized')) {
                console.error('[ConversionRate] Failed to fetch:', error)
            }
            // Use default on any error
            setConversionRate(1)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Initial fetch
        fetchRate()

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchRate, 30000)

        // Refetch when window regains focus
        const handleFocus = () => fetchRate()
        window.addEventListener('focus', handleFocus)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    return (
        <ConversionRateContext.Provider value={{ conversionRate, isLoading, refreshRate: fetchRate }}>
            {children}
        </ConversionRateContext.Provider>
    )
}

export function useConversionRate() {
    const context = useContext(ConversionRateContext)
    if (!context) {
        throw new Error('useConversionRate must be used within ConversionRateProvider')
    }
    return context
}
