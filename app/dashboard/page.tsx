import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?redirect=/dashboard")
  }

  const supabase = await createClient()

  const { data: accountPurchases } = await supabase
    .from("account_purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: accounts } = await supabase
    .from("roblox_accounts")
    .select("*")
    .eq("claimed_by", user.id)
    .order("claimed_at", { ascending: false })

  return <DashboardClient user={user} accountPurchases={accountPurchases || []} accounts={accounts || []} />
}
