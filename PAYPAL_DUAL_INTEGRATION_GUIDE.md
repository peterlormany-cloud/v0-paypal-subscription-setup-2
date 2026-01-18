# PayPal Dual Integration: Subscriptions + One-Time Payments

This guide shows how to load **both** PayPal subscription buttons and one-time payment buttons on the same page using separate namespaces.

## The Problem

You can't load the PayPal SDK twice with different intents (`subscription` vs `capture`) on the same page normally. It causes conflicts.

## The Solution

Use PayPal's `data-namespace` attribute to load two separate instances of the SDK with different names.

## Step 1: Load Both Scripts with Namespaces

```typescript
// Load subscription SDK
const subscriptionScript = document.createElement("script")
subscriptionScript.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`
subscriptionScript.setAttribute("data-namespace", "paypal_subscriptions")
subscriptionScript.async = true

// Load one-time payment SDK
const onetimeScript = document.createElement("script")
onetimeScript.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&intent=capture`
onetimeScript.setAttribute("data-namespace", "paypal_onetime")
onetimeScript.async = true

// Wait for both to load
let scriptsLoaded = 0
const checkBothLoaded = () => {
  scriptsLoaded++
  if (scriptsLoaded === 2) {
    renderButtons()
  }
}

subscriptionScript.onload = checkBothLoaded
onetimeScript.onload = checkBothLoaded

document.body.appendChild(subscriptionScript)
document.body.appendChild(onetimeScript)
```

## Step 2: Declare Window Types

```typescript
declare global {
  interface Window {
    paypal_subscriptions?: any
    paypal_onetime?: any
  }
}
```

## Step 3: Render Subscription Button

```typescript
// Use window.paypal_subscriptions for subscription buttons
if (window.paypal_subscriptions) {
  window.paypal_subscriptions.Buttons({
    style: {
      color: "gold",
      shape: "rect",
      label: "paypal",
    },
    createSubscription: (data: any, actions: any) =>
      actions.subscription.create({
        plan_id: planId,
        subscriber: {
          email_address: user?.email,
        },
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${window.location.origin}/success`,
        },
      }),
    onApprove: async (data: any) => {
      console.log("Subscription ID:", data.subscriptionID)
      // Store subscription in database
      // Redirect to success page
      window.location.href = `/success?subscription_id=${data.subscriptionID}`
    },
    onError: (err: any) => {
      console.error("PayPal subscription error:", err)
    },
  }).render("#paypal-button-subscription")
}
```

## Step 4: Render One-Time Payment Button

```typescript
// Use window.paypal_onetime for one-time payment buttons
if (window.paypal_onetime) {
  window.paypal_onetime.Buttons({
    style: {
      color: "blue",
      shape: "rect",
      label: "paypal",
    },
    createOrder: (data: any, actions: any) =>
      actions.order.create({
        purchase_units: [
          {
            amount: {
              value: "1.00",
            },
          },
        ],
        payer: {
          email_address: user?.email,
        },
        application_context: {
          shipping_preference: "NO_SHIPPING",
          return_url: `${window.location.origin}/success`,
        },
      }),
    onApprove: async (data: any, actions: any) => {
      const details = await actions.order.capture()
      console.log("Order ID:", data.orderID)
      // Store purchase in database
      // Redirect to success page
      window.location.href = `/success?order_id=${data.orderID}`
    },
    onError: (err: any) => {
      console.error("PayPal one-time payment error:", err)
    },
  }).render("#paypal-button-onetime")
}
```

## Step 5: HTML Containers

```html
<!-- Subscription button container -->
<div id="paypal-button-subscription"></div>

<!-- One-time payment button container -->
<div id="paypal-button-onetime"></div>
```

## Key Points

1. **Different Namespaces**: `paypal_subscriptions` vs `paypal_onetime`
2. **Different Intents**: `intent=subscription` vs `intent=capture`
3. **Different Methods**: 
   - Subscriptions use `createSubscription()` and return `data.subscriptionID`
   - One-time uses `createOrder()` and returns `data.orderID`
4. **Wait for Both**: Make sure both scripts load before rendering buttons
5. **Clear Containers**: Clear `innerHTML` before re-rendering to avoid duplicates

## Full useEffect Hook

```typescript
useEffect(() => {
  if (loading || !clientId || paypalLoaded) return

  const subscriptionScript = document.createElement("script")
  subscriptionScript.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`
  subscriptionScript.setAttribute("data-namespace", "paypal_subscriptions")
  subscriptionScript.async = true

  const onetimeScript = document.createElement("script")
  onetimeScript.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&intent=capture`
  onetimeScript.setAttribute("data-namespace", "paypal_onetime")
  onetimeScript.async = true

  let scriptsLoaded = 0
  const checkBothLoaded = () => {
    scriptsLoaded++
    if (scriptsLoaded === 2) {
      setPaypalLoaded(true)
      setTimeout(renderButtons, 100)
    }
  }

  subscriptionScript.onload = checkBothLoaded
  onetimeScript.onload = checkBothLoaded

  document.body.appendChild(subscriptionScript)
  document.body.appendChild(onetimeScript)

  return () => {
    if (document.body.contains(subscriptionScript)) {
      document.body.removeChild(subscriptionScript)
    }
    if (document.body.contains(onetimeScript)) {
      document.body.removeChild(onetimeScript)
    }
  }
}, [loading, clientId, paypalLoaded])
```

## Environment Variables Needed

```env
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_MONTHLY_PLAN_ID=P-xxxxxxxxxxxxxx
PAYPAL_WEBHOOK_ID=your_webhook_id
```

That's it! You now have both subscription and one-time payment buttons working on the same page without conflicts.
