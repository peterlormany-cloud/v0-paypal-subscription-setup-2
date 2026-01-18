# Switch from Sandbox to Live PayPal Mode

## Step 1: Create/Access PayPal Business Account

1. Go to [paypal.com/business](https://www.paypal.com/business)
2. Sign in or create a business account
3. Complete business verification (required for live payments)
   - Provide business information
   - Verify bank account
   - Confirm identity documents

## Step 2: Get Live API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click **"Apps & Credentials"** in the left menu
3. Switch to **"Live"** tab at the top (important!)
4. Click **"Create App"**
   - App Name: "Your Website Name" (e.g., "My Subscription Site")
   - App Type: Select "Merchant"
5. After creation, you'll see:
   - **Client ID** - Copy this for `PAYPAL_CLIENT_ID`
   - Click **"Show"** under Secret - Copy this for `PAYPAL_CLIENT_SECRET`

## Step 3: Create Live Subscription Plan

1. Go to [PayPal Subscriptions](https://www.paypal.com/billing/plans)
2. Click **"Create Plan"**
3. Configure your subscription:
   - Plan Name: "Monthly Subscription" (or your preference)
   - Billing Cycle: Monthly
   - Price: Set your price
   - Currency: USD (or your preference)
4. Click **"Save"**
5. Copy the **Plan ID** for `PAYPAL_MONTHLY_PLAN_ID`

## Step 4: Set Up Live Webhooks

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click **"Apps & Credentials"**
3. Make sure you're on **"Live"** tab
4. Click on your app name
5. Scroll to **"Webhooks"** section
6. Click **"Add Webhook"**
7. Configure:
   - Webhook URL: `https://your-domain.com/api/paypal/webhook`
   - Event types to subscribe to:
     - ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
     - ✅ `BILLING.SUBSCRIPTION.CANCELLED`
     - ✅ `BILLING.SUBSCRIPTION.SUSPENDED`
     - ✅ `BILLING.SUBSCRIPTION.EXPIRED`
     - ✅ `PAYMENT.SALE.COMPLETED`
8. Click **"Save"**
9. Copy the **Webhook ID** for `PAYPAL_WEBHOOK_ID`

## Step 5: Update Environment Variables in Vercel

Go to your Vercel project settings and update these variables:

```
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_client_secret_here
PAYPAL_MONTHLY_PLAN_ID=your_live_plan_id_here
PAYPAL_WEBHOOK_ID=your_live_webhook_id_here
```

**Important:** 
- Replace the sandbox values with live values
- Make sure you're copying from the **"Live"** tab, NOT "Sandbox"
- Keep your `PAYPAL_CLIENT_SECRET` secure - never share it

## Step 6: Redeploy Your Application

After updating environment variables:
1. Go to Vercel Dashboard
2. Click **"Redeploy"** on your latest deployment
3. Or push a new commit to trigger automatic deployment

## Step 7: Test Live Payment

1. Go to your website
2. Try subscribing with a **real payment method**
3. Check your PayPal business account to see the payment
4. Check your dashboard to see the subscription

## Important Notes

### Live Mode Requirements
- ✅ Business account verified
- ✅ Bank account linked
- ✅ Real payment methods only (no test cards)
- ✅ Real money will be charged

### Differences from Sandbox
- **Sandbox**: Test mode, fake money, test accounts
- **Live**: Production mode, real money, real customers

### Testing Live Mode Safely
- Set a low test price (e.g., $0.01) initially
- Test with your own payment method
- Refund test transactions from PayPal Dashboard

### Webhook Testing
After going live, test that webhooks work:
1. Make a test subscription
2. Check Vercel logs for webhook events
3. Verify data appears in your dashboard

### Troubleshooting

**Webhooks not working?**
- Verify webhook URL is correct
- Check Vercel logs for incoming requests
- Verify all event types are selected
- Make sure your domain has HTTPS

**Payments failing?**
- Verify live credentials are correct
- Check PayPal account is verified
- Ensure plan ID is from live mode, not sandbox

**API errors?**
- Make sure you're using credentials from "Live" tab
- Check that client secret is correct (they start with `EP` for live)

## Getting Help

If you need help:
1. Check [PayPal Developer Docs](https://developer.paypal.com/docs/)
2. View PayPal Dashboard activity logs
3. Check Vercel function logs
4. Verify all environment variables are set correctly

---

**Ready to go live!** 🚀 Follow these steps carefully and you'll be accepting real payments in no time.
