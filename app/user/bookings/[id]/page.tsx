"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { bookingsApi } from "@/lib/api/bookings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, DollarSign, Coins, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import type { Booking } from "@/lib/types/booking"

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = Number(params.id)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await bookingsApi.getById(bookingId)
        setBooking(data)
      } catch (error) {
        console.error("[pranai] Failed to load booking:", error)
        router.push("/user/bookings")
      } finally {
        setIsLoading(false)
      }
    }
    loadBooking()
  }, [bookingId, router])

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return

    setIsCancelling(true)
    try {
      await bookingsApi.cancel(bookingId)
      setBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : null))
    } catch (error) {
      console.error("[pranai] Failed to cancel booking:", error)
      alert("Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusColor = {
    PENDING: "secondary",
    CONFIRMED: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  } as const

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
          <p className="text-muted-foreground">Booking #{booking.id}</p>
        </div>

        {/* Status Alert */}
        <Card className={booking.status === "CONFIRMED" ? "border-green-200 bg-green-50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Status</CardTitle>
                <CardDescription>
                  {booking.status === "CONFIRMED" && "Your booking is confirmed"}
                  {booking.status === "PENDING" && "Your booking is pending approval"}
                  {booking.status === "COMPLETED" && "Your booking has been completed"}
                  {booking.status === "CANCELLED" && "Your booking has been cancelled"}
                </CardDescription>
              </div>
              <Badge variant={statusColor[booking.status]}>{booking.status}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Booking Type</h3>
                <p className="text-muted-foreground">{booking.venueId ? `Venue Booking` : `Event Booking`}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Booking Date</h3>
                <p className="text-muted-foreground">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Check-in
                </h3>
                <p className="text-muted-foreground">
                  {new Date(booking.startDate).toLocaleDateString()}
                  {booking.checkInTime && ` at ${booking.checkInTime}`}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Check-out
                </h3>
                <p className="text-muted-foreground">
                  {booking.endDate
                    ? new Date(booking.endDate).toLocaleDateString()
                    : new Date(booking.startDate).toLocaleDateString()}
                  {booking.checkOutTime && ` at ${booking.checkOutTime}`}
                </p>
              </div>
            </div>

            {booking.durationHours && (
              <div>
                <h3 className="font-semibold mb-2">Duration</h3>
                <p className="text-muted-foreground">
                  {booking.durationHours} hour{booking.durationHours !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Subtotal</span>
              </div>
              <span className="font-semibold">${(booking.totalAmount + booking.pointsUsed * 0.1).toFixed(2)}</span>
            </div>

            {booking.pointsUsed > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-accent" />
                  <span>Points Discount</span>
                </div>
                <span className="font-semibold">-${(booking.pointsUsed * 0.1).toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-primary">${booking.totalAmount.toFixed(2)}</span>
            </div>

            {booking.pointsUsed > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{booking.pointsUsed.toLocaleString()}</span> points used for discount
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {booking.paymentStatus === "COMPLETED" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-semibold capitalize">{booking.paymentStatus}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {booking.status === "CONFIRMED" && (
          <div className="flex gap-4">
            <Button onClick={handleCancel} variant="destructive" disabled={isCancelling} className="flex-1">
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
            <Link href="/user/bookings" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Bookings
              </Button>
            </Link>
          </div>
        )}

        {booking.status !== "CONFIRMED" && (
          <Link href="/user/bookings" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Bookings
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
