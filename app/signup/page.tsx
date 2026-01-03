"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"
import { OtpVerificationForm } from "@/components/auth/otp-verification-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Gift, AlertCircle } from "lucide-react"

function SignupPageContent() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")
  const [mounted, setMounted] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"USER" | "VENDOR">(roleParam === "vendor" ? "VENDOR" : "USER")
  const [emailForOtp, setEmailForOtp] = useState<string | null>(null)
  const [signedUpRole, setSignedUpRole] = useState<"USER" | "VENDOR">("USER")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (roleParam && mounted) {
      setSelectedRole(roleParam === "vendor" ? "VENDOR" : "USER")
    }
  }, [roleParam, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (roleParam === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Signup Disabled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Admin accounts are pre-created in the database. Only admins can create new admin accounts.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">Please go to the login page to access your admin account.</p>
            <Link
              href="/login?role=admin"
              className="text-primary hover:underline text-sm font-medium block text-center"
            >
              Go to Admin Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSignupSuccess = (email: string, role: "USER" | "VENDOR") => {
    setEmailForOtp(email)
    setSignedUpRole(role)
  }

  if (emailForOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <OtpVerificationForm email={emailForOtp} role={signedUpRole} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="h-12 w-12 text-primary" />
          </div>
          {selectedRole === "USER" ? (
            <>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>Join EventVenue and start booking venues today</CardDescription>
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-accent/10 rounded-lg">
                <Gift className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-accent-foreground">Get 2000 bonus points on signup!</span>
              </div>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Become a Vendor</CardTitle>
              <CardDescription>List your venues and reach thousands of customers</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <SignupForm role={selectedRole} onSignupSuccess={(email) => handleSignupSuccess(email, selectedRole)} />

          <div className="text-center text-sm">
            {selectedRole === "USER" ? (
              <>
                Interested in becoming a vendor?{" "}
                <Link href="/signup?role=vendor" className="text-primary hover:underline">
                  Create vendor account
                </Link>
              </>
            ) : (
              <>
                Looking to book venues?{" "}
                <Link href="/signup?role=user" className="text-primary hover:underline">
                  Create user account
                </Link>
              </>
            )}
          </div>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href={`/login?role=${selectedRole.toLowerCase()}`} className="text-primary hover:underline">
              Sign in
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  )
}
