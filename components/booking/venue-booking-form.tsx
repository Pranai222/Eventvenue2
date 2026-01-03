"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { bookingsApi } from "@/lib/api/bookings"
import { venuesApi } from "@/lib/api/venues"
import { useConversionRate } from "@/lib/contexts/conversion-rate-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Coins, Calendar } from "lucide-react"
import type { Venue } from "@/lib/types/booking"

interface VenueBookingFormProps {
  venue: Venue
  userPoints: number
}

export function VenueBookingForm({ venue, userPoints }: VenueBookingFormProps) {
  const router = useRouter()
  const { conversionRate, isLoading: rateLoading } = useConversionRate()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [usePoints, setUsePoints] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, days) * venue.pricePerDay
  }

  const total = calculateTotal()
  const pointsDiscount = usePoints ? pointsToUse / conversionRate : 0 // Dynamic conversion
  const finalTotal = Math.max(0, total - pointsDiscount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date")
      return
    }

    setIsLoading(true)
    const PLATFORM_FEE_POINTS = 2

    // Check if user has enough points for platform fee
    const totalPointsNeeded = (usePoints ? pointsToUse : 0) + PLATFORM_FEE_POINTS
    if (userPoints < totalPointsNeeded) {
      setError(`Not enough points. Need ${totalPointsNeeded} points (including ${PLATFORM_FEE_POINTS} platform fee) but you have ${userPoints}`)
      setIsLoading(false)
      return
    }

    try {
      // Check availability first
      const { available } = await venuesApi.checkAvailability(venue.id, startDate, endDate)

      if (!available) {
        setError("This venue is not available for the selected dates")
        setIsLoading(false)
        return
      }

      // Calculate duration in hours for backend
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const durationHours = Math.max(1, days) * 24 // Convert days to hours

      // ALWAYS use createWithPoints to ensure:
      // 1. Booking status = CONFIRMED
      // 2. Points transferred to vendor
      // 3. Platform fee (2 points) deducted
      const booking = await bookingsApi.createWithPoints({
        venueId: venue.id,
        bookingDate: startDate,
        durationHours,
        totalAmount: usePoints && pointsToUse > 0 ? finalTotal : total,
        pointsToUse: usePoints ? pointsToUse : 0
      })

      // Direct redirect - no alert
      router.push(`/user/bookings/${booking.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  const maxPointsToUse = Math.min(userPoints, Math.ceil(total * conversionRate))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Venue</CardTitle>
        <CardDescription>Select your dates and complete your booking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {/* Points Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="usePoints" checked={usePoints} onCheckedChange={(checked) => setUsePoints(!!checked)} />
                <Label htmlFor="usePoints" className="cursor-pointer">
                  Use Points
                </Label>
              </div>
              <div className="text-sm text-muted-foreground">
                <Coins className="h-4 w-4 inline mr-1" />
                {userPoints.toLocaleString()} available
              </div>
            </div>

            {usePoints && (
              <div className="space-y-2">
                <Label htmlFor="pointsToUse">Points to Use (Max: {maxPointsToUse})</Label>
                <Input
                  id="pointsToUse"
                  type="number"
                  min={0}
                  max={maxPointsToUse}
                  value={pointsToUse || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || /^\d+$/.test(val)) {
                      const numVal = val === "" ? 0 : parseInt(val, 10)
                      setPointsToUse(Math.min(maxPointsToUse, numVal))
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {conversionRate} points = $1 discount. Discount: ${pointsDiscount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {usePoints && pointsDiscount > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Points Discount</span>
                <span>-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-amber-600">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                Platform Fee
              </span>
              <span>2 pts</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Processing..." : `Confirm Booking - $${finalTotal.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
