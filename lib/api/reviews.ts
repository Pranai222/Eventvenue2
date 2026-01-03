import { apiClient } from "./client"

export interface ReviewData {
  id?: number
  userId?: number
  userName?: string
  userEmail?: string
  venueId?: number
  venueName?: string
  eventId?: number
  eventName?: string
  vendorId?: number
  vendorName?: string
  rating: number // 1-5
  comment: string
  createdAt?: string
  updatedAt?: string
}

export interface ReviewsResponse {
  reviews: ReviewData[]
  averageRating: number
  totalReviews: number
}

export interface CanReviewResponse {
  canReview: boolean
  hasBooked: boolean
  hasReviewed: boolean
}

export const reviewsApi = {
  // Create a review
  create: async (data: Omit<ReviewData, "id" | "userId">) =>
    apiClient.post<ReviewData>("/api/reviews", data),

  // Check if user can review
  canReviewVenue: async (venueId: number) =>
    apiClient.get<CanReviewResponse>(`/api/reviews/can-review/venue/${venueId}`),

  canReviewEvent: async (eventId: number) =>
    apiClient.get<CanReviewResponse>(`/api/reviews/can-review/event/${eventId}`),

  // Get reviews
  getById: async (id: number) =>
    apiClient.get<ReviewData>(`/api/reviews/${id}`),

  getVenueReviews: async (venueId: number) =>
    apiClient.get<ReviewsResponse>(`/api/reviews/venue/${venueId}`),

  getEventReviews: async (eventId: number) =>
    apiClient.get<ReviewsResponse>(`/api/reviews/event/${eventId}`),

  getVenueAverageRating: async (venueId: number) =>
    apiClient.get<number>(`/api/reviews/venue/${venueId}/average`),

  getEventAverageRating: async (eventId: number) =>
    apiClient.get<number>(`/api/reviews/event/${eventId}/average`),

  // User's reviews
  getMyReviews: async () =>
    apiClient.get<ReviewData[]>("/api/reviews/user/my-reviews"),

  // Vendor's reviews
  getVendorReviews: async () =>
    apiClient.get<ReviewData[]>("/api/reviews/vendor/my-reviews"),

  // Update review (owner only)
  update: async (id: number, data: Partial<ReviewData>) =>
    apiClient.put<ReviewData>(`/api/reviews/${id}`, data),

  // Delete review (owner)
  delete: async (id: number) =>
    apiClient.delete(`/api/reviews/${id}`),

  // Vendor delete review
  vendorDelete: async (id: number) =>
    apiClient.delete(`/api/reviews/vendor/${id}`),

  // Admin delete review
  adminDelete: async (id: number) =>
    apiClient.delete(`/api/reviews/admin/${id}`),
}

export default reviewsApi

