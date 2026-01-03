"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StripeProvider } from './stripe-provider'
import { PaymentCardForm } from './payment-card-form'
import { CardElement } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { CheckCircle, Loader2 } from 'lucide-react'

interface BuyCreditsModalProps {
    isOpen: boolean
    onClose: () => void
    userId: number
    onSuccess?: () => void
}

function BuyCreditsContent({ onClose, userId, onSuccess }: Omit<BuyCreditsModalProps, 'isOpen'>) {
    const [amount, setAmount] = useState<string>('')
    const [points, setPoints] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

    // Get auth headers
    const getAuthHeaders = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
    })

    // Calculate points when amount changes
    const handleAmountChange = async (value: string) => {
        setAmount(value)
        const numValue = parseFloat(value)

        if (numValue > 0) {
            try {
                // Calculate-points is public - no auth needed
                const response = await axios.get(`http://localhost:8080/api/stripe/calculate-points?amount=${numValue}`)
                setPoints(response.data.points)
            } catch (err) {
                console.error('Error calculating points:', err)
                // Fallback: calculate locally (1 point per 1 INR)
                setPoints(Math.floor(numValue))
            }
        } else {
            setPoints(0)
        }
    }

    const handleCreatePaymentIntent = async () => {
        const numAmount = parseFloat(amount)
        if (numAmount <= 0) {
            setError('Please enter a valid amount')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await axios.post(
                'http://localhost:8080/api/stripe/create-payment-intent',
                { userId, amountUsd: numAmount },
                getAuthHeaders()
            )

            setClientSecret(response.data.clientSecret)
            setPaymentIntentId(response.data.paymentIntentId)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create payment intent')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePaymentSubmit = async (stripe: any, elements: any) => {
        if (!clientSecret || !paymentIntentId) return

        setIsLoading(true)
        setError(null)

        try {
            const cardElement = elements.getElement(CardElement)

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            })

            if (stripeError) {
                setError(stripeError.message)
                setIsLoading(false)
                return
            }

            if (paymentIntent.status === 'succeeded') {
                // Confirm payment on backend
                const response = await axios.post(
                    'http://localhost:8080/api/stripe/confirm-payment',
                    { paymentIntentId: paymentIntent.id },
                    getAuthHeaders()
                )

                if (response.data.success) {
                    setIsSuccess(true)
                    setTimeout(() => {
                        onSuccess?.()
                        onClose()
                    }, 2000)
                } else {
                    setError(response.data.message || 'Payment confirmation failed')
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Payment failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground">{points} points added to your account</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {!clientSecret ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (INR ₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            placeholder="50.00"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                        />
                        {points > 0 && (
                            <p className="text-sm text-muted-foreground">
                                You will receive <span className="font-semibold text-primary">{points.toLocaleString()} points</span>
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleCreatePaymentIntent}
                        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                                Processing...
                            </>
                        ) : (
                            'Continue to Payment'
                        )}
                    </button>
                </>
            ) : (
                <>
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Points</span>
                            <span className="font-semibold text-primary">{points.toLocaleString()}</span>
                        </div>
                    </div>

                    <PaymentCardForm
                        onSubmit={handlePaymentSubmit}
                        isLoading={isLoading}
                        buttonText={`Pay $${parseFloat(amount).toFixed(2)}`}
                    />
                </>
            )}
        </div>
    )
}

export function BuyCreditsModal({ isOpen, onClose, userId, onSuccess }: BuyCreditsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Buy Credits</DialogTitle>
                    <DialogDescription>
                        Purchase points to book events and venues
                    </DialogDescription>
                </DialogHeader>

                <StripeProvider>
                    <BuyCreditsContent onClose={onClose} userId={userId} onSuccess={onSuccess} />
                </StripeProvider>
            </DialogContent>
        </Dialog>
    )
}
