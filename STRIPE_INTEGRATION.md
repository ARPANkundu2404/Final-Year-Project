# Stripe Integration for Smart Parking System

## Overview

This Smart Parking System now features a complete Stripe payment integration with PaymentElement for secure, PCI-compliant card processing. The system generates QR codes after successful payment for entry/exit at parking locations.

## Features

✅ **Stripe PaymentElement** - Secure, modern payment UI with support for multiple payment methods
✅ **QR Code Generation** - Automatic QR code creation containing booking details
✅ **Payment Intent Flow** - Client-server architecture for secure payment handling
✅ **Modern UI** - Glassmorphic design with responsive layout
✅ **Error Handling** - Comprehensive error messages and user feedback
✅ **Booking Integration** - Seamless booking status updates after payment

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API Keys
3. Copy your:
   - **Publishable Key** (starts with `pk_live_` or `pk_test_`)
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)

### 2. Add Environment Variables

Add the following to your `.env.local` or Vercel project settings:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**Important:**
- `NEXT_PUBLIC_` prefix allows the publishable key to be used in the browser
- Keep your secret key private - never commit it to version control
- Use test keys (`pk_test_`, `sk_test_`) for development
- Switch to live keys (`pk_live_`, `sk_live_`) for production

### 3. Install Dependencies

The required packages are already added to `package.json`:
- `@stripe/react-stripe-js` - React bindings for Stripe
- `@stripe/stripe-js` - Stripe JavaScript SDK

Run `npm install` or `yarn install` to ensure they're installed.

## Architecture

### Frontend Flow

1. **Payment Page** (`/app/(dashboard)/dashboard/payment/page.tsx`)
   - Displays booking summary
   - Initializes Stripe Elements
   - Shows checkout form

2. **CheckoutForm Component** (`/components/checkout-form.tsx`)
   - PaymentElement for secure card input
   - Form submission handling
   - Error state management

3. **StripeProvider** (`/components/stripe-provider.tsx`)
   - Wraps payment components with Stripe context
   - Configures Stripe appearance (dark theme)
   - Manages client secret

### Backend Flow

1. **Create Payment Intent** (`/app/api/create-payment-intent/route.ts`)
   - Creates a Stripe PaymentIntent
   - Returns client secret to frontend
   - Includes booking metadata

2. **Process Payment** (`/app/api/payments/route.ts`)
   - Verifies payment completion
   - Updates booking status to "confirmed"
   - Generates QR code
   - Updates parking slot status

## File Structure

```
app/
├── api/
│   ├── create-payment-intent/route.ts  # PaymentIntent creation
│   └── payments/route.ts               # Payment confirmation
└── (dashboard)/dashboard/payment/
    └── page.tsx                        # Payment page

components/
├── checkout-form.tsx                   # Stripe PaymentElement form
├── stripe-provider.tsx                 # Stripe context provider
└── ui/                                 # Shadcn UI components

lib/
└── models/Payment.ts                   # Payment model with Stripe fields
```

## Payment Flow Diagram

```
User initiates payment
         ↓
Frontend requests PaymentIntent
         ↓
Backend creates PaymentIntent via Stripe API
         ↓
Frontend receives clientSecret
         ↓
User enters payment details
         ↓
Frontend confirms payment with Stripe
         ↓
Stripe processes payment
         ↓
Frontend calls webhook/confirmation endpoint
         ↓
Backend updates booking & generates QR code
         ↓
QR Code displayed to user
```

## Key Components

### CheckoutForm Component

```tsx
<CheckoutForm
  bookingId="booking_123"
  amount={150}
  onSuccess={(paymentIntentId) => {
    // Handle successful payment
  }}
/>
```

**Props:**
- `bookingId` (string) - ID of the booking being paid for
- `amount` (number) - Amount in rupees
- `onSuccess` (callback) - Called when payment succeeds
- `isLoading` (boolean) - Loading state

### StripeProvider Component

```tsx
<StripeProvider clientSecret={clientSecret}>
  <CheckoutForm {...props} />
</StripeProvider>
```

