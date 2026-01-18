import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    clientId: process.env.PAYPAL_CLIENT_ID,
    planId: process.env.PAYPAL_MONTHLY_PLAN_ID,
  })
}
