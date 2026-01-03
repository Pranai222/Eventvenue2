"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Star, MessageSquare, Calendar, User, AlertCircle } from "lucide-react"
import type { Review } from "@/lib/types/booking"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Direct API calls for reviews (backend doesn't have /api/admin/reviews)
const reviewsApi = {
    getAllReviews: async (): Promise<Review[]> => {
        try {
            // Try to get all reviews - may need admin endpoint created
            const response = await apiClient.get<any>("/api/reviews")
            if (response && typeof response === 'object' && 'data' in response) {
                return Array.isArray(response.data) ? response.data : []
            }
            return Array.isArray(response) ? response : []
        } catch (err) {
            console.error("[EventVenue] Error fetching reviews:", err)
            return []
        }
    },
    deleteReview: async (id: number) => {
        await apiClient.delete(`/api/reviews/${id}`)
    }
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null)

    useEffect(() => {
        loadReviews()
    }, [])

    const loadReviews = async () => {
        try {
            console.log("[EventVenue] Loading reviews...")
            const data = await reviewsApi.getAllReviews()
            console.log("[EventVenue] Reviews loaded:", data)
            setReviews(data)
            setError(null)
        } catch (err: any) {
            console.error("[EventVenue] Failed to load reviews:", err)
            setError(err.message || "Failed to load reviews")
            setReviews([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteReviewId) return

        try {
            console.log("[EventVenue] Deleting review:", deleteReviewId)
            await reviewsApi.deleteReview(deleteReviewId)
            setReviews(reviews.filter((r) => r.id !== deleteReviewId))
            setDeleteReviewId(null)
        } catch (error: any) {
            console.error("[EventVenue] Failed to delete review:", error)
            alert("Failed to delete review: " + (error.message || "Unknown error"))
        }
    }

    const filteredReviews = reviews.filter((review) => {
        const searchLower = searchTerm.toLowerCase()
        return (
            review.comment?.toLowerCase().includes(searchLower) ||
            review.id.toString().includes(searchLower)
        )
    })

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        )
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Review Management</h1>
                    <p className="text-muted-foreground">Manage and moderate user reviews</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{reviews.length}</div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search reviews by content or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviews.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reviews.length > 0
                                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                                : "0.0"}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Venue Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reviews.filter((r) => r.venueId).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">
                                {reviews.length === 0 ? "No reviews yet" : "No reviews found"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                {renderStars(review.rating)}
                                                <Badge variant="outline">ID: {review.id}</Badge>
                                                {review.venueId && (
                                                    <Badge variant="secondary">Venue ID: {review.venueId}</Badge>
                                                )}
                                                {review.eventId && (
                                                    <Badge variant="secondary">Event ID: {review.eventId}</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>User ID: {review.userId}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeleteReviewId(review.id)}
                                            className="gap-2 text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-sm leading-relaxed">{review.comment}</p>
                                        </div>
                                    )}

                                    {/* Helpful Count */}
                                    {review.helpfulCount > 0 && (
                                        <div className="text-sm text-muted-foreground">
                                            {review.helpfulCount} {review.helpfulCount === 1 ? "person" : "people"} found this helpful
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
