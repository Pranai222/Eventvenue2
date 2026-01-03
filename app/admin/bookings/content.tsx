"use client"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Users, DollarSign, Search } from "lucide-react"
import type { Booking } from "@/lib/types/booking"

export default function AdminBookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getAllBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.id.toString().includes(searchTerm) || booking.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default"
      case "PENDING":
        return "secondary"
      case "COMPLETED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">View and manage all platform bookings</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookings by ID or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bookings Table */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Booking ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">User ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Booking Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">#{booking.id}</td>
                    <td className="py-3 px-4 text-sm">{booking.userId}</td>
                    <td className="py-3 px-4 text-sm">
                      {booking.venueId ? "Venue" : booking.eventId ? "Event" : "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-sm">{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {booking.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant={booking.paymentStatus === "COMPLETED" ? "default" : "secondary"}>
                        {booking.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
                <p className="text-2xl font-bold">{bookings.filter((b) => b.status === "CONFIRMED").length}</p>
              </div>
              <Users className="h-8 w-8 text-secondary-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
