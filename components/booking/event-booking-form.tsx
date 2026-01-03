"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { bookingsApi } from "@/lib/api/bookings"
import { useConversionRate } from "@/lib/contexts/conversion-rate-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, Ticket, CreditCard, Coins } from "lucide-react"
import type { Event, TicketType } from "@/lib/types/booking"

interface EventBookingFormProps {
    event: Event
    userPoints: number
}

export function EventBookingForm({ event, userPoints }: EventBookingFormProps) {
    const router = useRouter()
    const { conversionRate, isLoading: rateLoading } = useConversionRate()
    const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({})
    const [pointsToUse, setPointsToUse] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const PLATFORM_FEE_POINTS = 2

    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)

    const subtotal = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
        const ticket = event.ticketTypes.find(t => t.id === Number(ticketId))
        return sum + (ticket ? ticket.price * qty : 0)
    }, 0)

    // Calculate discount: pointsToUse / conversionRate = dollars
    const pointsDiscount = pointsToUse / conversionRate
    const totalAmount = Math.max(0, subtotal - pointsDiscount)

    const handleQuantityChange = (ticketId: number, delta: number) => {
        const ticket = event.ticketTypes.find(t => t.id === ticketId)
        if (!ticket) return

        const currentQty = selectedTickets[ticketId] || 0
        const newQty = Math.max(0, Math.min(ticket.availableQuantity, currentQty + delta))

        setSelectedTickets(prev => {
            if (newQty === 0) {
                const { [ticketId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [ticketId]: newQty }
        })
    }

    const handlePointsChange = (value: string) => {
        const points = parseInt(value) || 0
        // Maximum points: either userPoints or enough to cover subtotal
        const maxPointsForTotal = Math.ceil(subtotal * conversionRate)
        const validPoints = Math.max(0, Math.min(userPoints, maxPointsForTotal, points))
        setPointsToUse(validPoints)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (totalTickets === 0) {
            setError("Please select at least one ticket")
            return
        }

        // Check if user has enough points including platform fee
        const totalPointsNeeded = pointsToUse + PLATFORM_FEE_POINTS
        if (userPoints < totalPointsNeeded) {
            setError(`Not enough points. Need ${totalPointsNeeded} points (including ${PLATFORM_FEE_POINTS} platform fee) but you have ${userPoints}`)
            return
        }

        setIsLoading(true)

        try {
            console.log("[EventVenue] Creating event booking:", {
                eventId: event.id,
                totalTickets,
                totalAmount,
                pointsUsed: pointsToUse,
                platformFee: PLATFORM_FEE_POINTS
            })

            // ALWAYS use createWithPoints to ensure:
            // 1. Booking status = CONFIRMED
            // 2. Points transferred to vendor
            // 3. Tickets deducted from availability
            // 4. Platform fee (2 points) deducted
            await bookingsApi.createWithPoints({
                eventId: event.id,
                bookingDate: new Date().toISOString().split('T')[0],
                totalAmount: totalAmount,
                pointsToUse: pointsToUse,
                quantity: totalTickets
            })

            // Direct redirect - no alert
            router.push("/user/bookings")
        } catch (error: any) {
            console.error("[EventVenue] Booking failed:", error)
            setError(error.message || "Failed to book tickets. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Book Tickets</CardTitle>
                    <CardDescription>Select your tickets and checkout</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Ticket Selection */}
                    <div className="space-y-3">
                        <Label>Select Tickets</Label>
                        {event.ticketTypes.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex-1">
                                    <div className="font-medium">{ticket.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        ${ticket.price} • {ticket.availableQuantity} available
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(ticket.id, -1)}
                                        disabled={!selectedTickets[ticket.id]}
                                    >
                                        -
                                    </Button>
                                    <span className="w-8 text-center font-medium">
                                        {selectedTickets[ticket.id] || 0}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleQuantityChange(ticket.id, 1)}
                                        disabled={ticket.availableQuantity === 0 || (selectedTickets[ticket.id] || 0) >= ticket.availableQuantity}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalTickets > 0 && (
                        <>
                            <Separator />

                            {/* Points */}
                            {userPoints > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="points">Use Points (Available: {userPoints})</Label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="points"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={pointsToUse === 0 ? '' : pointsToUse}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                // Only allow digits
                                                if (value === '' || /^\d+$/.test(value)) {
                                                    // Parse immediately to remove leading zeros
                                                    const numValue = value === '' ? 0 : parseInt(value, 10)
                                                    handlePointsChange(numValue.toString())
                                                }
                                            }}
                                            className="pl-10"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {conversionRate} points = $1 discount. Maximum: {Math.min(userPoints, Math.ceil(subtotal * conversionRate))} points
                                    </p>
                                </div>
                            )}

                            {/* Price Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'})</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {pointsToUse > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Points Discount</span>
                                        <span>-${pointsDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-amber-600">
                                    <span className="flex items-center gap-1">
                                        <Coins className="h-3 w-3" />
                                        Platform Fee
                                    </span>
                                    <span>{PLATFORM_FEE_POINTS} pts</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading || totalTickets === 0}
                    >
                        {isLoading ? (
                            "Processing..."
                        ) : (
                            <>
                                <Ticket className="h-4 w-4 mr-2" />
                                {totalAmount === 0 ? "Book Free Tickets" : `Pay $${totalAmount.toFixed(2)}`}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
