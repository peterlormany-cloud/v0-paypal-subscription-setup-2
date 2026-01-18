"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, Copy, LogOut, Check, Key, XCircle, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type AccountPurchase = {
  id: string
  payment_id: string
  package_size: number
  amount: number
  status: string
  accounts_delivered: boolean
  created_at: string
}

type RobloxAccount = {
  id: string
  username: string
  password: string
  package_size: number
  claimed_at: string
}

type Props = {
  user: { id: string; email: string }
  accountPurchases: AccountPurchase[]
  accounts: RobloxAccount[]
}

export default function DashboardClient({ user, accountPurchases, accounts }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadAccounts = () => {
    const text = accounts.map((acc) => `${acc.username}:${acc.password}`).join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `roblox-accounts-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Users className="h-6 w-6 text-accent-blue" />
              <span className="font-semibold text-lg">ComboWick</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              {user.email === "peterlormany@gmail.com" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Roblox Accounts</h1>
          {accounts.length > 0 && (
            <Button onClick={downloadAccounts} variant="outline">
              Download All ({accounts.length})
            </Button>
          )}
        </div>

        {/* Account Purchases */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
          {accountPurchases.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No purchases yet</p>
              <Link href="/">
                <Button>Buy Accounts</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {accountPurchases.map((purchase) => (
                <Card key={purchase.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{purchase.package_size} Accounts Package</h3>
                      <p className="text-sm text-muted-foreground">
                        Purchased {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {purchase.accounts_delivered ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Delivered</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Processing</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xl font-bold">${purchase.amount}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Accounts List */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Accounts ({accounts.length})</h2>
          {accounts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No accounts yet</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {accounts.map((account) => (
                <Card key={account.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Username</p>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{account.username}</code>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Password</p>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{account.password}</code>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${account.username}:${account.password}`, account.id)}
                    >
                      {copied === account.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
