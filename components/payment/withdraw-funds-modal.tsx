"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StripeProvider } from './stripe-provider'
import { PaymentCardForm } from './payment-card-form'
import { CardElement } from '@stripe/react-stripe-js'
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WithdrawFundsModalProps {
    isOpen: boolean
    onClose: () => void
    userId: number
    currentPoints: number
    onSuccess?: () => void
}

function WithdrawFundsContent({ onClose, userId, currentPoints, onSuccess }: Omit<WithdrawFundsModalProps, 'isOpen'>) {
    const [pointsAmount, setPointsAmount] = useState<string>('')
    const [usdAmount, setUsdAmount] = useState<number>(0)
    const [requiresApproval, setRequiresApproval] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [withdrawalId, setWithdrawalId] = useState<number | null>(null)
    const [showCardForm, setShowCardForm] = useState(false)

    // Calculate USD when points change
    const handlePointsChange = async (value: string) => {
        setPointsAmount(value)
        const numValue = parseInt(value)

        if (numValue > 0 && numValue <= currentPoints) {
            try {
                const response = await axios.get(`http://localhost:8080/api/stripe/calculate-usd?points=${numValue}`)
                const amount = response.data.amountUsd
                setUsdAmount(amount)
                setRequiresApproval(amount >= 1000)
            } catch (err) {
                console.error('Error calculating USD:', err)
            }
        } else {
            setUsdAmount(0)
            setRequiresApproval(false)
        }
    }

    const handleSubmitWithdrawal = async () => {
        const points = parseInt(pointsAmount)
        if (points <= 0 || points > currentPoints) {
            setError('Invalid points amount')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await axios.post('http://localhost:8080/api/withdrawals/submit', {
                userId,
                pointsAmount: points
            })

            setWithdrawalId(response.data.withdrawal.id)

            if (response.data.withdrawal.requiresApproval) {
                // Requires admin approval
                setIsSuccess(true)
            } else {
                // Can process immediately
                setShowCardForm(true)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit withdrawal')
        } finally {
            setIsLoading(false)
        }
    }

    const handleProcessWithdrawal = async (stripe: any, elements: any) => {
        if (!withdrawalId) return

        setIsLoading(true)
        setError(null)

        try {
            const cardElement = elements.getElement(CardElement)

            // Get card details for last4 (in production, would process actual payout)
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            })

            if (stripeError) {
                setError(stripeError.message)
                setIsLoading(false)
                return
            }

            const cardLast4 = paymentMethod.card.last4

            // Process withdrawal
            const response = await axios.post(`http://localhost:8080/api/withdrawals/process/${withdrawalId}`, {
                cardLast4
            })

            if (response.data.success) {
                setIsSuccess(true)
                setTimeout(() => {
                    onSuccess?.()
                    onClose()
                }, 2000)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Withdrawal failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                    {requiresApproval ? 'Request Submitted!' : 'Withdrawal Successful!'}
                </h3>
                <p className="text-muted-foreground text-center">
                    {requiresApproval
                        ? 'Your withdrawal request has been sent to admin for approval. You will be notified once approved.'
                        : `$${usdAmount.toFixed(2)} has been transferred to your account`
                    }
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {!showCardForm ? (
                <>
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Available Points</span>
                            <span className="font-semibold text-primary">{currentPoints.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="points">Points to Withdraw</Label>
                        <Input
                            id="points"
                            type="number"
                            min="1"
                            max={currentPoints}
                            placeholder="10000"
                            value={pointsAmount}
                            onChange={(e) => handlePointsChange(e.target.value)}
                        />
                        {usdAmount > 0 && (
                            <p className="text-sm text-muted-foreground">
                                You will receive <span className="font-semibold text-green-600">${usdAmount.toFixed(2)}</span>
                            </p>
                        )}
                    </div>

                    {requiresApproval && usdAmount > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Withdrawals of $1,000 or more require admin approval. Your request will be reviewed within 24-48 hours.
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmitWithdrawal}
                        disabled={!pointsAmount || parseInt(pointsAmount) <= 0 || parseInt(pointsAmount) > currentPoints || isLoading}
                        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                                Processing...
                            </>
                        ) : (
                            requiresApproval ? 'Submit for Approval' : 'Continue to Withdrawal'
                        )}
                    </button>
                </>
            ) : (
                <>
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Withdrawing</span>
                            <span className="font-semibold">{parseInt(pointsAmount).toLocaleString()} points</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold text-green-600">${usdAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <Alert>
                        <AlertDescription>
                            Enter the card details where you want to receive the funds.
                        </AlertDescription>
                    </Alert>

                    <PaymentCardForm
                        onSubmit={handleProcessWithdrawal}
                        isLoading={isLoading}
                        buttonText={`Withdraw $${usdAmount.toFixed(2)}`}
                    />
                </>
            )}
        </div>
    )
}

export function WithdrawFundsModal({ isOpen, onClose, userId, currentPoints, onSuccess }: WithdrawFundsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                        Convert your points to money
                    </DialogDescription>
                </DialogHeader>

                <StripeProvider>
                    <WithdrawFundsContent
                        onClose={onClose}
                        userId={userId}
                        currentPoints={currentPoints}
                        onSuccess={onSuccess}
                    />
                </StripeProvider>
            </DialogContent>
        </Dialog>
    )
}
