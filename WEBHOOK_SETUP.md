# PayPal Webhook Setup Instructions

## 1. Get Your Webhook URL
Your webhook endpoint is: `https://v0-paypal-subscription-setup.vercel.app/api/paypal/webhook`

## 2. Create Webhook in PayPal Dashboard

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to **Apps & Credentials**
3. Select your app (or create one if needed)
4. Scroll down to **Webhooks** section
5. Click **Add Webhook**

## 3. Configure Webhook

- **Webhook URL**: `https://v0-paypal-subscription-setup.vercel.app/api/paypal/webhook`
- **Event types** to subscribe to:
  - `BILLING.SUBSCRIPTION.ACTIVATED`
  - `BILLING.SUBSCRIPTION.CANCELLED`
  - `BILLING.SUBSCRIPTION.SUSPENDED`
  - `PAYMENT.SALE.COMPLETED`
  - `CHECKOUT.ORDER.APPROVED`

## 4. Get Webhook ID

After creating the webhook, copy the **Webhook ID** shown in the dashboard.

## 5. Add Webhook ID to Environment Variables

Add this environment variable in your Vercel project or .env file:

```
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

## 6. Test Webhook

PayPal provides a webhook simulator in the dashboard to test events. Use it to verify your webhook is receiving and processing events correctly.

## How It Works

1. **Customer Completes Payment** → PayPal processes the transaction
2. **PayPal Sends Webhook** → Your endpoint receives the event
3. **Signature Verification** → Ensures the webhook is from PayPal
4. **Store in Database** → Payment details saved to Supabase
5. **Generate Access Key** → Unique key created and stored

## Database Tables

### `subscriptions`
- Stores recurring subscription information
- Tracks renewal dates and payment status
- Links subscription ID to access keys

### `purchases`
- Stores all payment transactions (one-time and subscription payments)
- Includes PayPal transaction details
- Links payment IDs to access keys

## Monitoring

Check your Vercel deployment logs to see webhook events being processed:
- Look for `[v0] PayPal webhook event:` logs
- Verify successful database insertions
- Monitor for any errors in signature verification
