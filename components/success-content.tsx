"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Key, Clock, User } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentType, setPaymentType] = useState<"subscription" | "onetime" | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [key, setKey] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [nextBillingDate, setNextBillingDate] = useState<Date | null>(null)
  const [timeUntilRenewal, setTimeUntilRenewal] = useState<string>("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Success page - User:", user?.email || "No user")
    setUser(user)
  }

  useEffect(() => {
    if (user === null) return // Still loading

    const orderId = searchParams.get("order_id")
    const packageSize = searchParams.get("package")

    console.log("[v0] Success page params:", { orderId, packageSize, hasUser: !!user })

    if (orderId) {
      setPaymentType("onetime")
      setTransactionId(orderId)
      fetchOrderData(orderId, packageSize)
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!nextBillingDate) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = nextBillingDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeUntilRenewal("Renewing soon...")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilRenewal(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [nextBillingDate])

  async function fetchOrderData(orderId: string, packageSize: string | null) {
    if (!user) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const { data: purchase } = await supabase
      .from("account_purchases")
      .select("*")
      .eq("payment_id", orderId)
      .eq("user_id", user.id)
      .single()

    if (purchase && !purchase.accounts_delivered) {
      // Trigger account delivery
      await fetch("/api/deliver-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: purchase.id }),
      })

      // Fetch delivered accounts
      const { data: accounts } = await supabase
        .from("roblox_accounts")
        .select("*")
        .eq("claimed_by", user.id)
        .order("claimed_at", { ascending: false })
        .limit(purchase.package_size)

      setKey(`${purchase.package_size} Roblox Accounts Delivered`)
      setLoading(false)
    } else if (purchase) {
      setKey(`${purchase.package_size} Accounts Package`)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-card-elevated border-accent-blue/20">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-blue/10 mb-4">
              <User className="h-8 w-8 text-accent-blue" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
            <p className="text-muted-foreground mb-6">Sign up to save your purchase and access your keys anytime</p>
            <div className="flex flex-col gap-3">
              <Link href={`/signup?redirect=/success?${searchParams.toString()}`}>
                <Button className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white">Create Account</Button>
              </Link>
              <Link href={`/login?redirect=/success?${searchParams.toString()}`}>
                <Button variant="outline" className="w-full bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-card-elevated border-accent-blue/20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-blue border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading your purchase...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!key) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-card-elevated border-accent-blue/20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Purchase Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find your purchase. Please check your dashboard or contact support.
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white">Go to Dashboard</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-card-elevated border-accent-blue/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-blue/10 mb-4">
            <Check className="h-8 w-8 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Accounts Delivered!</h1>
          <p className="text-muted-foreground">Your Roblox accounts are ready to use</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-accent-blue" />
              <span className="text-sm font-medium">Package</span>
            </div>
            <div className="text-lg font-bold text-accent-blue">{key}</div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• All accounts are now available in your dashboard</p>
            <p>• You can copy credentials or download them as a text file</p>
            <p>• Keep your account credentials secure</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white">View Accounts</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
