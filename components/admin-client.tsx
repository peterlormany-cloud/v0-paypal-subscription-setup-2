"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Users, Package, Plus, Trash2, LogOut, Home } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type StockCounts = {
  stock25: number
  stock50: number
  stock100: number
}

type Purchase = {
  id: string
  customer_email: string
  package_size: number
  amount: number
  status: string
  accounts_delivered: boolean
  created_at: string
}

type Account = {
  id: string
  username: string
  password: string
  package_size: number
  is_claimed: boolean
  claimed_by: string | null
  created_at: string
}

type Props = {
  user: { id: string; email: string }
  stockCounts: StockCounts
  recentPurchases: Purchase[]
  allAccounts: Account[]
}

export default function AdminClient({ user, stockCounts, recentPurchases, allAccounts }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [packageSize, setPackageSize] = useState<25 | 50 | 100>(25)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const { error } = await supabase.from("roblox_accounts").insert({
      username,
      password,
      package_size: packageSize,
      is_claimed: false,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage("Account added successfully!")
      setUsername("")
      setPassword("")
      router.refresh()
    }

    setLoading(false)
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return

    const supabase = createClient()
    const { error } = await supabase.from("roblox_accounts").delete().eq("id", id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      router.refresh()
    }
  }

  const totalStock = stockCounts.stock25 + stockCounts.stock50 + stockCounts.stock100
  const unclaimedAccounts = allAccounts.filter((acc) => !acc.is_claimed)
  const claimedAccounts = allAccounts.filter((acc) => acc.is_claimed)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="font-semibold text-lg">Admin Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stock Stats */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Stock Levels</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6 bg-card-elevated">
              <div className="flex items-center justify-between mb-2">
                <Package className="h-5 w-5 text-accent-blue" />
                <span className="text-2xl font-bold">{totalStock}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Stock</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-accent-blue" />
                <span className="text-2xl font-bold">{stockCounts.stock25}</span>
              </div>
              <p className="text-sm text-muted-foreground">25 Package Stock</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-accent-green" />
                <span className="text-2xl font-bold">{stockCounts.stock50}</span>
              </div>
              <p className="text-sm text-muted-foreground">50 Package Stock</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{stockCounts.stock100}</span>
              </div>
              <p className="text-sm text-muted-foreground">100 Package Stock</p>
            </Card>
          </div>
        </section>

        {/* Add Account Form */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Add New Account</h2>
          <Card className="p-6">
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Roblox username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Account password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Package Size</Label>
                  <select
                    id="package"
                    value={packageSize}
                    onChange={(e) => setPackageSize(Number(e.target.value) as 25 | 50 | 100)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {message && (
                <div
                  className={`text-sm ${message.includes("Error") ? "text-destructive" : "text-accent-green"}`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" disabled={loading} className="bg-accent-blue hover:bg-accent-blue/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </form>
          </Card>
        </section>

        {/* Recent Purchases */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
          <Card className="p-6">
            <div className="space-y-3">
              {recentPurchases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchases yet</p>
              ) : (
                recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <p className="font-medium">{purchase.customer_email}</p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.package_size} accounts - ${purchase.amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-medium ${purchase.accounts_delivered ? "text-green-500" : "text-yellow-500"}`}
                      >
                        {purchase.accounts_delivered ? "Delivered" : "Pending"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        {/* Account Management */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            All Accounts ({unclaimedAccounts.length} unclaimed, {claimedAccounts.length} claimed)
          </h2>
          <Card className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No accounts in database</p>
              ) : (
                allAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between p-3 rounded border ${
                      account.is_claimed ? "bg-muted/30 border-border" : "bg-background border-accent-blue/20"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <code className="text-sm font-mono">{account.username}</code>
                        <code className="text-sm font-mono text-muted-foreground">{account.password}</code>
                        <span className="text-xs bg-accent-blue/10 text-accent-blue px-2 py-1 rounded">
                          Package: {account.package_size}
                        </span>
                        {account.is_claimed && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Claimed</span>
                        )}
                      </div>
                    </div>
                    {!account.is_claimed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
