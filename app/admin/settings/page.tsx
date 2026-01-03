"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/api/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Coins } from "lucide-react"

export default function AdminSettingsPage() {
  const [conversionRate, setConversionRate] = useState(1)
  const [newRate, setNewRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    adminApi
      .getConversionRate()
      .then((data) => {
        setConversionRate(data.pointsPerDollar)
        setNewRate(data.pointsPerDollar)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsSaving(true)

    try {
      await adminApi.updateConversionRate(newRate)
      setConversionRate(newRate)
      setMessage({ type: "success", text: "Conversion rate updated successfully!" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update conversion rate" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>

        {/* Points Conversion Rate */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              <CardTitle>Points Conversion Rate</CardTitle>
            </div>
            <CardDescription>Set how many points equal one dollar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="rate">Points per $1</Label>
                <Input
                  id="rate"
                  type="number"
                  min={1}
                  value={newRate || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || /^\d+$/.test(val)) {
                      setNewRate(val === "" ? 0 : parseInt(val, 10))
                    }
                  }}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Current rate: {conversionRate} points = $1 | With new rate: {newRate} points = $1
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Examples with new rate:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {newRate * 10} points = $10</li>
                  <li>• {newRate * 50} points = $50</li>
                  <li>• {newRate * 100} points = $100</li>
                </ul>
              </div>

              <Button type="submit" disabled={isSaving || newRate === conversionRate}>
                {isSaving ? "Updating..." : "Update Conversion Rate"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Other Settings Placeholders */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Additional system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Additional configuration options can be added here such as:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Commission rates for vendors</li>
                <li>Booking cancellation policies</li>
                <li>Email notification templates</li>
                <li>Featured listing pricing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
