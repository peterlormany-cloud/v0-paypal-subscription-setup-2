import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyWebhookSignature, generateAccessKey } from "@/lib/paypal"

export async function GET() {
  return NextResponse.json(
    {
      error: "Method Not Allowed",
      message: "This endpoint only accepts POST requests from PayPal webhooks",
      info: "Configure your PayPal webhook to point to this URL",
    },
    { status: 405 },
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Webhook received - Event Type:", body.event_type)
    console.log("[v0] Full webhook body:", JSON.stringify(body, null, 2))

    const headers = {
      "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
      "paypal-cert-url": request.headers.get("paypal-cert-url") || "",
      "paypal-transmission-id": request.headers.get("paypal-transmission-id") || "",
      "paypal-transmission-sig": request.headers.get("paypal-transmission-sig") || "",
      "paypal-transmission-time": request.headers.get("paypal-transmission-time") || "",
    }

    if (process.env.NODE_ENV === "production" && process.env.PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyWebhookSignature(body, headers)
      if (!isValid) {
        console.error("[v0] Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const supabase = await createClient()
    const { event_type, resource } = body

    async function getUserIdByEmail(email: string | undefined): Promise<string | null> {
      if (!email) {
        console.log("[v0] No email provided for user lookup")
        return null
      }

      console.log("[v0] Looking up user by email:", email)
      const {
        data: { users },
        error,
      } = await supabase.auth.admin.listUsers()

      if (error) {
        console.error("[v0] Error listing users:", error)
        return null
      }

      const user = users.find((u) => u.email === email)
      console.log("[v0] User found:", user ? `ID: ${user.id}` : "No user found")
      return user?.id || null
    }

    if (event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const subscriptionId = resource.id
      const planId = resource.plan_id
      const nextBillingTime = resource.billing_info?.next_billing_time
      const email = resource.subscriber?.email_address

      console.log("[v0] Processing subscription activation:", {
        subscriptionId,
        planId,
        email,
        nextBillingTime,
      })

      const accessKey = generateAccessKey()
      const userId = await getUserIdByEmail(email)

      console.log("[v0] Generated access key:", accessKey)
      console.log("[v0] User ID for subscription:", userId || "No user ID (guest)")

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          subscription_id: subscriptionId,
          plan_id: planId,
          status: "active",
          customer_email: email,
          access_key: accessKey,
          next_billing_date: nextBillingTime,
          last_payment_date: new Date().toISOString(),
          user_id: userId,
        })
        .select()

      if (error) {
        console.error("[v0] Error inserting subscription:", error)
      } else {
        console.log("[v0] Subscription inserted successfully:", data)
      }
    }

    if (event_type === "PAYMENT.SALE.COMPLETED") {
      const saleId = resource.id
      const amount = resource.amount?.total
      const currency = resource.amount?.currency
      const billingAgreementId = resource.billing_agreement_id
      const email = resource.payer?.email_address

      console.log("[v0] Processing sale completion:", {
        saleId,
        amount,
        currency,
        billingAgreementId,
        email,
      })

      const userId = await getUserIdByEmail(email)

      if (billingAgreementId) {
        console.log("[v0] Updating subscription payment for:", billingAgreementId)
        const { error } = await supabase
          .from("subscriptions")
          .update({
            last_payment_date: new Date().toISOString(),
            status: "active",
          })
          .eq("subscription_id", billingAgreementId)

        if (error) {
          console.error("[v0] Error updating subscription payment:", error)
        }
      }

      const accessKey = generateAccessKey()
      const { data, error } = await supabase
        .from("purchases")
        .insert({
          payment_id: saleId,
          payment_type: billingAgreementId ? "subscription" : "onetime",
          amount: Number.parseFloat(amount),
          currency: currency,
          status: "completed",
          customer_email: email,
          access_key: accessKey,
          paypal_data: resource,
          user_id: userId,
        })
        .select()

      if (error) {
        console.error("[v0] Error inserting purchase:", error)
      } else {
        console.log("[v0] Purchase inserted successfully:", data)
      }
    }

    if (event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subscriptionId = resource.id
      console.log("[v0] Cancelling subscription:", subscriptionId)
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("subscription_id", subscriptionId)
    }

    if (event_type === "BILLING.SUBSCRIPTION.SUSPENDED") {
      const subscriptionId = resource.id
      console.log("[v0] Suspending subscription:", subscriptionId)
      await supabase.from("subscriptions").update({ status: "suspended" }).eq("subscription_id", subscriptionId)
    }

    if (event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = resource.id
      const amount = resource.purchase_units?.[0]?.amount?.value
      const currency = resource.purchase_units?.[0]?.amount?.currency_code
      const email = resource.payer?.email_address

      console.log("[v0] Processing order approval:", {
        orderId,
        amount,
        currency,
        email,
      })

      const accessKey = generateAccessKey()
      const userId = await getUserIdByEmail(email)

      const { data, error } = await supabase
        .from("purchases")
        .insert({
          payment_id: orderId,
          payment_type: "onetime",
          amount: Number.parseFloat(amount),
          currency: currency,
          status: "completed",
          customer_email: email,
          access_key: accessKey,
          paypal_data: resource,
          user_id: userId,
        })
        .select()

      if (error) {
        console.error("[v0] Error inserting one-time purchase:", error)
      } else {
        console.log("[v0] One-time purchase inserted successfully:", data)
      }
    }

    console.log("[v0] Webhook processed successfully")
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
