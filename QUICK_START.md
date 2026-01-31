# Quick Start Guide - Stripe Payment Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Get Stripe Keys (2 min)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "API Keys"
3. Copy your test keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### Step 2: Add Environment Variables (1 min)

**Option A: Local Development (.env.local)**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

**Option B: Vercel Project**
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
3. Add `STRIPE_SECRET_KEY` = `sk_test_...`

### Step 3: Test Payment Flow (2 min)

1. Go to dashboard and create a parking booking
2. Click "Complete Payment"
3. Use test card: `4242 4242 4242 4242`
4. Any future date (MM/YY) and any 3-digit CVC
5. ✅ Payment succeeds and QR code appears

## 📋 Payment URLs

```
Initiate Payment:
GET /dashboard/payment?bookingId=BOOKING_ID&amount=150

Payment Page:
GET /dashboard/payment

Success Redirect:
GET /dashboard/payment?success=true&bookingId=BOOKING_ID
```

## 🧪 Test Scenarios

### ✅ Successful Payment
- Card: `4242 4242 4242 4242`
- Expected: Payment succeeds, QR code displays

### ❌ Payment Declined
- Card: `4000 0000 0000 0002`
- Expected: Error message, retry allowed

### 🔐 3D Secure (2FA)
- Card: `4000 0025 0000 3155`
- Expected: Additional authentication prompt

## 📱 QR Code Details

```json
{
  "bookingId": "booking_123",
  "slotId": "slot_456",
  "vehicleNumber": "MH01AB1234",
  "validFrom": "2024-01-31T10:00:00Z",
  "validTo": "2024-01-31T14:00:00Z"
}
```

## 🔑 Component Usage

### Use CheckoutForm
```tsx
import { CheckoutForm } from '@/components/checkout-form';
import { StripeProvider } from '@/components/stripe-provider';

<StripeProvider clientSecret={clientSecret}>
  <CheckoutForm
    bookingId="booking_123"
    amount={150}
    onSuccess={(paymentIntentId) => {
      // Handle success
    }}
  />
</StripeProvider>
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `/app/api/create-payment-intent/route.ts` | Create PaymentIntent |
| `/app/api/payments/route.ts` | Confirm & update payment |
| `/components/checkout-form.tsx` | Payment form component |
| `/components/stripe-provider.tsx` | Stripe configuration |
| `/app/(dashboard)/dashboard/payment/page.tsx` | Payment page |

## ⚙️ Environment Variables

```env
# REQUIRED
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# REQUIRED (Server-side only)
STRIPE_SECRET_KEY=sk_test_...

# OPTIONAL (MongoDB)
MONGODB_URI=mongodb://...
```

## 🔄 API Endpoints

### Create PaymentIntent
```bash
POST /api/create-payment-intent
Content-Type: application/json

{
  "bookingId": "booking_123",
  "amount": 150
}

Response:
{
  "clientSecret": "pi_1234_secret_5678",
  "paymentIntentId": "pi_1234"
}
```

### Confirm Payment
```bash
POST /api/payments
Content-Type: application/json

{
  "bookingId": "booking_123",
  "paymentMethod": "stripe_card",
  "paymentIntentId": "pi_1234"
}

Response:
{
  "message": "Payment successful",
  "booking": { ... },
  "qrCode": "base64_encoded_qr"
}
```

## ❌ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Stripe key not found" | Check .env.local has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| PaymentElement blank | Verify `clientSecret` is passed to StripeProvider |
| "Booking not found" | Ensure booking exists and bookingId is correct |
| QR code doesn't show | Check payment status is "confirmed" |
| CORS error | Stripe domain should be whitelisted (usually automatic) |

## 🚀 Production Deployment

1. Get live Stripe keys from dashboard
2. Update environment variables:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
3. Deploy to production
4. Test with live card numbers from your test account
5. Monitor Stripe dashboard for transactions

## 📚 Documentation

- Full guide: `/STRIPE_INTEGRATION.md`
- Implementation details: `/IMPLEMENTATION_SUMMARY.md`
- Stripe docs: https://stripe.com/docs

## 💡 Tips

✅ **Always use test keys during development**
✅ **Check Stripe logs if payment fails**
✅ **QR codes include booking validity period**
✅ **Payment failures prevent booking confirmation**
✅ **Use browser dev tools to debug issues**

## 📞 Support

1. Check browser console for errors
2. Review server logs: `npm run dev` output
3. Verify environment variables are set
4. Test with Stripe test cards
5. Check Stripe dashboard event logs

---

**Ready? Let's go! 🎉**

Just add your Stripe keys and start testing payments!
