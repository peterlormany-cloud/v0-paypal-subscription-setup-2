"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Users, Shield, Zap, User, LogOut, Key } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    paypal_onetime?: any
    paypal_subscriptions?: any
  }
}

export default function RobloxAccountShop() {
  const [selectedPackage, setSelectedPackage] = useState<25 | 50 | 100>(25)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [clientId, setClientId] = useState<string>("")
  const [planId, setPlanId] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState<"subscription" | "onetime">("subscription")

  useEffect(() => {
    checkUser()
    fetchConfig()
  }, [])

  async function fetchConfig() {
    const response = await fetch("/api/paypal/config")
    const data = await response.json()
    setClientId(data.clientId)
    setPlanId(data.planId)
  }

  async function checkUser() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    if (loading || !clientId || paypalLoaded) return

    const onetimeScript = document.createElement("script")
    onetimeScript.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&intent=capture`
    onetimeScript.setAttribute("data-namespace", "paypal_onetime")
    onetimeScript.async = true

    onetimeScript.onload = () => {
      setPaypalLoaded(true)
      setTimeout(renderButtons, 100)
    }

    document.body.appendChild(onetimeScript)

    return () => {
      if (document.body.contains(onetimeScript)) document.body.removeChild(onetimeScript)
    }
  }, [loading, clientId, paypalLoaded, selectedPackage])

  const renderButtons = () => {
    const packagePrices = { 25: 6, 50: 11, 100: 20 }
    const price = packagePrices[selectedPackage]

    const container25 = document.querySelector("#paypal-button-25")
    const container50 = document.querySelector("#paypal-button-50")
    const container100 = document.querySelector("#paypal-button-100")

    if (container25) container25.innerHTML = ""
    if (container50) container50.innerHTML = ""
    if (container100) container100.innerHTML = ""

    const renderPackageButton = (packageSize: 25 | 50 | 100, containerId: string) => {
      const container = document.querySelector(containerId)
      if (!window.paypal_onetime || !container) return

      window.paypal_onetime
        .Buttons({
          style: {
            color: "blue",
            shape: "rect",
            label: "paypal",
          },
          createOrder: (data: any, actions: any) =>
            actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: packagePrices[packageSize].toString(),
                  },
                  description: `${packageSize} Roblox Accounts Package`,
                },
              ],
              payer: user
                ? {
                    email_address: user.email,
                  }
                : undefined,
              application_context: {
                shipping_preference: "NO_SHIPPING",
                return_url: `${window.location.origin}/success`,
              },
            }),
          onApprove: async (data: any, actions: any) => {
            await actions.order.capture()

            if (user) {
              const supabase = createClient()

              const { error } = await supabase.from("account_purchases").insert({
                payment_id: data.orderID,
                payment_type: "onetime",
                package_size: packageSize,
                amount: packagePrices[packageSize],
                currency: "USD",
                status: "completed",
                customer_email: user.email,
                user_id: user.id,
                accounts_delivered: false,
              })

              if (error) {
                console.error("[v0] Error creating purchase:", error)
              }
            }

            window.location.href = `/success?order_id=${data.orderID}&package=${packageSize}`
          },
          onError: (err: any) => {
            console.error("[v0] PayPal payment error:", err)
            alert("Something went wrong with PayPal. Please try again.")
          },
        })
        .render(containerId)
    }

    renderPackageButton(25, "#paypal-button-25")
    renderPackageButton(50, "#paypal-button-50")
    renderPackageButton(100, "#paypal-button-100")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-accent-blue" />
              <span className="font-semibold text-lg">ComboWick</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {user.email === "peterlormany@gmail.com" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-balance">
            Premium Roblox Account Packages
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Get instant access to verified Roblox accounts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className={`p-6 transition-all ${
              selectedPackage === 25
                ? "bg-card-elevated border-accent-blue ring-2 ring-accent-blue/50"
                : "bg-card border-border"
            }`}
          >
            <div className="text-center mb-6">
              <div className="text-sm font-semibold text-accent-blue mb-2">STARTER</div>
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$6</span>
              </div>
              <p className="text-2xl font-bold mb-1">25 Accounts</p>
              <p className="text-sm text-muted-foreground">$0.24 per account</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: Zap, text: "Instant delivery" },
                { icon: Shield, text: "Verified accounts" },
                { icon: Check, text: "One-time payment" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-blue/10">
                    <feature.icon className="h-3 w-3 text-accent-blue" />
                  </div>
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {user ? (
              <div id="paypal-button-25" className="min-h-[45px]"></div>
            ) : (
              <Link href="/login">
                <Button className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white">Login to Buy</Button>
              </Link>
            )}
          </Card>

          <Card
            className={`p-6 transition-all ${
              selectedPackage === 50
                ? "bg-card-elevated border-accent-blue ring-2 ring-accent-blue/50 scale-105"
                : "bg-card border-border"
            }`}
          >
            <div className="text-center mb-6">
              <div className="text-sm font-semibold text-accent-green mb-2">POPULAR</div>
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$11</span>
              </div>
              <p className="text-2xl font-bold mb-1">50 Accounts</p>
              <p className="text-sm text-muted-foreground">$0.22 per account</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: Zap, text: "Instant delivery" },
                { icon: Shield, text: "Verified accounts" },
                { icon: Check, text: "Best value" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-green/10">
                    <feature.icon className="h-3 w-3 text-accent-green" />
                  </div>
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {user ? (
              <div id="paypal-button-50" className="min-h-[45px]"></div>
            ) : (
              <Link href="/login">
                <Button className="w-full bg-accent-green hover:bg-accent-green/90 text-white">Login to Buy</Button>
              </Link>
            )}
          </Card>

          <Card
            className={`p-6 transition-all ${
              selectedPackage === 100
                ? "bg-card-elevated border-accent-blue ring-2 ring-accent-blue/50"
                : "bg-card border-border"
            }`}
          >
            <div className="text-center mb-6">
              <div className="text-sm font-semibold text-purple-500 mb-2">PRO</div>
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$20</span>
              </div>
              <p className="text-2xl font-bold mb-1">100 Accounts</p>
              <p className="text-sm text-muted-foreground">$0.20 per account</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: Zap, text: "Instant delivery" },
                { icon: Shield, text: "Verified accounts" },
                { icon: Check, text: "Bulk discount" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                    <feature.icon className="h-3 w-3 text-purple-500" />
                  </div>
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {user ? (
              <div id="paypal-button-100" className="min-h-[45px]"></div>
            ) : (
              <Link href="/login">
                <Button className="w-full bg-purple-500 hover:bg-purple-500/90 text-white">Login to Buy</Button>
              </Link>
            )}
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Secure payments powered by PayPal</p>
          <div className="flex items-center justify-center gap-6 opacity-50">
            <Shield className="h-5 w-5" />
            <span className="text-sm">SSL Encrypted</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Instant Delivery</span>
          </div>
        </div>
      </main>
    </div>
  )
}
