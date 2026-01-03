"use client"

import { useEffect, useState } from "react"
import { bookingsApi } from "@/lib/api/bookings"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign } from "lucide-react"
import type { Booking } from "@/lib/types/booking"

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    bookingsApi
      .getVendorBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const pendingBookings = bookings.filter((b) => b.status === "PENDING")
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED")

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Booking #{booking.id}</h3>
                  <Badge
                    variant={
                      booking.status === "CONFIRMED"
                        ? "default"
                        : booking.status === "PENDING"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-accent">
                    <DollarSign className="h-5 w-5" />
                    {booking.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mt-3">
                <div>
                  <strong>Type:</strong> {booking.venueId ? "Venue Booking" : "Event Booking"}
                </div>
                <div>
                  <strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()}
                  {booking.endDate && ` - ${new Date(booking.endDate).toLocaleDateString()}`}
                </div>
                <div>
                  <strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                </div>
                {booking.pointsUsed > 0 && (
                  <div>
                    <strong>Points used:</strong> {booking.pointsUsed}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">View and manage customer bookings</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No pending bookings</p>
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No confirmed bookings</p>
              </CardContent>
            </Card>
          ) : (
            confirmedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No completed bookings</p>
              </CardContent>
            </Card>
          ) : (
            completedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
