import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import AdminClient from "@/components/admin-client"

const ADMIN_EMAIL = "peterlormany@gmail.com"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/")
  }

  const supabase = await createClient()

  // Get stock counts
  const { data: stock25Data, count: stock25Count } = await supabase
    .from("roblox_accounts")
    .select("id", { count: "exact" })
    .eq("package_size", 25)
    .eq("is_claimed", false)

  const { data: stock50Data, count: stock50Count } = await supabase
    .from("roblox_accounts")
    .select("id", { count: "exact" })
    .eq("package_size", 50)
    .eq("is_claimed", false)

  const { data: stock100Data, count: stock100Count } = await supabase
    .from("roblox_accounts")
    .select("id", { count: "exact" })
    .eq("package_size", 100)
    .eq("is_claimed", false)

  // Get recent purchases
  const { data: recentPurchases } = await supabase
    .from("account_purchases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get all accounts (for management)
  const { data: allAccounts } = await supabase
    .from("roblox_accounts")
    .select("*")
    .order("created_at", { ascending: false })

  const stock25 = stock25Data;
  const stock50 = stock50Data;
  const stock100 = stock100Data;

  return (
    <AdminClient
      user={user}
      stockCounts={{
        stock25: stock25Count || 0,
        stock50: stock50Count || 0,
        stock100: stock100Count || 0,
      }}
      recentPurchases={recentPurchases || []}
      allAccounts={allAccounts || []}
    />
  )
}
