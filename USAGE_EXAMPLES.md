# Stripe Payment Integration - Usage Examples

## 1. Basic Payment Flow

### Initiating a Payment

```typescript
// On booking confirmation, redirect to payment page
import { useRouter } from 'next/navigation';

export function BookingConfirm() {
  const router = useRouter();
  
  const handlePayment = (bookingId: string, amount: number) => {
    router.push(`/dashboard/payment?bookingId=${bookingId}&amount=${amount}`);
  };
  
  return (
    <button onClick={() => handlePayment('booking_123', 150)}>
      Proceed to Payment
    </button>
  );
}
```

## 2. Payment Page Component

The payment page automatically:
1. Fetches booking details
2. Creates a PaymentIntent
3. Initializes Stripe Elements
4. Displays the checkout form
5. Processes the payment
6. Shows success with QR code

**No additional code needed** - it's all configured!

## 3. Creating PaymentIntent (Server)

```typescript
// /app/api/create-payment-intent/route.ts

export async function POST(request: NextRequest) {
  const { bookingId, amount } = await request.json();
  
  // This creates a PaymentIntent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'inr',
    metadata: { bookingId },
    automatic_payment_methods: { enabled: true },
  });
  
  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  });
}
```

## 4. Using CheckoutForm Component

```typescript
'use client';

import { CheckoutForm } from '@/components/checkout-form';
import { StripeProvider } from '@/components/stripe-provider';

export function PaymentWidget() {
  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {
    // Initialize PaymentIntent
    const initPayment = async () => {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: 'booking_123',
          amount: 150,
        }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
    };
    
    initPayment();
  }, []);
  
  return (
    <StripeProvider clientSecret={clientSecret}>
      <CheckoutForm
        bookingId="booking_123"
        amount={150}
        onSuccess={(paymentIntentId) => {
          console.log('Payment successful:', paymentIntentId);
          // Redirect or show success message
        }}
      />
    </StripeProvider>
  );
}
```

## 5. Confirming Payment (Server)

```typescript
// /app/api/payments/route.ts

export async function POST(request: NextRequest) {
  const { bookingId, paymentIntentId } = await request.json();
  
  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
    // Update booking in database
    const booking = await Booking.findById(bookingId);
    booking.status = 'confirmed';
    booking.paymentId = paymentRecord._id;
    booking.qrCode = generateQRCode(bookingId);
    await booking.save();
    
    // Update parking slot
    await ParkingSlot.findByIdAndUpdate(booking.slotId, {
      status: 'booked',
    });
    
    return NextResponse.json({
      success: true,
      qrCode: booking.qrCode,
    });
  }
}
```

## 6. Handling Payment Success

```typescript
// In checkout-form.tsx

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/dashboard/payment?success=true`,
    },
  });
  
  if (paymentIntent?.status === 'succeeded') {
    // Call confirmation endpoint
    const res = await fetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        paymentIntentId: paymentIntent.id,
      }),
    });
    
    // Show success screen with QR code
    onSuccess?.(paymentIntent.id);
  }
};
```

## 7. QR Code Data Structure

```typescript
// QR code contains:
const qrData = {
  bookingId: 'booking_123',
  slotId: 'slot_456',
  vehicleNumber: 'MH01AB1234',
  validFrom: '2024-01-31T10:00:00Z',
  validTo: '2024-01-31T14:00:00Z',
};

// Encoded as base64 for storage
const encoded = Buffer.from(JSON.stringify(qrData)).toString('base64');
```

## 8. Environment Setup

```bash
# .env.local (Development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890
STRIPE_SECRET_KEY=sk_test_0987654321

# For production, use live keys:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_0987654321
STRIPE_SECRET_KEY=sk_live_1234567890
```

## 9. Error Handling Examples

```typescript
// Handle declined cards
if (error?.type === 'card_error') {
  toast.error(`Card error: ${error.message}`);
  // e.g., "Your card was declined"
}

