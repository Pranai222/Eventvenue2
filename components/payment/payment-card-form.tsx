"use client"

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
        },
    },
    hidePostalCode: false,
}

interface PaymentCardFormProps {
    onSubmit: (stripe: any, elements: any) => Promise<void>
    isLoading: boolean
    buttonText?: string
}

export function PaymentCardForm({ onSubmit, isLoading, buttonText = "Pay" }: PaymentCardFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setError(null)

        try {
            await onSubmit(stripe, elements)
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-lg bg-white">
                <label className="block text-sm font-medium mb-2">
                    Card Details
                </label>
                <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
                {isLoading ? 'Processing...' : buttonText}
            </button>

            <div className="text-xs text-muted-foreground text-center">
                Test card: 4242 4242 4242 4242 | Exp: 12/34 | CVC: 123
            </div>
        </form>
    )
}
