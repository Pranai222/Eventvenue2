"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { authApi } from "@/lib/api/auth"
import { useConversionRate } from "@/lib/contexts/conversion-rate-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VendorBuyCreditsModal } from "@/components/payment/vendor-buy-credits-modal"
import {
    Coins, CreditCard, TrendingUp, TrendingDown, History,
    ArrowUpRight, ArrowDownRight, Clock, ChevronRight, Wallet,
    Sparkles, Zap, Shield, DollarSign, Activity, Building2, Award,
    ArrowRightLeft, Banknote, CheckCircle2, AlertCircle
} from "lucide-react"

interface VendorProfile {
    id?: number
    vendorId?: number
    email: string
    businessName?: string
    points?: number
}

export default function VendorTransactionsPage() {
    const { user } = useAuth()
    const { conversionRate } = useConversionRate()
    const [profile, setProfile] = useState<VendorProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showBuyModal, setShowBuyModal] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [withdrawLoading, setWithdrawLoading] = useState(false)
    const [withdrawSuccess, setWithdrawSuccess] = useState(false)
    const [withdrawError, setWithdrawError] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const profileData = await authApi.getVendorProfile()
            setProfile(profileData as VendorProfile)
        } catch (error) {
            console.error("Failed to load data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const refreshData = () => {
        loadData()
    }

    const points = profile?.points || 0
    const pointsValue = points / conversionRate

    // Calculate points to INR based on conversion rate
    const getMoneyValue = (pts: number) => {
        return (pts / conversionRate).toFixed(2)
    }

    const handleWithdraw = async () => {
        const pointsToWithdraw = parseInt(withdrawAmount)
        if (isNaN(pointsToWithdraw) || pointsToWithdraw <= 0) {
            setWithdrawError("Please enter a valid amount")
            return
        }
        if (pointsToWithdraw > points) {
            setWithdrawError("Insufficient points")
            return
        }

        setWithdrawLoading(true)
        setWithdrawError("")

        try {
            // Simulate withdrawal API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // In production, call actual API
            // await api.withdrawPoints(pointsToWithdraw)

            setWithdrawSuccess(true)
            setTimeout(() => {
                setShowWithdrawModal(false)
                setWithdrawSuccess(false)
                setWithdrawAmount("")
                refreshData()
            }, 2000)
        } catch (error) {
            setWithdrawError("Failed to process withdrawal. Please try again.")
        } finally {
            setWithdrawLoading(false)
        }
    }

    const withdrawMoneyValue = withdrawAmount ? getMoneyValue(parseInt(withdrawAmount) || 0) : "0.00"

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Premium Header */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 p-8">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Wallet className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white">
                            Vendor Transactions
                        </h1>
                    </div>
                    <p className="text-teal-200/80 text-lg max-w-xl">
                        Manage your earnings, buy credits, and convert points to real money
                    </p>
                </div>
            </div>

            {/* Points Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm shadow-lg shadow-emerald-500/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                <Coins className="h-4 w-4 text-emerald-600" />
                            </div>
                            Available Points
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-emerald-600 tracking-tight mb-1">
                            {points.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            ≈ ₹{pointsValue.toFixed(2)} INR value
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-sm shadow-lg shadow-blue-500/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                            Conversion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-blue-600 tracking-tight mb-1">
                            {conversionRate}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Points per ₹1 INR
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-sm shadow-lg shadow-amber-500/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/20 rounded-lg">
                                <Banknote className="h-4 w-4 text-amber-600" />
                            </div>
                            Withdrawable
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-amber-600 tracking-tight mb-1">
                            ₹{pointsValue.toFixed(0)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Convert to cash anytime
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions - Buy & Withdraw */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Buy Credits Card */}
                <Card className="border-2 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                <CreditCard className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Buy Credits</CardTitle>
                                <CardDescription className="text-base">Top up your points instantly</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <div className="bg-muted/50 p-4 rounded-xl space-y-3 border">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Payment Method
                                </span>
                                <span className="font-medium">Credit/Debit Card</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Processing
                                </span>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Instant</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Powered by</span>
                                <span className="font-semibold text-emerald-600">Stripe</span>
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                            onClick={() => setShowBuyModal(true)}
                        >
                            <CreditCard className="h-5 w-5 mr-2" />
                            Buy Credits Now
                        </Button>
                        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                            <Shield className="h-3 w-3" />
                            Secure payment • SSL encrypted
                        </p>
                    </CardContent>
                </Card>

                {/* Withdraw to Bank Card */}
                <Card className="border-2 hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                <Banknote className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Withdraw to Bank</CardTitle>
                                <CardDescription className="text-base">Convert points to real money</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <div className="bg-muted/50 p-4 rounded-xl space-y-3 border">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Your Balance</span>
                                <span className="font-bold text-emerald-600">{points.toLocaleString()} points</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Withdrawable Amount</span>
                                <span className="font-bold text-amber-600">₹{pointsValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Processing Time
                                </span>
                                <span className="font-medium">2-3 Business Days</span>
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25"
                            onClick={() => setShowWithdrawModal(true)}
                            disabled={points < conversionRate}
                        >
                            <Banknote className="h-5 w-5 mr-2" />
                            Withdraw Money
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Minimum withdrawal: ₹1 ({conversionRate} points)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* How It Works - Info Section */}
            <Card className="mb-8 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border-2 border-teal-200 dark:border-teal-800/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-teal-600" />
                        How Point Conversion Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-teal-500/20 rounded-lg">
                                <Award className="h-5 w-5 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-teal-900 dark:text-teal-100">Earn Points</h4>
                        </div>
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                            Receive points from every booking made at your venue or event
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-teal-500/20 rounded-lg">
                                <ArrowRightLeft className="h-5 w-5 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-teal-900 dark:text-teal-100">Convert</h4>
                        </div>
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                            Convert {conversionRate} points = ₹1 INR based on current rate
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-teal-500/20 rounded-lg">
                                <Banknote className="h-5 w-5 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-teal-900 dark:text-teal-100">Withdraw</h4>
                        </div>
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                            Transfer money directly to your bank account
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Platform Fees Info */}
            <Card className="mb-8 border-2 border-orange-200 dark:border-orange-800/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                        Platform Fees
                    </CardTitle>
                    <CardDescription>Points required for creating venues and events</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 className="h-6 w-6 text-orange-600" />
                                <span className="font-semibold">Create Venue</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">10 Points</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="h-6 w-6 text-orange-600" />
                                <span className="font-semibold">Event (Quantity)</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">10 Points</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="h-6 w-6 text-orange-600" />
                                <span className="font-semibold">Event (Seat-based)</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">20 Points</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vendor Buy Credits Modal */}
            <VendorBuyCreditsModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                vendorId={profile?.vendorId || profile?.id || 0}
                onSuccess={refreshData}
            />

            {/* Withdraw Modal */}
            <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-amber-600" />
                            Withdraw to Bank
                        </DialogTitle>
                        <DialogDescription>
                            Convert your points to real money and withdraw to your bank account
                        </DialogDescription>
                    </DialogHeader>

                    {withdrawSuccess ? (
                        <div className="py-8 text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-green-600 mb-2">Withdrawal Initiated!</h3>
                            <p className="text-muted-foreground">Your withdrawal request is being processed.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 py-4">
                                <div className="bg-muted/50 p-4 rounded-xl space-y-2 border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Available Balance</span>
                                        <span className="font-bold">{points.toLocaleString()} points</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Conversion Rate</span>
                                        <span className="font-medium">{conversionRate} points = ₹1</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="withdrawAmount">Points to Withdraw</Label>
                                    <Input
                                        id="withdrawAmount"
                                        type="number"
                                        placeholder="Enter points amount"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        max={points}
                                    />
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 dark:text-amber-200 font-medium">You will receive</span>
                                        <span className="text-2xl font-bold text-amber-600">₹{withdrawMoneyValue}</span>
                                    </div>
                                </div>

                                {withdrawError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{withdrawError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleWithdraw}
                                    disabled={withdrawLoading || !withdrawAmount}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600"
                                >
                                    {withdrawLoading ? "Processing..." : "Confirm Withdrawal"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