// Handle network errors
if (error?.type === 'validation_error') {
  toast.error(`Validation error: ${error.message}`);
  // e.g., "Invalid CVC"
}

// Handle Stripe errors
if (error?.type === 'stripe_error') {
  toast.error('Payment processing failed');
  // e.g., Stripe API errors
}
```

## 10. Complete Payment Flow Example

```typescript
// Example: Complete booking with payment

export async function completeBooking(bookingData: BookingData) {
  // 1. Create booking
  const booking = await Booking.create(bookingData);
  
  // 2. Redirect to payment
  router.push(
    `/dashboard/payment?bookingId=${booking._id}&amount=${booking.totalAmount}`
  );
  
  // Payment page automatically:
  // 3. Creates PaymentIntent
  // 4. Shows Stripe checkout form
  // 5. User enters payment details
  // 6. Confirms payment
  // 7. Updates booking status
  // 8. Generates QR code
  // 9. Shows success screen
}
```

## 11. Testing with Mock Data

```typescript
// Test with Stripe test cards

const testCards = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  requiresAuth: '4000 0025 0000 3155',
};

// Any future expiry date (MM/YY)
// Any 3-digit CVC
// Any zip code
```

## 12. Monitoring Payment Status

```typescript
// Check booking payment status
export async function getBookingStatus(bookingId: string) {
  const booking = await Booking.findById(bookingId).populate('paymentId');
  
  return {
    bookingId: booking._id,
    status: booking.status, // pending | confirmed | active | completed
    paymentStatus: booking.paymentId?.status, // pending | processing | completed
    qrCode: booking.qrCode,
    amount: booking.totalAmount,
  };
}
```

## 13. Webhook Handling (Optional)

```typescript
// /app/api/webhooks/stripe/route.ts

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature') || '';
  const body = await request.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update booking status
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      // Handle payment failure
      await handlePaymentFailure(event.data.object);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

## 14. Custom Stripe Appearance

```typescript
// Customize PaymentElement appearance

const stripeOptions: StripeElementsOptions = {
  clientSecret,
  appearance: {
    theme: 'night', // dark | light | stripe
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#1f2937',
      colorText: '#f3f4f6',
      colorError: '#ef4444',
      borderRadius: '0.5rem',
      fontSizeBase: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    rules: {
      '.Input': {
        padding: '12px',
      },
      '.Input:focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
      },
    },
  },
};
```

## 15. Loading States

```typescript
// Show loading states during payment

export function PaymentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  return (
    <>
      {isLoading ? (
        <div className="animate-pulse">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <CheckoutForm
          isLoading={paymentProcessing}
          onSuccess={() => setPaymentProcessing(true)}
        />
      )}
    </>
  );
}
```

## 16. Refund Handling

```typescript
// Process refunds after payment

export async function refundPayment(paymentIntentId: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    
    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        status: 'refunded',
        refundAmount: refund.amount / 100,
        refundReason: 'User requested',
      }
    );
    
    // Update booking status
    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: 'cancelled',
    });
    
    return { success: true, refundId: refund.id };
  } catch (error) {
    console.error('Refund failed:', error);
    return { success: false, error };
  }
}
```

---

## 🎯 Common Patterns

### Pattern 1: Simple Payment
```
Booking Created → Payment Page → Stripe Elements → Success QR Code
```

### Pattern 2: With Verification
```
Booking → Payment → Verify with Backend → Update DB → Show QR
```

### Pattern 3: With Webhook
```
Booking → Payment → Stripe → Webhook → Update DB → Notify User
```

## 📝 Notes

- All payment amounts are in rupees (INR)
- QR codes encode booking metadata for verification
- Stripe handles PCI compliance (no card data stored)
- Test cards are valid only in test mode
- Live keys are required for production payments
- Webhook handlers are optional but recommended

---

**Ready to integrate? Start with `/QUICK_START.md`! 🚀**
