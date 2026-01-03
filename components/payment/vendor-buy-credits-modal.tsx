"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StripeProvider } from './stripe-provider'
import { PaymentCardForm } from './payment-card-form'
import { CardElement } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { CheckCircle, Loader2, Building2 } from 'lucide-react'

interface VendorBuyCreditsModalProps {
    isOpen: boolean
    onClose: () => void
    vendorId: number
    onSuccess?: () => void
}

function VendorBuyCreditsContent({ onClose, vendorId, onSuccess }: Omit<VendorBuyCreditsModalProps, 'isOpen'>) {
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
                // Calculate-points is public endpoint - no auth header needed
                const response = await axios.get(
                    `http://localhost:8080/api/stripe/calculate-points?amount=${numValue}`
                )
                setPoints(response.data.points)
            } catch (err) {
                console.error('Error calculating points:', err)
                // Fallback: calculate locally (1 point per 1 INR as default)
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

            // Use vendor endpoint for payment intent
            const response = await axios.post(
                'http://localhost:8080/api/stripe/vendor/create-payment-intent',
                { vendorId, amountUsd: numAmount },
                getAuthHeaders()
            )

            setClientSecret(response.data.clientSecret)
            setPaymentIntentId(response.data.paymentIntentId)
        } catch (err: any) {
            // Fallback to user endpoint if vendor endpoint doesn't exist
            try {
                const response = await axios.post(
                    'http://localhost:8080/api/stripe/create-payment-intent',
                    { userId: vendorId, amountUsd: numAmount, isVendor: true },
                    getAuthHeaders()
                )
                setClientSecret(response.data.clientSecret)
                setPaymentIntentId(response.data.paymentIntentId)
            } catch (fallbackErr: any) {
                setError(fallbackErr.response?.data?.error || 'Failed to create payment intent')
            }
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
                // Confirm payment on backend - try vendor endpoint first
                try {
                    const response = await axios.post(
                        'http://localhost:8080/api/stripe/vendor/confirm-payment',
                        { paymentIntentId: paymentIntent.id, vendorId },
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
                } catch {
                    // Fallback to regular confirm
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
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-emerald-600">Payment Successful!</h3>
                <p className="text-muted-foreground">{points.toLocaleString()} points added to your account</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {!clientSecret ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-base font-medium">Amount (INR ₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            placeholder="Enter amount (e.g. 100)"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="h-12 text-lg"
                        />
                        {points > 0 && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg">
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    You will receive <span className="font-bold text-emerald-600">{points.toLocaleString()} points</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleCreatePaymentIntent}
                        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg shadow-lg shadow-emerald-500/25"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                                Processing...
                            </>
                        ) : (
                            'Continue to Payment'
                        )}
                    </button>
                </>
            ) : (
                <>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold text-lg">₹{parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Points</span>
                            <span className="font-bold text-emerald-600 text-lg">{points.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-medium">Card Details</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                            Enter your card information securely via Stripe
                        </p>
                    </div>

                    <PaymentCardForm
                        onSubmit={handlePaymentSubmit}
                        isLoading={isLoading}
                        buttonText={`Pay ₹${parseFloat(amount).toFixed(2)}`}
                    />

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export function VendorBuyCreditsModal({ isOpen, onClose, vendorId, onSuccess }: VendorBuyCreditsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        Buy Credits
                    </DialogTitle>
                    <DialogDescription>
                        Purchase points to create venues and events
                    </DialogDescription>
                </DialogHeader>

                <StripeProvider>
                    <VendorBuyCreditsContent onClose={onClose} vendorId={vendorId} onSuccess={onSuccess} />
                </StripeProvider>
            </DialogContent>
        </Dialog>
    )
}
