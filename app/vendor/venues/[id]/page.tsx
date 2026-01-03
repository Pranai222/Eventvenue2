"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { venuesApi, type VenueData } from "@/lib/api/venues"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/ImageUpload"
import { AlertCircle, CheckCircle } from "lucide-react"
import LocationPicker from "@/components/location-picker"

export default function EditVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueId = Number(params.id)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    city: "",
    address: "",
    capacity: 0,
    pricePerHour: 0,
    amenities: "",
    images: [] as string[],
  })

  useEffect(() => {
    const loadVenue = async () => {
      try {
        const venue = await venuesApi.getById(venueId)
        setFormData({
          name: venue.name,
          description: venue.description,
          category: venue.category || "",
          city: venue.city,
          address: venue.address,
          capacity: venue.capacity,
          pricePerHour: venue.pricePerHour,
          amenities: venue.amenities?.join(", ") || "",
          images: venue.images || [],
        })
      } catch (err: any) {
        setError(err.message || "Failed to load venue")
      } finally {
        setIsLoading(false)
      }
    }
    loadVenue()
  }, [venueId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const venueData: Partial<VenueData> = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        city: formData.city,
        address: formData.address,
        capacity: Number(formData.capacity),
        pricePerHour: Number(formData.pricePerHour),
        amenities: formData.amenities,
        images: formData.images.join(','),
      }

      await venuesApi.update(venueId, venueData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/vendor/venues")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to update venue")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Venue</h1>
        <p className="text-muted-foreground">Update your venue information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venue Details</CardTitle>
          <CardDescription>Modify your venue information</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Venue updated successfully!</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <LocationPicker
              value={formData.address}
              onChange={(address) => setFormData({ ...formData, address })}
              label="Venue Location"
              placeholder="Enter venue address or click map icon to select"
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Price Per Hour ($)</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  value={formData.pricePerHour || ""}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: Number.parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              />
            </div>

            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              type="venues"
              label="Venue Images"
              maxImages={10}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