**Props:**
- `clientSecret` (string) - Stripe client secret from API
- `children` (ReactNode) - Components to wrap

## API Endpoints

### POST /api/create-payment-intent

Creates a Stripe PaymentIntent for payment processing.

**Request:**
```json
{
  "bookingId": "booking_123",
  "amount": 150
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234_secret_5678",
  "paymentIntentId": "pi_1234"
}
```

**Errors:**
- `401` - Authentication required
- `400` - Missing bookingId or amount
- `500` - Stripe API error

### POST /api/payments

Confirms payment and updates booking status.

**Request:**
```json
{
  "bookingId": "booking_123",
  "paymentMethod": "stripe_card",
  "paymentIntentId": "pi_1234"
}
```

**Response:**
```json
{
  "message": "Payment successful",
  "payment": { ... },
  "booking": { ... },
  "qrCode": "base64_encoded_qr_data"
}
```

## QR Code Details

The generated QR code contains:
```json
{
  "bookingId": "booking_123",
  "slotId": "slot_456",
  "vehicleNumber": "MH01AB1234",
  "validFrom": "2024-01-31T10:00:00Z",
  "validTo": "2024-01-31T14:00:00Z"
}
```

Users display this QR code at the parking entrance for:
- Entry verification
- Exit confirmation
- Booking validation

## Error Handling

### Common Errors

**"Stripe not loaded"**
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check network connectivity

**"Authentication required"**
- User must be logged in
- Check auth cookies/tokens

**"Booking is not pending payment"**
- Booking was already paid or cancelled
- Cannot process payment twice

**"Failed to initialize payment"**
- Check API connectivity
- Verify `STRIPE_SECRET_KEY` is set

### User-Facing Messages

The component displays toast notifications for:
- ✅ Successful payments
- ❌ Failed payments
- ℹ️ Processing states
- ⚠️ Validation errors

## Testing

### Test Mode (Development)

1. Use Stripe test keys (pk_test_*, sk_test_*)
2. Use test card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **3D Secure**: 4000 0025 0000 3155

3. Any future expiry date (MM/YY format)
4. Any 3-digit CVC

### Webhook Testing (Optional)

For production, implement webhook handlers:
```typescript
// POST /api/webhooks/stripe
// Handle events: payment_intent.succeeded, payment_intent.payment_failed
```

## Security Considerations

✅ **PCI Compliance** - Stripe handles card data, not stored on server
✅ **HTTPS Only** - Payments encrypted in transit
✅ **Secret Key Protected** - Only used server-side
✅ **CORS Configured** - Stripe domain whitelisted
✅ **Input Validation** - All payment data validated
✅ **User Authorization** - Payment only for own bookings

## Troubleshooting

### "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found"

**Solution:** Add the environment variable to `.env.local` or Vercel project settings.

### PaymentElement not appearing

**Solution:** 
1. Check browser console for errors
2. Verify clientSecret is being passed
3. Ensure Stripe is initialized correctly

### Payment processes but booking not updated

**Solution:**
1. Check server logs for errors
2. Verify database connection
3. Ensure `/api/payments` endpoint is accessible

### QR Code not displaying

**Solution:**
1. Check if booking status is "confirmed"
2. Verify QR code data is being generated
3. Check browser console for rendering errors

## Production Deployment

1. **Update to Live Keys**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   STRIPE_SECRET_KEY=sk_live_your_key
   ```

2. **Enable Webhooks**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Subscribe to: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Test Live Mode**
   - Use live card numbers from your test account
   - Monitor Stripe Dashboard for transactions

4. **Monitoring**
   - Set up Stripe event notifications
   - Monitor API error rates
   - Track payment success rates

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For app-specific issues:
- Check application logs
- Review error messages in UI
- Verify environment variables

## Future Enhancements

- [ ] Webhook event handling
- [ ] Payment history/receipts
- [ ] Refund processing
- [ ] Subscription support
- [ ] Multiple payment methods UI
- [ ] Invoice generation
- [ ] Email receipts
