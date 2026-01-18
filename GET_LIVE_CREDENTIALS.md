# Get Your Live PayPal Credentials - Step by Step

Perfect! You set your subscription price to **$8.00 USD per month**. Now let's get all the live credentials you need.

## What You Need to Update

You need to replace these 4 environment variables with LIVE values:
- `PAYPAL_CLIENT_ID` (currently sandbox)
- `PAYPAL_CLIENT_SECRET` (currently sandbox)
- `PAYPAL_MONTHLY_PLAN_ID` (currently sandbox)
- `PAYPAL_WEBHOOK_ID` (currently sandbox)

---

## FROM YOUR PAYPAL BUTTON CODE:

I can see you already have these from PayPal:
- ✅ **Live Client ID:** `AaCKa5NNxYUHt-_pKREGClU0bA1X_WXR03SIKgPA8CF1cGcsJmop_IXR49eGKTttVUQSOCe8v5bX5jkw`
- ✅ **Live Plan ID:** `P-6N09394829919594RNFQTQBA`

You still need to get:
- ❌ **Client Secret**
- ❌ **Webhook ID**

---

## STEP 1: Get Live Client Secret

You already have the Client ID, now you need the secret:

1. **Go to:** https://developer.paypal.com/dashboard/
2. **Click:** "Apps & Credentials" (left sidebar)
3. **IMPORTANT:** Click the **"Live"** tab at the top (not Sandbox!)
4. **Find your app** (the one with Client ID starting with `AaCKa5NNxYUHt...`)
5. **Click** on the app name
6. **Find "Secret"** and click **"Show"**
7. **Copy it** → This is your `PAYPAL_CLIENT_SECRET`

**What it looks like:**
- Secret: `EPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (starts with EP for live)

---

## STEP 2: Get Live Webhook ID

1. **Stay in:** https://developer.paypal.com/dashboard/
2. **Make sure:** You're on **"Live"** tab
3. **Click:** Your app name (from Step 1)
4. **Scroll down to:** "Webhooks" section
5. **Click:** "Add Webhook"
6. **Enter Webhook URL:** 
   ```
   https://your-actual-domain.vercel.app/api/paypal/webhook
   ```
   (Replace `your-actual-domain` with your real Vercel URL)

7. **Select these event types:**
   - ✅ Billing subscription activated
   - ✅ Billing subscription cancelled  
   - ✅ Billing subscription suspended
   - ✅ Billing subscription expired
   - ✅ Payment sale completed

8. **Click:** "Save"
9. **Copy the Webhook ID** (shows after you save) → This is your `PAYPAL_WEBHOOK_ID`

**What it looks like:**
- Webhook ID: `WH-XXXXXXXXXX-XXXXXXXXXX` (starts with WH-)

---

## STEP 3: Update Vercel Environment Variables

1. **Go to:** https://vercel.com/dashboard
2. **Click:** Your project
3. **Click:** Settings → Environment Variables
4. **Find and UPDATE these 4 variables:**

```
PAYPAL_CLIENT_ID = AaCKa5NNxYUHt-_pKREGClU0bA1X_WXR03SIKgPA8CF1cGcsJmop_IXR49eGKTttVUQSOCe8v5bX5jkw

PAYPAL_CLIENT_SECRET = EP... (get this from Step 1)

PAYPAL_MONTHLY_PLAN_ID = P-6N09394829919594RNFQTQBA

PAYPAL_WEBHOOK_ID = WH-... (get this from Step 2)
```

**How to update:**
- Click the three dots next to each variable
- Click "Edit"
- Replace the sandbox value with your live value
- Click "Save"

---

## STEP 4: Redeploy

After updating all 4 variables:

1. Go to your Vercel project
2. Click "Deployments" tab
3. Click the three dots on the latest deployment
4. Click "Redeploy"

Or just push any change to your GitHub repo and it will redeploy automatically.

---

## Quick Summary

You already have 2 out of 4 values:
- ✅ PAYPAL_CLIENT_ID = `AaCKa5NNxYUHt-_pKREGClU0bA1X_WXR03SIKgPA8CF1cGcsJmop_IXR49eGKTttVUQSOCe8v5bX5jkw`
- ✅ PAYPAL_MONTHLY_PLAN_ID = `P-6N09394829919594RNFQTQBA`
- ❌ PAYPAL_CLIENT_SECRET = Get from PayPal Developer Dashboard → Apps & Credentials → Live → Your App → Show Secret
- ❌ PAYPAL_WEBHOOK_ID = Create webhook in PayPal Developer Dashboard → Live → Your App → Add Webhook

---

## Test Your Live Setup

1. Go to your website
2. Sign up with a real email
3. Subscribe using a REAL payment method
4. Check your PayPal business account for the $8 payment
5. Check your website dashboard to see the subscription

**Note:** Real money will be charged, so use your own card first!

---

Need me to help with anything specific? Let me know what step you're on!
