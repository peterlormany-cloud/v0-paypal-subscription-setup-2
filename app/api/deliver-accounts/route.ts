import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: "Purchase ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from("account_purchases")
      .select("*")
      .eq("id", purchaseId)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    if (purchase.accounts_delivered) {
      return NextResponse.json({ error: "Accounts already delivered" }, { status: 400 })
    }

    // Get unclaimed accounts matching package size
    const { data: accounts, error: accountsError } = await supabase
      .from("roblox_accounts")
      .select("*")
      .eq("package_size", purchase.package_size)
      .eq("is_claimed", false)
      .limit(purchase.package_size)

    if (accountsError || !accounts || accounts.length < purchase.package_size) {
      return NextResponse.json({ error: "Not enough accounts available" }, { status: 500 })
    }

    // Mark accounts as claimed and create delivery records
    const accountIds = accounts.map((acc) => acc.id)

    await supabase
      .from("roblox_accounts")
      .update({ is_claimed: true, claimed_by: purchase.user_id, claimed_at: new Date().toISOString() })
      .in("id", accountIds)

    // Create delivery records
    const deliveries = accountIds.map((accountId) => ({
      purchase_id: purchaseId,
      account_id: accountId,
    }))

    await supabase.from("account_deliveries").insert(deliveries)

    // Mark purchase as delivered
    await supabase.from("account_purchases").update({ accounts_delivered: true }).eq("id", purchaseId)

    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error("[v0] Error delivering accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
