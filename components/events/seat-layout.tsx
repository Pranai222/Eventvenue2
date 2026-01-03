"use client"

import { useState, useMemo, useEffect } from "react"
import type { SeatLayout, EventSeat, SeatCategory } from "@/lib/types/booking"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Coins } from "lucide-react"

interface SeatLayoutProps {
    layout: SeatLayout
    onBookSeats: (seatIds: number[], pointsToUse: number) => Promise<void>
    maxSeats?: number
    isLoading?: boolean
    userPoints?: number
    conversionRate?: number
}

export function SeatLayoutComponent({
    layout,
    onBookSeats,
    maxSeats = 10,
    isLoading = false,
    userPoints = 0,
    conversionRate = 100  // 100 points = $1 by default
}: SeatLayoutProps) {
    const [selectedSeats, setSelectedSeats] = useState<number[]>([])
    const [pointsToUse, setPointsToUse] = useState(0)

    // Group seats by row
    const seatsByRow = useMemo(() => {
        const grouped: Record<string, EventSeat[]> = {}
        for (const seat of layout.seats) {
            if (!grouped[seat.rowLabel]) {
                grouped[seat.rowLabel] = []
            }
            grouped[seat.rowLabel].push(seat)
        }
        // Sort seats within each row
        for (const row of Object.keys(grouped)) {
            grouped[row].sort((a, b) => a.seatNumber - b.seatNumber)
        }
        return grouped
    }, [layout.seats])

    // Get category by ID
    const getCategoryById = (categoryId: number): SeatCategory | undefined => {
        return layout.categories.find(c => c.id === categoryId)
    }

    // Get all unique rows in order
    const orderedRows = useMemo(() => {
        const rows = new Set<string>()
        for (const category of layout.categories) {
            for (const row of category.rows) {
                rows.add(row)
            }
        }
        return Array.from(rows).sort()
    }, [layout.categories])

    // Calculate selected seats info
    const selectedSeatsInfo = useMemo(() => {
        const seats = layout.seats.filter(s => selectedSeats.includes(s.id))
        const total = seats.reduce((sum, s) => sum + s.price, 0)
        return { seats, total }
    }, [selectedSeats, layout.seats])

    // Points calculation
    const maxPointsUsable = useMemo(() => {
        const totalInPoints = Math.floor(selectedSeatsInfo.total * conversionRate)
        return Math.min(userPoints, totalInPoints)
    }, [selectedSeatsInfo.total, userPoints, conversionRate])

    const pointsDiscount = useMemo(() => {
        return pointsToUse / conversionRate
    }, [pointsToUse, conversionRate])

    const finalPrice = useMemo(() => {
        return Math.max(0, selectedSeatsInfo.total - pointsDiscount)
    }, [selectedSeatsInfo.total, pointsDiscount])

    // Reset points when seats change
    useEffect(() => {
        setPointsToUse(0)
    }, [selectedSeats])

    const handleSeatClick = (seat: EventSeat) => {
        if (seat.status !== 'AVAILABLE') return

        setSelectedSeats(prev => {
            if (prev.includes(seat.id)) {
                return prev.filter(id => id !== seat.id)
            }
            if (prev.length >= maxSeats) {
                return prev
            }
            return [...prev, seat.id]
        })
    }

    const handleBooking = async () => {
        if (selectedSeats.length === 0) return
        await onBookSeats(selectedSeats, pointsToUse)
    }

    // Get aisle positions for a category
    const getAislePositions = (categoryId: number): number[] => {
        const category = getCategoryById(categoryId)
        return category?.aisleAfter || []
    }

    return (
        <div className="space-y-6">
            {/* Screen/Stage indicator */}
            <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-t-full px-16 py-2 text-sm font-medium text-primary">
                    STAGE / SCREEN
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-green-500 rounded bg-white"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-green-500 rounded bg-green-500"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded bg-gray-200"></div>
                    <span>Sold</span>
                </div>
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                {layout.categories.map(category => (
                    <Badge
                        key={category.id}
                        variant="outline"
                        style={{ borderColor: category.color, color: category.color }}
                    >
                        {category.name} - ${category.price}
                    </Badge>
                ))}
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto pb-4">
                <div className="flex flex-col items-center gap-1 min-w-fit mx-auto">
                    {orderedRows.map(rowLabel => {
                        const rowSeats = seatsByRow[rowLabel] || []
                        if (rowSeats.length === 0) return null

                        const category = getCategoryById(rowSeats[0]?.categoryId)
                        const aisles = getAislePositions(rowSeats[0]?.categoryId)

                        return (
                            <div key={rowLabel} className="flex items-center gap-1">
                                {/* Row Label */}
                                <div className="w-8 text-center font-bold text-muted-foreground">
                                    {rowLabel}
                                </div>

                                {/* Seats */}
                                <div className="flex gap-1">
                                    {rowSeats.map((seat, index) => {
                                        const isSelected = selectedSeats.includes(seat.id)
                                        const isAvailable = seat.status === 'AVAILABLE'
                                        const isBooked = seat.status === 'BOOKED'
                                        const needsAisle = aisles.includes(seat.seatNumber)

                                        return (
                                            <div key={seat.id} className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSeatClick(seat)}
                                                    disabled={!isAvailable}
                                                    className={cn(
                                                        "w-8 h-8 rounded text-xs font-medium transition-all",
                                                        "flex items-center justify-center",
                                                        isAvailable && !isSelected && "border-2 bg-white hover:bg-green-50 cursor-pointer",
                                                        isSelected && "border-2 bg-green-500 text-white",
                                                        isBooked && "border-2 border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed",
                                                        !isAvailable && !isBooked && "border-2 border-amber-300 bg-amber-100 cursor-not-allowed"
                                                    )}
                                                    style={{
                                                        borderColor: isAvailable || isSelected ? category?.color || '#22c55e' : undefined
                                                    }}
                                                    title={`${rowLabel}${seat.seatNumber} - $${seat.price}`}
                                                >
                                                    {seat.seatNumber}
                                                </button>
                                                {/* Aisle gap */}
                                                {needsAisle && <div className="w-4" />}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Row Label (right side) */}
                                <div className="w-8 text-center font-bold text-muted-foreground">
                                    {rowLabel}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Selection Summary with Points */}
            <Card className="sticky bottom-4 bg-card/95 backdrop-blur">
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        {/* Selected Seats Info */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Selected: {selectedSeats.length} / {maxSeats} seats
                                </p>
                                {selectedSeatsInfo.seats.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedSeatsInfo.seats.map(s => `${s.rowLabel}${s.seatNumber}`).join(', ')}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold">
                                    Subtotal: ${selectedSeatsInfo.total.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Points Usage Section */}
                        {userPoints > 0 && selectedSeats.length > 0 && (
                            <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-primary" />
                                        <Label className="text-sm font-medium">Use Reward Points</Label>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Available: {userPoints.toLocaleString()} pts
                                    </span>
                                </div>

                                <Slider
                                    value={[pointsToUse]}
                                    onValueChange={(v) => setPointsToUse(v[0])}
                                    max={maxPointsUsable}
                                    step={conversionRate}
                                    className="w-full"
                                />

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Using: {pointsToUse.toLocaleString()} pts
                                    </span>
                                    <span className="font-medium text-green-600">
                                        -${pointsDiscount.toFixed(2)} discount
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {conversionRate} points = $1.00
                                </p>
                            </div>
                        )}

                        {/* Final Price and Book Button */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                    ${finalPrice.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">Final Total</p>
                            </div>
                            <Button
                                onClick={handleBooking}
                                disabled={selectedSeats.length === 0 || isLoading}
                                size="lg"
                            >
                                {isLoading ? "Booking..." : "Proceed to Book"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

