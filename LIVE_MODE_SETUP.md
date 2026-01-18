# PayPal Live Mode Setup

## Switching from Sandbox to Live Mode

To use your live PayPal credentials instead of sandbox:

### 1. Get Live Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Toggle from "Sandbox" to "Live" mode in the top-right corner
3. Navigate to "Apps & Credentials"
4. Copy your **Live Client ID** and **Live Secret Key**

### 2. Create Live Subscription Plan

1. In the PayPal Developer Dashboard (Live mode)
2. Go to "Products" → "Subscriptions"
3. Create a new subscription plan with your pricing ($19.99/month)
4. Copy the **Plan ID** once created

### 3. Set Up Live Webhook

1. In PayPal Dashboard (Live mode), go to "Webhooks"
2. Create a new webhook with URL: `https://your-domain.com/api/paypal/webhook`
3. Select these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`
4. Copy the **Webhook ID**

### 4. Update Environment Variables

Replace these environment variables in your Vercel project with your **live** credentials:

```
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret-key
PAYPAL_MONTHLY_PLAN_ID=your-live-plan-id
PAYPAL_WEBHOOK_ID=your-live-webhook-id
```

### 5. Important Notes

- The PayPal SDK automatically detects live vs sandbox based on your Client ID
- Live Client IDs start with `A` while sandbox IDs typically contain different patterns
- Test thoroughly in sandbox before switching to live
- Monitor webhook deliveries in PayPal Dashboard → Webhooks → Your webhook → Recent deliveries
- All API endpoints remain the same (`https://api-m.paypal.com`) for live mode

### 6. Verification

After updating credentials:
1. Clear your browser cache
2. Try creating a test subscription/payment with a real PayPal account (will charge real money)
3. Check the Supabase database to ensure records are created
4. Verify webhook events are received in PayPal Dashboard

### Security Checklist

- ✅ Never commit live credentials to git
- ✅ Use environment variables only
- ✅ Webhook verification is enabled
- ✅ SSL/HTTPS is enabled on your domain
- ✅ Row Level Security (RLS) is enabled on database tables
